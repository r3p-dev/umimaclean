import { useCallback, useEffect, useRef, useState } from 'react'
import { locateDevice } from '~/lib/location/point_lookup'
import { SERVICE_CENTER } from '~/lib/location/service_area'
import type { PickupPoint } from '~/lib/order/draft'

const PHOTON = 'https://photon.komoot.io'
const BANDUNG_RAYA_BBOX = '107.35,-7.20,107.95,-6.70'
const SUGGESTION_LIMIT = 5
const MIN_QUERY = 3

export type AddressSuggestion = {
  id: string
  title: string
  detail: string
  value: string
  point: PickupPoint
}

type PhotonFeature = {
  geometry: { coordinates: [number, number] }
  properties: {
    osm_type?: string
    osm_id?: number
    name?: string
    street?: string
    housenumber?: string
    locality?: string
    district?: string
    county?: string
    city?: string
    state?: string
  }
}

function unique(parts: (string | undefined | null)[], exclude: string[]) {
  const seen = new Set(exclude.map((part) => part.toLowerCase()))
  return parts.filter((part): part is string => {
    if (!part || seen.has(part.toLowerCase())) return false
    seen.add(part.toLowerCase())
    return true
  })
}

function toSuggestion({ geometry, properties: p }: PhotonFeature): AddressSuggestion | null {
  const street = p.street && (p.housenumber ? `${p.street} No. ${p.housenumber}` : p.street)
  const title = p.name ?? street
  if (!title) return null
  const kecamatan = p.county && !/^(kota|kabupaten|kab\.)\s/i.test(p.county) ? p.county : null
  const city = p.city ?? p.state
  const detail = unique(
    [p.name ? street : null, p.locality, p.district, kecamatan && `Kec. ${kecamatan}`, city],
    [title]
  )
  const value = unique([title, p.name ? street : null, p.district, kecamatan, city], [])
  return {
    id: `${p.osm_type ?? ''}${p.osm_id ?? title}`,
    title,
    detail: detail.join(', '),
    value: value.join(', '),
    point: { lat: geometry.coordinates[1], lng: geometry.coordinates[0] },
  }
}

const REQUEST_TIMEOUT = 12000
const cache = new Map<string, AddressSuggestion[]>()

async function fetchSuggestions(url: string, signal?: AbortSignal) {
  const cached = cache.get(url)
  if (cached) return cached
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT)
  const response = await fetch(url, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  })
  if (!response.ok) throw new Error('suggest failed')
  const body = (await response.json()) as { features?: PhotonFeature[] }
  const seen = new Set<string>()
  const suggestions: AddressSuggestion[] = []
  for (const feature of body.features ?? []) {
    const suggestion = toSuggestion(feature)
    const key = suggestion && `${suggestion.title}|${suggestion.detail}`.toLowerCase()
    if (!suggestion || !key || seen.has(key)) continue
    seen.add(key)
    suggestions.push(suggestion)
  }
  const found = suggestions.slice(0, SUGGESTION_LIMIT)
  cache.set(url, found)
  return found
}

function nearbyUrl(point: PickupPoint) {
  const params = new URLSearchParams({
    lat: point.lat.toFixed(5),
    lon: point.lng.toFixed(5),
    limit: '12',
    radius: '1',
  })
  return `${PHOTON}/reverse?${params}`
}

function searchUrl(query: string, near: PickupPoint) {
  const params = new URLSearchParams({
    q: query.trim().toLowerCase(),
    lat: near.lat.toFixed(3),
    lon: near.lng.toFixed(3),
    limit: '12',
    bbox: BANDUNG_RAYA_BBOX,
  })
  return `${PHOTON}/api/?${params}`
}

export function suggestNearby(point: PickupPoint, signal?: AbortSignal) {
  return fetchSuggestions(nearbyUrl(point), signal)
}

export type SuggestionMode = 'nearby' | 'search'

export type OriginState = 'idle' | 'locating' | 'denied' | 'ready'

type Origin = { state: Exclude<OriginState, 'ready'> } | { state: 'ready'; point: PickupPoint }

type Result = { url: string; mode: SuggestionMode; items: AddressSuggestion[]; failed: boolean }

export function useAddressSuggestions(query: string) {
  const [origin, setOrigin] = useState<Origin>({ state: 'idle' })
  const [result, setResult] = useState<Result | null>(null)
  const requested = useRef(false)
  const typed = query.trim()
  const mode: SuggestionMode | null =
    typed.length >= MIN_QUERY ? 'search' : origin.state === 'ready' ? 'nearby' : null
  const near = origin.state === 'ready' ? origin.point : SERVICE_CENTER
  const url =
    mode === 'search' ? searchUrl(typed, near) : mode === 'nearby' ? nearbyUrl(near) : null
  const cached = url ? cache.get(url) : undefined

  useEffect(() => {
    if (!url || !mode || cache.has(url)) return
    const controller = new AbortController()
    const timer = window.setTimeout(
      async () => {
        try {
          const items = await fetchSuggestions(url, controller.signal)
          setResult({ url, mode, items, failed: false })
        } catch {
          if (!controller.signal.aborted) setResult({ url, mode, items: [], failed: true })
        }
      },
      mode === 'search' ? 350 : 0
    )
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [url, mode])

  const locate = useCallback(() => {
    if (requested.current) return
    requested.current = true
    setOrigin({ state: 'locating' })
    locateDevice().then(
      (point) => setOrigin({ state: 'ready', point }),
      () => setOrigin({ state: 'denied' })
    )
  }, [])

  useEffect(() => {
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((status) => {
        if (status.state === 'granted') locate()
      })
      .catch(() => null)
  }, [locate])

  const current = cached
    ? { items: cached, failed: false }
    : result?.url === url
      ? result
      : result?.mode === mode
        ? { items: result.items, failed: false }
        : null
  return {
    mode,
    items: current?.items ?? [],
    loading: !!url && !cached && result?.url !== url,
    failed: current?.failed ?? false,
    origin: origin.state,
    locate,
  }
}
