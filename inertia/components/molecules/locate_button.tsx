import { useEffect, useState } from 'react'
import { IconCurrentLocation } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import type { MapPoint } from '~/lib/map/area_map'

// "Gunakan lokasi saya" (CUST-3, D109): a round button floating on a pin map that moves the map to
// the device's location; the normal coverage check follows. It is not rendered where location is
// unavailable or refused, and the pin is placed by hand.
export default function LocateButton({ onLocate }: { onLocate: (point: MapPoint) => void }) {
  // Signed-in pages render only in the browser, so `navigator` is there (config/inertia.ts).
  const [canLocate, setCanLocate] = useState(() => 'geolocation' in navigator)
  const [isLocating, setIsLocating] = useState(false)

  // Hidden when the customer has refused location before. A browser that cannot query this
  // permission keeps the button; a refusal then hides it on the first press.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((permission) => setCanLocate(permission.state !== 'denied'))
      .catch(() => {})
  }, [])

  function locate() {
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        onLocate({ lat: position.coords.latitude, lng: position.coords.longitude })
      },
      // Refused, unavailable or too slow: the button goes away and the pin is placed by hand.
      () => {
        setIsLocating(false)
        setCanLocate(false)
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  }

  if (!canLocate) {
    return null
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Gunakan lokasi saya"
      isDisabled={isLocating}
      onPress={locate}
      className="absolute right-3 bottom-3 z-10 size-11 rounded-full shadow-md"
    >
      <IconCurrentLocation
        aria-hidden="true"
        className={isLocating ? 'size-5 animate-pulse' : 'size-5'}
      />
    </Button>
  )
}
