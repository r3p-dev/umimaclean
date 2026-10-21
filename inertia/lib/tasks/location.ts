import { useEffect, useState } from 'react'
import type { PickupPoint } from '~/lib/location/point'
import { STORE_LOCATION } from '~/lib/staff/profile'

export type DeviceLocation = { point: PickupPoint; isLive: boolean }

export function useDeviceLocation(shouldWatch = false): DeviceLocation {
  const [location, setLocation] = useState<DeviceLocation>({ point: STORE_LOCATION, isLive: false })

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return
    }
    const update = (position: GeolocationPosition) =>
      setLocation({
        point: { lat: position.coords.latitude, lng: position.coords.longitude },
        isLive: true,
      })
    const options = { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 }
    if (shouldWatch) {
      const id = navigator.geolocation.watchPosition(update, () => undefined, options)
      return () => navigator.geolocation.clearWatch(id)
    }
    navigator.geolocation.getCurrentPosition(update, () => undefined, options)
  }, [shouldWatch])

  return location
}

export function formatKm(km: number) {
  return `${km.toLocaleString('id-ID', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} km`
}
