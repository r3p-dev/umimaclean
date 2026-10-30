import { urlFor } from '~/client'
import type { PickupPoint } from '~/lib/location/point'
import { SERVICE_CENTER } from '~/lib/location/service_area'
import type { AddressSuggestion } from '~/lib/location/suggest'

type PointAddress = {
  road: string | null
  kelurahan: string | null
  kecamatan: string | null
  city: string | null
  postcode: string | null
}

async function getJson<T>(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal, headers: { accept: 'application/json' } })
  if (!response.ok) {
    throw new Error('place lookup failed')
  }
  return (await response.json()) as T
}

export async function searchFirst(text: string, signal?: AbortSignal) {
  const params = new URLSearchParams({
    q: text,
    lat: String(SERVICE_CENTER.lat),
    lng: String(SERVICE_CENTER.lng),
  })
  const [first] = await getJson<AddressSuggestion[]>(`${urlFor('places.index')}?${params}`, signal)
  return first?.point ?? null
}

export async function reverseGeocode(point: PickupPoint, signal?: AbortSignal) {
  const params = new URLSearchParams({ lat: String(point.lat), lng: String(point.lng) })
  const body = await getJson<{ address: PointAddress | null }>(
    `${urlFor('places.show')}?${params}`,
    signal
  )
  return body.address
}

export function describeAddress(address: PointAddress, typedStreet?: string) {
  const street = address.road ?? (typedStreet || address.kelurahan || 'Titik tanpa nama jalan')
  const area = [
    address.kelurahan,
    address.kecamatan && `Kec. ${address.kecamatan}`,
    [address.city, address.postcode].filter(Boolean).join(' '),
  ]
    .filter((part) => part && part !== street)
    .join(', ')
  return { street, area }
}
