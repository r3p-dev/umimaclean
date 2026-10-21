import { useEffect, useState } from 'react'
import type { PickupPoint } from '~/lib/location/point'
import { clockTime } from '~/lib/shared/date'
import { formatKm } from '~/lib/tasks/location'

const OSRM = 'https://router.project-osrm.org/route/v1/driving'

export type DrivingRoute = {
  path: PickupPoint[]
  distanceText: string
  durationText: string
  arrivalText: string
}

type RouteState = { key: string; route: DrivingRoute | null; hasFailed: boolean }

function routeKey(from: PickupPoint, to: PickupPoint) {
  return [from.lat.toFixed(3), from.lng.toFixed(3), to.lat.toFixed(5), to.lng.toFixed(5)].join(',')
}

export async function fetchRoute(from: PickupPoint, to: PickupPoint, signal: AbortSignal) {
  const url = `${OSRM}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error('route')
  }
  const data = (await response.json()) as {
    code: string
    routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[]
  }
  const best = data.code === 'Ok' ? data.routes?.[0] : undefined
  if (!best) {
    throw new Error('route')
  }
  const minutes = Math.max(1, Math.round(best.duration / 60))
  return {
    path: best.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
    distanceText: formatKm(best.distance / 1000),
    durationText: `${minutes} mnt`,
    arrivalText: clockTime(new Date(Date.now() + best.duration * 1000)),
  }
}

export function useDrivingRoute(
  from: PickupPoint | null,
  to: PickupPoint | null,
  isEnabled: boolean
) {
  const key = from && to ? routeKey(from, to) : ''
  const [state, setState] = useState<RouteState>({ key: '', route: null, hasFailed: false })

  useEffect(() => {
    if (!isEnabled || !key) {
      return
    }
    const [fromLat, fromLng, toLat, toLng] = key.split(',').map(Number)
    const controller = new AbortController()
    let isCancelled = false
    const timer = window.setTimeout(() => controller.abort(), 8000)
    fetchRoute({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng }, controller.signal)
      .then((route) => {
        if (!isCancelled) {
          setState({ key, route, hasFailed: false })
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setState({ key, route: null, hasFailed: true })
        }
      })
      .finally(() => window.clearTimeout(timer))
    return () => {
      isCancelled = true
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [isEnabled, key])

  const isCurrent = state.key === key
  return {
    route: isCurrent ? state.route : null,
    failed: isCurrent && state.hasFailed,
    loading: isEnabled && Boolean(key) && !isCurrent,
  }
}
