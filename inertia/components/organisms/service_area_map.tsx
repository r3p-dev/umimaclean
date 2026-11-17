import { useEffect, useRef, useState } from 'react'
import type { Map } from 'maplibre-gl'
import { cn } from 'cn'
import type { Data } from '@generated/data'
import Note from '~/components/atoms/note'

export default function ServiceAreaMap({
  shapes,
  tilesUrl,
  devWarning,
  className,
}: {
  shapes: Data.ServiceAreaShape[]
  tilesUrl: string | null
  devWarning: string | null
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<Map | null>(null)
  const [baseMapError, setBaseMapError] = useState<string | null>(null)

  // MapLibre is loaded only here, so pages without a map never download it (NFR-3).
  useEffect(() => {
    let isRemoved = false
    let createdMap: Map | undefined
    import('~/lib/map/area_map').then(({ createAreaMap }) => {
      if (isRemoved || !containerRef.current) {
        return
      }
      createdMap = createAreaMap(containerRef.current, tilesUrl, setBaseMapError)
      setMap(createdMap)
    })
    return () => {
      isRemoved = true
      createdMap?.remove()
    }
  }, [tilesUrl])

  useEffect(() => {
    if (map) {
      import('~/lib/map/area_map').then(({ showAreas }) => showAreas(map, shapes))
    }
  }, [map, shapes])

  // Development only: say why the base map is missing (the server's check, or a failed load).
  const warning = devWarning ?? (import.meta.env.DEV ? baseMapError : null)

  return (
    <div className="flex flex-col gap-2">
      {warning && <Note tone="attention">{warning}</Note>}
      <div
        ref={containerRef}
        className={cn('overflow-hidden rounded-lg border border-border bg-muted', className)}
      />
    </div>
  )
}
