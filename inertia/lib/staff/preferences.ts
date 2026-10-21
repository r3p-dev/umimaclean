import type { PickupPoint } from '~/lib/location/point'
import { createSharedStore } from '~/lib/shared/shared_store'

export type MapApp = 'Google Maps' | 'Waze'

export const MAP_APPS: MapApp[] = ['Google Maps', 'Waze']

type Preferences = { mapApp: MapApp }

export const preferences = createSharedStore<Preferences>(
  'local',
  'umima:staff-preferences',
  () => ({ mapApp: 'Google Maps' })
)

export function navigationLink(point: PickupPoint, app: MapApp) {
  return app === 'Waze'
    ? `https://waze.com/ul?ll=${point.lat},${point.lng}&navigate=yes`
    : `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}&travelmode=driving`
}
