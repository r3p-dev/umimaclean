import 'maplibre-gl/dist/maplibre-gl.css'
import {
  AttributionControl,
  LngLatBounds,
  Map,
  NavigationControl,
  addProtocol,
  setWorkerUrl,
} from 'maplibre-gl'
import type { GeoJSONSource } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { Protocol } from 'pmtiles'
import { layers, namedFlavor } from '@protomaps/basemaps'
import type { Data } from '@generated/data'

type AreaShape = Data.ServiceAreaShape

// Credit for the base map (MAP-2) and the district boundaries (AREA-1, CC BY-IGO 3.0 §3(b), §4(a)).
const ATTRIBUTION = [
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a>',
  'Batas kecamatan: <a href="https://data.humdata.org/dataset/cod-ab-idn" target="_blank" rel="noopener">BPS via OCHA/HDX</a>, <a href="https://creativecommons.org/licenses/by/3.0/igo/" target="_blank" rel="noopener">CC BY-IGO 3.0</a>, diubah',
]

const LOCALE = {
  'Map.Title': 'Peta area layanan',
  'AttributionControl.ToggleAttribution': 'Tampilkan atribusi',
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

// Without a tiles file the map is a plain background and the areas still show (MAP-2).
// A base map that fails to load is logged, and reported to `onBaseMapError` once.
export function createAreaMap(
  container: HTMLElement,
  tilesUrl: string | null,
  onBaseMapError: (message: string) => void
) {
  const origin = window.location.origin
  const map = new Map({
    container,
    center: BANDUNG_CENTER,
    zoom: 10,
    locale: LOCALE,
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
  map.addControl(new AttributionControl({ compact: false, customAttribution: ATTRIBUTION }))
  map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
  return map
}

// Draws the districts, or refreshes them after a switch was toggled; the first call fits the view.
export function showAreas(map: Map, shapes: AreaShape[]) {
  if (!map.isStyleLoaded()) {
    map.once('load', () => showAreas(map, shapes))
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
  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, { padding: 16, animate: false })
  }
}
