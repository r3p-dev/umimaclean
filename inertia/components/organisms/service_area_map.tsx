import { useEffect, useRef, useState } from 'react'
import type { Map } from 'maplibre-gl'
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconMapPinFilled,
} from '@tabler/icons-react'
import { cn } from 'cn'
import type { Data } from '@generated/data'
import Note from '~/components/atoms/note'
import { Button } from '~/components/ui/button'
import type { MapPoint } from '~/lib/map/area_map'

// Placing a pin: the pin stays in the centre and the map moves under it (by drag, keyboard or the
// arrow buttons). `target` jumps the map to a point, for example the device's location.
export type MapPin = {
  start: MapPoint
  target: MapPoint | null
  onSettle: (point: MapPoint) => void
}

// One arrow press moves the map this many pixels: small enough to fine-tune a pin.
const ARROW_STEP = 60

const ARROWS = [
  {
    label: 'Geser titik ke utara',
    offset: [0, -ARROW_STEP],
    Icon: IconChevronUp,
    place: 'col-start-2',
  },
  {
    label: 'Geser titik ke barat',
    offset: [-ARROW_STEP, 0],
    Icon: IconChevronLeft,
    place: 'col-start-1 row-start-2',
  },
  {
    label: 'Geser titik ke timur',
    offset: [ARROW_STEP, 0],
    Icon: IconChevronRight,
    place: 'col-start-3 row-start-2',
  },
  {
    label: 'Geser titik ke selatan',
    offset: [0, ARROW_STEP],
    Icon: IconChevronDown,
    place: 'col-start-2 row-start-3',
  },
] as const

export default function ServiceAreaMap({
  shapes,
  tilesUrl,
  devWarning,
  pin,
  className,
}: {
  shapes: Data.ServiceAreaShape[]
  tilesUrl: string | null
  devWarning: string | null
  pin?: MapPin
  className?: string
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
          <>
            {/* The tip of the pin marks the centre of the map, the point that is checked and saved. */}
            <IconMapPinFilled
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 size-11 -translate-x-1/2 -translate-y-full text-primary drop-shadow"
            />
            <div className="absolute top-2 left-2 grid grid-cols-3 grid-rows-3">
              {ARROWS.map(({ label, offset, Icon, place }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="icon"
                  aria-label={label}
                  isDisabled={!map}
                  onPress={() => map?.panBy([offset[0], offset[1]])}
                  className={cn('size-11', place)}
                >
                  <Icon aria-hidden="true" className="size-5" />
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
