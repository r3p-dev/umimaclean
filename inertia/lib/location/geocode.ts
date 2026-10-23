import type { PickupPoint } from '~/lib/location/point'

const NOMINATIM = 'https://nominatim.openstreetmap.org'
const BANDUNG_RAYA_VIEWBOX = '107.35,-6.70,107.95,-7.20'

type GeocodedAddress = {
  road?: string
  house_number?: string
  neighbourhood?: string
  suburb?: string
  village?: string
  district?: string
  city_district?: string
  municipality?: string
  town?: string
  city?: string
  county?: string
  postcode?: string
}

async function searchAddress(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({
    'q': query,
    'format': 'jsonv2',
    'limit': '1',
    'countrycodes': 'id',
    'viewbox': BANDUNG_RAYA_VIEWBOX,
    'accept-language': 'id',
  })
  const response = await fetch(`${NOMINATIM}/search?${params}`, { signal })
  if (!response.ok) {
    throw new Error('search failed')
  }
  const [first] = (await response.json()) as { lat: string; lon: string }[]
  return first ? { lat: Number(first.lat), lng: Number(first.lon) } : null
}

export function searchTerms(text: string) {
  const segments = text
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && !/^rt\b|^rw\b|\brt\s*\d|\brw\s*\d/i.test(part))
  const street = (segments[0] ?? '')
    .replace(/\bno\.?\s*\S+/gi, '')
    .replace(/^(jl|jln)\.?\s+/i, 'Jalan ')
    .replace(/\s+/g, ' ')
    .trim()
  const shortStreet = street.replace(/\s+([ivx]+|\d+[a-z]?)$/i, '').trim()
  const locality = segments
    .slice(1)
    .filter((part) => !/^((kota|kab\.?|kabupaten)\s+)?(bandung( barat)?|cimahi)$/i.test(part))
    .join(', ')
  return [...new Set([street, shortStreet, locality].filter(Boolean))].map(
    (term) => `${term}, Bandung`
  )
}

export async function searchFirst(text: string, signal?: AbortSignal) {
  const terms = searchTerms(text)
  for (const [index, term] of terms.entries()) {
    if (index > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, 1100))
    }
    if (signal?.aborted) {
      return null
    }
    const found = await searchAddress(term, signal)
    if (found) {
      return found
    }
  }
  return null
}

export async function reverseGeocode(point: PickupPoint, signal?: AbortSignal) {
  const params = new URLSearchParams({
    'lat': String(point.lat),
    'lon': String(point.lng),
    'format': 'jsonv2',
    'zoom': '18',
    'addressdetails': '1',
    'accept-language': 'id',
  })
  const response = await fetch(`${NOMINATIM}/reverse?${params}`, { signal })
  if (!response.ok) {
    throw new Error('reverse failed')
  }
  const body = (await response.json()) as { address?: GeocodedAddress; error?: string }
  if (body.error || !body.address) {
    return null
  }
  return body.address
}

export function describeAddress(address: GeocodedAddress, typedStreet?: string) {
  const street = address.road
    ? address.road + (address.house_number ? ` No. ${address.house_number}` : '')
    : typedStreet || address.neighbourhood || address.suburb || 'Titik tanpa nama jalan'
  const locality = address.suburb ?? address.village ?? address.neighbourhood
  const kecamatan = address.district ?? address.city_district
  const city = address.city ?? address.county ?? address.town
  const area = [
    locality,
    kecamatan && `Kec. ${kecamatan}`,
    [city, address.postcode].filter(Boolean).join(' '),
  ]
    .filter((part) => part && part !== street)
    .join(', ')
  return { street, area }
}
