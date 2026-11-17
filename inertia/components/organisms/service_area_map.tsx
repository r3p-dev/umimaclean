import { useEffect, useEffectEvent, useRef, useState } from 'react'
import type { Map, Marker } from 'maplibre-gl'
import { cn } from 'cn'
import type { Data } from '@generated/data'

export type MapPoint = { lat: number; lng: number }

export default function ServiceAreaMap({
  shapes,
  tilesUrl,
  pinPosition,
  onPinStop,
  hasCooperativeGestures = false,
  className,
}: {
  shapes: Data.ServiceAreaShape[] | undefined
  tilesUrl: string | null
  pinPosition?: MapPoint | null
  onPinStop?: (point: MapPoint) => void
  hasCooperativeGestures?: boolean
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<Map | null>(null)
  const [pin, setPin] = useState<Marker | null>(null)
  const hasPin = onPinStop !== undefined
  const handlePinStop = useEffectEvent((point: MapPoint) => onPinStop?.(point))

  // MapLibre is loaded only here, so pages without a map never download it (NFR-3).
  useEffect(() => {
    let isRemoved = false
    let createdMap: Map | undefined
    import('~/lib/map/area_map').then(({ createAreaMap, addDraggablePin }) => {
      if (isRemoved || !containerRef.current) {
        return
      }
      createdMap = createAreaMap(containerRef.current, tilesUrl, { hasCooperativeGestures })
      setMap(createdMap)
      if (hasPin) {
        setPin(addDraggablePin(createdMap, (lat, lng) => handlePinStop({ lat, lng })))
      }
    })
    return () => {
      isRemoved = true
      createdMap?.remove()
    }
  }, [tilesUrl, hasCooperativeGestures, hasPin])

  useEffect(() => {
    if (map && shapes) {
      import('~/lib/map/area_map').then(({ showAreas }) => showAreas(map, shapes))
    }
  }, [map, shapes])

  useEffect(() => {
    if (map && pin && pinPosition) {
      pin.setLngLat([pinPosition.lng, pinPosition.lat])
      map.flyTo({ center: [pinPosition.lng, pinPosition.lat], zoom: Math.max(map.getZoom(), 13) })
    }
  }, [map, pin, pinPosition])

  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden rounded-lg border border-border bg-muted', className)}
    />
  )
}
