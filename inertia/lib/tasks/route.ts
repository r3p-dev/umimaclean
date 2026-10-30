import { useEffect, useState } from 'react'
import { urlFor } from '~/client'
import type { PickupPoint } from '~/lib/location/point'
import { clockTime } from '~/lib/shared/date'
import { formatKm } from '~/lib/tasks/location'

type DrivingRoute = {
  path: PickupPoint[] | null
  isEstimate: boolean
  distanceText: string
  durationText: string
  arrivalText: string
}

type RouteState = { key: string; route: DrivingRoute | null; hasFailed: boolean }

function routeKey(from: PickupPoint, to: PickupPoint) {
  return [from.lat.toFixed(3), from.lng.toFixed(3), to.lat.toFixed(5), to.lng.toFixed(5)].join(',')
}

async function fetchRoute(from: PickupPoint, to: PickupPoint, signal: AbortSignal) {
  const params = new URLSearchParams({
    fromLat: String(from.lat),
    fromLng: String(from.lng),
    toLat: String(to.lat),
    toLng: String(to.lng),
  })
  const response = await fetch(`${urlFor('staff.route')}?${params}`, {
    signal,
    headers: { accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error('route')
  }
  const best = (await response.json()) as {
    source: 'osrm' | 'estimate'
    meters: number
    seconds: number
    path: PickupPoint[]
  }
  const isEstimate = best.source !== 'osrm'
  const approximately = isEstimate ? '± ' : ''
  const minutes = Math.max(1, Math.round(best.seconds / 60))
  return {
    path: isEstimate ? null : best.path,
    isEstimate,
    distanceText: `${approximately}${formatKm(best.meters / 1000)}`,
    durationText: `${approximately}${minutes} mnt`,
    arrivalText: clockTime(new Date(Date.now() + best.seconds * 1000)),
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
    failed: isCurrent && (state.hasFailed || Boolean(state.route?.isEstimate)),
    loading: isEnabled && Boolean(key) && !isCurrent,
  }
}
