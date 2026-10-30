import type L from 'leaflet'
import { usePage } from '@inertiajs/react'
import { leafletLayer } from 'protomaps-leaflet'

const FLAVOR = 'light'

export const MAP_ATTRIBUTION = '© OpenStreetMap contributors · Protomaps'

export function useBaseMapUrl() {
  return usePage().props.baseMapUrl
}

export function addBaseMap(map: L.Map, url: string | null) {
  if (url) {
    leafletLayer({ url, flavor: FLAVOR, lang: 'id', maxDataZoom: 15 }).addTo(map)
  }
}
