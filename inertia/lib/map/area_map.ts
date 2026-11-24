import 'maplibre-gl/dist/maplibre-gl.css'
import { LngLatBounds, Map, NavigationControl, addProtocol, setWorkerUrl } from 'maplibre-gl'
import type { GeoJSONSource } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { Protocol } from 'pmtiles'
import { layers, namedFlavor } from '@protomaps/basemaps'
import type { Data } from '@generated/data'

type AreaShape = Data.ServiceAreaShape

const LOCALE = {
  'Map.Title': 'Peta area layanan',
  'NavigationControl.ZoomIn': 'Perbesar',
  'NavigationControl.ZoomOut': 'Perkecil',
}

// Alun-alun Bandung: where the map starts before the areas are drawn.
const BANDUNG_CENTER: [number, number] = [107.6098, -6.9218]

const flavor = namedFlavor('light')

addProtocol('pmtiles', new Protocol().tile)

// Workaround (D97): MapLibre looks for its worker next to its own module, but Vite pre-bundles that
// module into another folder (and the build into assets), so the worker is not found. Vite's ?url
// serves the worker file in development and emits it in the build.
// https://vite.dev/guide/assets#explicit-url-imports
setWorkerUrl(workerUrl)

// MapLibre does not read oklch(), the format of the theme tokens: the browser converts one pixel.
function themeColor(token: string) {
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!context) {
    return 'rgb(0, 0, 0)'
  }
  context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(token)
  context.fillRect(0, 0, 1, 1)
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
  return `rgb(${red}, ${green}, ${blue})`
}

function areaFeatures(shapes: AreaShape[]) {
  return {
    type: 'FeatureCollection' as const,
    features: shapes.map((area) => ({
      type: 'Feature' as const,
      id: area.id,
      properties: { name: area.name, isActive: area.isActive },
      geometry: area.shape,
    })),
  }
}

export type MapPoint = { lat: number; lng: number }

// Close enough to tell houses apart when a customer places a pin.
const PIN_ZOOM = 17

// Without a tiles file the map is a plain background and the areas still show (MAP-2).
// A base map that fails to load is logged, and reported to `onBaseMapError` once.
// With a `pinStart` the map opens on that point, close up, for placing a pin. A static map only shows
// the pin (the phone preview, D109): no gestures, so scrolling the page never moves it.
// The credits are drawn by `molecules/map_credits.tsx`.
export function createAreaMap(
  container: HTMLElement,
  tilesUrl: string | null,
  onBaseMapError: (message: string) => void,
  { pinStart, isStatic = false }: { pinStart?: MapPoint; isStatic?: boolean } = {}
) {
  const origin = window.location.origin
  const map = new Map({
    container,
    center: pinStart ? [pinStart.lng, pinStart.lat] : BANDUNG_CENTER,
    zoom: pinStart ? PIN_ZOOM : 10,
    interactive: !isStatic,
    // The map's accessible name says how to move a pin without dragging (WCAG 2.5.7, D109).
    locale: pinStart
      ? {
          ...LOCALE,
          'Map.Title': isStatic
            ? 'Pratinjau titik penjemputan'
            : 'Peta titik penjemputan. Ketuk peta untuk memindahkan penanda ke sana, atau pakai tombol panah keyboard.',
        }
      : LOCALE,
    attributionControl: false,
    style: tilesUrl
      ? {
          version: 8,
          glyphs: `${origin}/tiles/fonts/{fontstack}/{range}.pbf`,
          sprite: `${origin}/tiles/sprites/light`,
          sources: { protomaps: { type: 'vector', url: `pmtiles://${origin}${tilesUrl}` } },
          layers: layers('protomaps', flavor, { lang: 'id' }),
        }
      : {
          version: 8,
          sources: {},
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: { 'background-color': flavor.background },
            },
          ],
        },
  })
  // With a listener MapLibre no longer logs errors itself, so this does.
  let hasReportedBaseMap = false
  map.on('error', (event) => {
    console.error(event.error)
    if (tilesUrl && !hasReportedBaseMap) {
      hasReportedBaseMap = true
      onBaseMapError(`Peta dasar ${tilesUrl} gagal dimuat: ${event.error.message}`)
    }
  })
  if (!isStatic) {
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
  }
  return map
}

// Draws the districts, or refreshes them after a switch was toggled; the first call fits the view
// unless the map is placing a pin.
export function showAreas(map: Map, shapes: AreaShape[], shouldFitView = true) {
  if (!map.isStyleLoaded()) {
    map.once('load', () => showAreas(map, shapes, shouldFitView))
    return
  }

  const source = map.getSource<GeoJSONSource>('areas')
  if (source) {
    source.setData(areaFeatures(shapes))
    return
  }

  const primary = themeColor('--primary')
  const muted = themeColor('--muted-foreground')
  map.addSource('areas', { type: 'geojson', data: areaFeatures(shapes) })
  // Active and inactive differ by fill and by solid or dashed outline, not by colour alone.
  map.addLayer({
    id: 'areas-active-fill',
    type: 'fill',
    source: 'areas',
    filter: ['==', ['get', 'isActive'], true],
    paint: { 'fill-color': primary, 'fill-opacity': 0.18 },
  })
  map.addLayer({
    id: 'areas-active-line',
    type: 'line',
    source: 'areas',
    filter: ['==', ['get', 'isActive'], true],
    paint: { 'line-color': primary, 'line-width': 1.5 },
  })
  map.addLayer({
    id: 'areas-inactive-line',
    type: 'line',
    source: 'areas',
    filter: ['==', ['get', 'isActive'], false],
    paint: { 'line-color': muted, 'line-width': 1, 'line-dasharray': [2, 2] },
  })

  const bounds = new LngLatBounds()
  for (const area of shapes) {
    for (const polygon of area.shape.coordinates) {
      for (const [lng, lat] of polygon[0]) {
        bounds.extend([lng, lat])
      }
    }
  }
  if (shouldFitView && !bounds.isEmpty()) {
    map.fitBounds(bounds, { padding: 16, animate: false })
  }
}

// The point under the centre pin, reported each time the map stops moving (AREA-4). Tapping or
// clicking the map moves that spot under the pin, the alternative to dragging (WCAG 2.5.7, D109);
// MapLibre's own keyboard handler pans with the arrow keys while the map has focus.
export function followPin(map: Map, onPinSettle: (point: MapPoint) => void) {
  let last = map.getCenter()
  map.on('moveend', () => {
    const { lat, lng } = map.getCenter()
    // A resize also ends with `moveend` but keeps the centre, give or take the last digits of a
    // float. Reporting it would re-check the same pin (and clear a refused save's error), and the
    // status text changing height resizes the map again: an endless loop (D109). 1e-7° is about 1 cm.
    if (Math.abs(lat - last.lat) < 1e-7 && Math.abs(lng - last.lng) < 1e-7) {
      return
    }
    last = map.getCenter()
    onPinSettle({ lat, lng })
  })
  map.on('click', (event) => map.easeTo({ center: event.lngLat }))
}

export function movePinTo(map: Map, point: MapPoint) {
  map.jumpTo({ center: [point.lng, point.lat], zoom: Math.max(map.getZoom(), PIN_ZOOM) })
}
