import { useEffect, useImperativeHandle, useRef, type ReactNode, type Ref } from 'react'
import L from 'leaflet'
import { IconMapPinFilled } from '@tabler/icons-react'
import { MAP_ATTRIBUTION, addBaseMap, useBaseMapUrl } from '~/lib/location/base_map'
import type { PickupPoint } from '~/lib/location/point'
import { cn } from '~/lib/shared/utils'

export type LocationMapHandle = {
  moveTo: (point: PickupPoint, zoom?: number) => void
}

export default function LocationMap({
  ref,
  center,
  zoom = 16,
  isInteractive = true,
  label,
  onMoveEnd,
  className,
  children,
}: {
  ref?: Ref<LocationMapHandle>
  center: PickupPoint
  zoom?: number
  isInteractive?: boolean
  label?: string
  onMoveEnd?: (point: PickupPoint) => void
  className?: string
  children?: ReactNode
}) {
  const element = useRef<HTMLDivElement>(null)
  const baseMapUrl = useBaseMapUrl()
  const map = useRef<L.Map | null>(null)
  const initial = useRef({ center, zoom })
  const moveEnd = useRef(onMoveEnd)

  useEffect(() => {
    moveEnd.current = onMoveEnd
  }, [onMoveEnd])

  useEffect(() => {
    if (!element.current) {
      return
    }
    const start = initial.current
    const instance = L.map(element.current, {
      center: [start.center.lat, start.center.lng],
      zoom: start.zoom,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      boxZoom: false,
      dragging: isInteractive,
      keyboard: isInteractive,
      touchZoom: isInteractive ? 'center' : false,
      scrollWheelZoom: isInteractive ? 'center' : false,
      doubleClickZoom: isInteractive ? 'center' : false,
    })
    addBaseMap(instance, baseMapUrl)
    instance.on('moveend', () => {
      const point = instance.getCenter()
      moveEnd.current?.({ lat: point.lat, lng: point.lng })
    })
    map.current = instance
    return () => {
      instance.off()
      instance.stop()
      instance.remove()
      map.current = null
    }
  }, [isInteractive, baseMapUrl])

  useEffect(() => {
    if (!isInteractive) {
      map.current?.setView([center.lat, center.lng])
    }
  }, [isInteractive, center.lat, center.lng])

  useImperativeHandle(
    ref,
    () => ({
      moveTo(point, nextZoom) {
        const instance = map.current
        if (instance) {
          instance.setView([point.lat, point.lng], nextZoom ?? instance.getZoom(), {
            animate: false,
          })
        }
      },
    }),
    []
  )

  return (
    <div className={cn('relative isolate overflow-hidden bg-map-land', className)}>
      <div
        ref={element}
        role={isInteractive ? 'application' : undefined}
        aria-label={isInteractive ? label : undefined}
        aria-hidden={isInteractive ? undefined : true}
        className="absolute inset-0 z-0"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 z-10 h-1.5 w-4 -translate-1/2 rounded-[50%] bg-map-pin-shadow"
      />
      <IconMapPinFilled className="pointer-events-none absolute top-1/2 left-1/2 z-10 size-11.5 -translate-x-1/2 -translate-y-[94%] text-primary drop-shadow-[0_2px_0_var(--card)]" />
      {children}
      <span className="absolute right-1.5 bottom-1 z-10 rounded-xs bg-surface-glass px-[5px] py-px text-[10px] leading-[1.4] font-medium text-foreground-secondary">
        {MAP_ATTRIBUTION}
      </span>
    </div>
  )
}
