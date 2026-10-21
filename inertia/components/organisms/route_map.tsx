import { useEffect, useImperativeHandle, useRef, type ReactNode, type Ref } from 'react'
import L from 'leaflet'
import locationSvg from '@tabler/icons/filled/map-pin.svg?raw'
import navigationSvg from '@tabler/icons/filled/navigation.svg?raw'
import type { PickupPoint } from '~/lib/location/point'
import { cn } from '~/lib/shared/utils'

const TILES =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'

export type QueuePin = { point: PickupPoint; label: string; state: 'done' | 'current' | 'upcoming' }

export type RouteMapHandle = { recenter: () => void }

export type MapInset = { top: number; right: number; bottom: number; left: number }

function fitOptions(map: L.Map, inset?: MapInset): L.FitBoundsOptions {
  const size = map.getSize()
  const x = Math.min(44, Math.round(size.x / 8))
  const y = Math.min(44, Math.round(size.y / 6))
  return {
    paddingTopLeft: [x + (inset?.left ?? 0), y + (inset?.top ?? 0)],
    paddingBottomRight: [x + (inset?.right ?? 0), y + (inset?.bottom ?? 0)],
    maxZoom: 16,
  }
}

function icon(svg: string, size: number, className: string) {
  return svg.replace(
    /<svg[^>]*>/,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" class="${className}">`
  )
}

function pinIcon(pin: QueuePin) {
  const isCurrent = pin.state === 'current'
  const size = isCurrent ? 34 : 28
  const tone =
    pin.state === 'done'
      ? 'bg-input text-surface-inverse-foreground text-[12.5px]'
      : isCurrent
        ? 'bg-primary text-surface-inverse-foreground text-sm'
        : 'bg-card text-foreground text-[12.5px]'
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="flex size-full items-center justify-center rounded-full border-[3px] border-card font-bold leading-none shadow-pin ${tone}">${pin.state === 'done' ? '✓' : pin.label}</span>`,
  })
}

const meIcon = L.divIcon({
  className: '',
  iconSize: [64, 64],
  iconAnchor: [32, 32],
  html: `<span class="relative flex size-16 items-center justify-center"><span class="absolute inset-0 rounded-full bg-primary-halo"></span><span class="relative flex size-7.5 items-center justify-center rounded-full border-[3px] border-card bg-primary text-surface-inverse-foreground shadow-1">${icon(navigationSvg, 17, 'block')}</span></span>`,
})

const destinationIcon = L.divIcon({
  className: '',
  iconSize: [44, 44],
  iconAnchor: [22, 40],
  html: `<span class="block text-destructive drop-shadow-[0_2px_0_var(--card)]">${icon(locationSvg, 44, 'block')}</span>`,
})

export default function RouteMap({
  ref,
  me,
  pins = [],
  destination,
  route,
  label,
  inset,
  isInteractive = true,
  className,
  children,
}: {
  ref?: Ref<RouteMapHandle>
  me?: PickupPoint
  pins?: QueuePin[]
  destination?: PickupPoint
  route?: PickupPoint[] | null
  label: string
  inset?: MapInset
  isInteractive?: boolean
  className?: string
  children?: ReactNode
}) {
  const element = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layers = useRef<L.LayerGroup | null>(null)
  const bounds = useRef<L.LatLngBounds | null>(null)
  const fitInset = useRef<MapInset | undefined>(undefined)

  useEffect(() => {
    if (!element.current) {
      return
    }
    const instance = L.map(element.current, {
      center: [-6.885, 107.61],
      zoom: 14,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      boxZoom: false,
      dragging: isInteractive,
      keyboard: isInteractive,
      touchZoom: isInteractive,
      scrollWheelZoom: isInteractive,
      doubleClickZoom: isInteractive,
    })
    L.tileLayer(TILES, { maxNativeZoom: 16, maxZoom: 18 }).addTo(instance)
    layers.current = L.layerGroup().addTo(instance)
    map.current = instance
    const observer = new ResizeObserver(() => {
      instance.invalidateSize()
      if (bounds.current) {
        instance.fitBounds(bounds.current, fitOptions(instance, fitInset.current))
      }
    })
    observer.observe(element.current)
    return () => {
      observer.disconnect()
      instance.off()
      instance.remove()
      map.current = null
      layers.current = null
    }
  }, [isInteractive])

  const signature = JSON.stringify({ me, pins, destination, route, inset })

  useEffect(() => {
    const instance = map.current
    const group = layers.current
    if (!instance || !group) {
      return
    }
    const data = JSON.parse(signature) as {
      me?: PickupPoint
      pins: QueuePin[]
      destination?: PickupPoint
      route?: PickupPoint[] | null
      inset?: MapInset
    }
    fitInset.current = data.inset
    group.clearLayers()
    const points: L.LatLngExpression[] = []

    const open = data.pins.filter((pin) => pin.state !== 'done')
    const queuePath = [...(data.me ? [data.me] : []), ...open.map((pin) => pin.point)]
    for (const [index, point] of queuePath.slice(1).entries()) {
      const from = queuePath[index]
      L.polyline(
        [
          [from.lat, from.lng],
          [point.lat, point.lng],
        ],
        {
          weight: 3,
          dashArray: '6 6',
          interactive: false,
          className: index === 0 ? 'stroke-primary' : 'stroke-map-route-muted',
        }
      ).addTo(group)
    }

    if (data.route?.length) {
      const line = data.route.map((point) => [point.lat, point.lng] as L.LatLngTuple)
      L.polyline(line, {
        weight: 11,
        lineCap: 'round',
        interactive: false,
        className: 'stroke-card',
      }).addTo(group)
      L.polyline(line, {
        weight: 6,
        lineCap: 'round',
        interactive: false,
        className: 'stroke-primary',
      }).addTo(group)
      points.push(...line)
    }

    for (const pin of data.pins) {
      L.marker([pin.point.lat, pin.point.lng], {
        icon: pinIcon(pin),
        interactive: false,
        keyboard: false,
        zIndexOffset: pin.state === 'current' ? 200 : 0,
      }).addTo(group)
      points.push([pin.point.lat, pin.point.lng])
    }

    if (data.destination) {
      L.marker([data.destination.lat, data.destination.lng], {
        icon: destinationIcon,
        interactive: false,
        keyboard: false,
        zIndexOffset: 300,
      }).addTo(group)
      points.push([data.destination.lat, data.destination.lng])
    }

    if (data.me) {
      L.marker([data.me.lat, data.me.lng], {
        icon: meIcon,
        interactive: false,
        keyboard: false,
        zIndexOffset: 400,
      }).addTo(group)
      points.push([data.me.lat, data.me.lng])
    }

    if (points.length) {
      bounds.current = L.latLngBounds(points)
      instance.fitBounds(bounds.current, { ...fitOptions(instance, data.inset), animate: false })
    }
  }, [signature])

  useImperativeHandle(
    ref,
    () => ({
      recenter() {
        const instance = map.current
        if (instance && me) {
          instance.setView([me.lat, me.lng], 16)
        }
      },
    }),
    [me]
  )

  return (
    <div className={cn('relative isolate overflow-hidden bg-map-land', className)}>
      <div
        ref={element}
        role={isInteractive ? 'application' : 'img'}
        aria-label={label}
        className="absolute inset-0 z-0"
      />
      {children}
      <span className="pointer-events-none absolute right-1.5 bottom-1 z-10 rounded-xs bg-surface-glass px-[5px] py-px text-[10px] leading-[1.4] font-medium text-foreground-secondary">
        Esri, HERE, Garmin, © OpenStreetMap contributors
      </span>
    </div>
  )
}
