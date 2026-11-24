import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Map } from 'maplibre-gl'
import { IconMapPinFilled } from '@tabler/icons-react'
import { cn } from 'cn'
import type { Data } from '@generated/data'
import Note from '~/components/atoms/note'
import MapCredits from '~/components/molecules/map_credits'
import type { MapPoint } from '~/lib/map/area_map'

// Placing a pin: the pin stays in the centre and the map moves under it (drag, tap or click, or the
// arrow keys). `target` jumps the map to a point, for example the device's location.
export type MapPin = {
  start: MapPoint
  target: MapPoint | null
  onSettle: (point: MapPoint) => void
}

export default function ServiceAreaMap({
  shapes,
  tilesUrl,
  devWarning,
  pin,
  className,
  children,
}: {
  shapes: Data.ServiceAreaShape[]
  tilesUrl: string | null
  devWarning: string | null
  pin?: MapPin
  className?: string
  // Buttons floating on the map, such as "Gunakan lokasi saya".
  children?: ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<Map | null>(null)
  const [baseMapError, setBaseMapError] = useState<string | null>(null)
  // Read once when the map is created; later changes come through `pin.target`.
  const pinRef = useRef(pin)
  useEffect(() => {
    pinRef.current = pin
  })

  // MapLibre is loaded only here, so pages without a map never download it (NFR-3).
  useEffect(() => {
    let isRemoved = false
    let createdMap: Map | undefined
    import('~/lib/map/area_map').then(({ createAreaMap, followPin }) => {
      if (isRemoved || !containerRef.current) {
        return
      }
      const pinAtStart = pinRef.current
      createdMap = createAreaMap(containerRef.current, tilesUrl, setBaseMapError, pinAtStart?.start)
      if (pinAtStart) {
        followPin(createdMap, (point) => pinRef.current?.onSettle(point))
      }
      setMap(createdMap)
    })
    return () => {
      isRemoved = true
      createdMap?.remove()
    }
  }, [tilesUrl])

  const hasPin = pin !== undefined
  useEffect(() => {
    if (map) {
      import('~/lib/map/area_map').then(({ showAreas }) => showAreas(map, shapes, !hasPin))
    }
  }, [map, shapes, hasPin])

  const target = pin?.target
  useEffect(() => {
    if (map && target) {
      import('~/lib/map/area_map').then(({ movePinTo }) => movePinTo(map, target))
    }
  }, [map, target])

  // Development only: say why the base map is missing (the server's check, or a failed load).
  const warning = devWarning ?? (import.meta.env.DEV ? baseMapError : null)

  return (
    <div className="flex flex-col gap-2">
      {warning && <Note tone="attention">{warning}</Note>}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-border bg-muted',
          className
        )}
      >
        <div ref={containerRef} className="size-full" />
        {pin && (
          // The tip of the pin marks the centre of the map, the point that is checked and saved.
          <IconMapPinFilled
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 size-11 -translate-x-1/2 -translate-y-full text-primary drop-shadow"
          />
        )}
        <MapCredits />
        {children}
      </div>
    </div>
  )
}
