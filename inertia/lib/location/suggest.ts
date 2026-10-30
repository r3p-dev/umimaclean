import { urlFor } from '~/client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { locateDevice } from '~/lib/location/point_lookup'
import { SERVICE_CENTER } from '~/lib/location/service_area'
import type { PickupPoint } from '~/lib/location/point'

const MIN_QUERY = 3

export type AddressSuggestion = {
  id: string
  title: string
  detail: string
  value: string
  point: PickupPoint
}

const REQUEST_TIMEOUT = 12000
const cache = new Map<string, AddressSuggestion[]>()

async function fetchSuggestions(url: string, signal?: AbortSignal) {
  const cached = cache.get(url)
  if (cached) {
    return cached
  }
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT)
  const response = await fetch(url, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    headers: { accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error('suggest failed')
  }
  const found = (await response.json()) as AddressSuggestion[]
  cache.set(url, found)
  return found
}

function nearbyUrl(point: PickupPoint) {
  const params = new URLSearchParams({ lat: point.lat.toFixed(5), lng: point.lng.toFixed(5) })
  return `${urlFor('places.index')}?${params}`
}

function searchUrl(query: string, near: PickupPoint) {
  const params = new URLSearchParams({
    q: query.trim().toLowerCase(),
    lat: near.lat.toFixed(3),
    lng: near.lng.toFixed(3),
  })
  return `${urlFor('places.index')}?${params}`
}

export function suggestNearby(point: PickupPoint, signal?: AbortSignal) {
  return fetchSuggestions(nearbyUrl(point), signal)
}

export type SuggestionMode = 'nearby' | 'search'

export type OriginState = 'idle' | 'locating' | 'denied' | 'ready'

type Origin = { state: Exclude<OriginState, 'ready'> } | { state: 'ready'; point: PickupPoint }

type Result = { url: string; mode: SuggestionMode; items: AddressSuggestion[]; hasFailed: boolean }

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
    if (!url || !mode || cache.has(url)) {
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(
      async () => {
        try {
          const items = await fetchSuggestions(url, controller.signal)
          setResult({ url, mode, items, hasFailed: false })
        } catch {
          if (!controller.signal.aborted) {
            setResult({ url, mode, items: [], hasFailed: true })
          }
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
    if (requested.current) {
      return
    }
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
        if (status.state === 'granted') {
          locate()
        }
      })
      .catch(() => null)
  }, [locate])

  const current = cached
    ? { items: cached, hasFailed: false }
    : result?.url === url
      ? result
      : result?.mode === mode
        ? { items: result.items, hasFailed: false }
        : null
  return {
    mode,
    items: current?.items ?? [],
    isLoading: !!url && !cached && result?.url !== url,
    hasFailed: current?.hasFailed ?? false,
    origin: origin.state,
    locate,
  }
}
