import env from '#start/env'
import type { Point } from '#models/service_area'
import type { RoadLeg, RoadRoute } from '#services/types'

type OsrmConfig = { url?: string; profile: string; timeoutMs: number }

type OsrmResponse = {
  code?: string
  message?: string
  routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[]
  distances?: (number | null)[][]
  durations?: (number | null)[][]
}

function coordinates(points: Point[]) {
  return points.map((point) => `${point.lng},${point.lat}`).join(';')
}

export default class OsrmGateway {
  #config: OsrmConfig

  constructor(config: Partial<OsrmConfig> = {}) {
    this.#config = {
      url: env.get('OSRM_URL'),
      profile: env.get('OSRM_PROFILE') ?? 'driving',
      timeoutMs: env.get('OSRM_TIMEOUT_MS') ?? 2000,
      ...config,
    }
  }

  async findRoute(from: Point, to: Point): Promise<RoadRoute | null> {
    const body = await this.#get('route', [from, to], 'overview=full&geometries=geojson')
    if (!body) {
      return null
    }
    const [route] = body.routes ?? []
    if (!route) {
      throw new Error('OSRM returned no route')
    }
    return {
      meters: route.distance,
      seconds: route.duration,
      path: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
    }
  }

  async findLegs(pairs: [Point, Point][]): Promise<(RoadLeg | null)[] | null> {
    const points: Point[] = []
    const indexOf = (point: Point) => {
      const found = points.findIndex((known) => known.lat === point.lat && known.lng === point.lng)
      return found >= 0 ? found : points.push(point) - 1
    }
    const indices = pairs.map(([from, to]) => [indexOf(from), indexOf(to)])
    const sources = [...new Set(indices.map(([from]) => from))]
    const destinations = [...new Set(indices.map(([, to]) => to))]
    const body = await this.#get(
      'table',
      points,
      `sources=${sources.join(';')}&destinations=${destinations.join(';')}&annotations=distance,duration`
    )
    if (!body) {
      return null
    }
    if (!body.distances || !body.durations) {
      throw new Error('OSRM returned no table')
    }
    return indices.map(([from, to]) => {
      const row = sources.indexOf(from)
      const column = destinations.indexOf(to)
      const distance = body.distances?.[row]?.[column]
      const duration = body.durations?.[row]?.[column]
      return typeof distance === 'number' && typeof duration === 'number'
        ? { meters: distance, seconds: duration }
        : null
    })
  }

  async findDurations(points: Point[]): Promise<(number | null)[][] | null> {
    const body = await this.#get('table', points, 'annotations=duration')
    if (!body) {
      return null
    }
    if (!body.durations) {
      throw new Error('OSRM returned no table')
    }
    return body.durations
  }

  async #get(service: 'route' | 'table', points: Point[], query: string) {
    if (!this.#config.url) {
      return null
    }
    const base = this.#config.url.replace(/\/+$/, '')
    const response = await fetch(
      `${base}/${service}/v1/${this.#config.profile}/${coordinates(points)}?${query}`,
      {
        headers: { 'accept': 'application/json', 'user-agent': 'UmimaClean-skripsi/1.0' },
        signal: AbortSignal.timeout(this.#config.timeoutMs),
      }
    )
    const body = (await response.json()) as OsrmResponse
    if (!response.ok || body.code !== 'Ok') {
      throw new Error(
        `OSRM ${service} failed: ${body.code ?? response.status} ${body.message ?? ''}`
      )
    }
    return body
  }
}
