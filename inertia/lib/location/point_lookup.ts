import { useEffect, useState } from 'react'
import { describeAddress, reverseGeocode } from '~/lib/location/geocode'
import { checkPointArea, type AreaTone, type Coverage } from '~/lib/location/service_area'
import type { PickupPoint, PointLabel } from '~/lib/location/point'

type Lookup = { key: string; label: PointLabel | null; tone: AreaTone }

function pointKey(point: PickupPoint) {
  return `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`
}

export function usePointLookup(point: PickupPoint, coverage: Coverage, typedStreet?: string) {
  const [lookup, setLookup] = useState<Lookup | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const key = pointKey(point)
    const timer = window.setTimeout(async () => {
      try {
        const address = await reverseGeocode(point, controller.signal)
        let tone = checkPointArea(address, coverage)
        if (tone === 'unknown' && address?.county) {
          tone = checkPointArea(await reverseGeocode(point, controller.signal, 12), coverage)
        }
        setLookup({
          key,
          label: address ? describeAddress(address, typedStreet) : null,
          tone,
        })
      } catch {
        if (!controller.signal.aborted) {
          setLookup({ key, label: null, tone: 'unknown' })
        }
      }
    }, 600)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [point, typedStreet, coverage])

  const current = lookup?.key === pointKey(point) ? lookup : null
  return { loading: !current, label: current?.label ?? null, tone: current?.tone ?? null }
}

export function locateDevice() {
  return new Promise<PickupPoint>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('unsupported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}
