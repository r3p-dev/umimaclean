import { urlFor } from '~/client'
import type { PickupPoint } from '~/lib/location/point'

export const SERVICE_CENTER: PickupPoint = { lat: -6.8779, lng: 107.6106 }

export const BOUNDARY_CREDIT = 'Batas wilayah: BPS, via HDX (CC BY-IGO)'

export type AreaTone = 'idle' | 'covered' | 'outside' | 'unknown'

export type ServiceAreaRow = { id: number; city: string; name: string; isActive: boolean }

export const AREA_QUERY_MAX = 40

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/^(kec\.?|kecamatan)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function groupByCity(areas: ServiceAreaRow[]) {
  const cities = new Map<string, ServiceAreaRow[]>()
  for (const area of areas) {
    cities.set(area.city, [...(cities.get(area.city) ?? []), area])
  }
  return [...cities].map(([city, rows]) => ({ city, areas: rows }))
}

export function servedCities(areas: ServiceAreaRow[]) {
  return groupByCity(areas)
    .map(({ city, areas: rows }) => ({
      city,
      active: rows.filter((area) => area.isActive).length,
      total: rows.length,
    }))
    .filter((city) => city.active > 0)
}

export function checkServiceArea(
  query: string,
  areas: ServiceAreaRow[]
): { tone: AreaTone; message: string } {
  const normalized = normalize(query)

  if (normalized.length < 3) {
    return {
      tone: 'idle',
      message: 'Ketik nama kecamatan untuk mengecek apakah alamat Anda bisa dijemput.',
    }
  }

  const matches = areas.filter((area) => normalize(area.name).startsWith(normalized))
  const district = matches.find((area) => area.isActive) ?? matches[0]
  if (district?.isActive) {
    return {
      tone: 'covered',
      message: `Kec. ${district.name}, ${district.city} masuk area layanan. Antar-jemput gratis.`,
    }
  }
  if (district) {
    return {
      tone: 'outside',
      message: `Kec. ${district.name}, ${district.city} belum masuk area layanan. Hubungi kami via WhatsApp untuk info perluasan area.`,
    }
  }

  const city = servedCities(areas).find((entry) => normalize(entry.city).includes(normalized))
  if (city) {
    return {
      tone: 'covered',
      message:
        city.active === city.total
          ? `${city.city} masuk area layanan. Antar-jemput gratis.`
          : `Sebagian ${city.city} masuk area layanan. Ketik nama kecamatan Anda untuk memastikan.`,
    }
  }

  return {
    tone: 'unknown',
    message:
      'Kecamatan tidak ditemukan. Coba ketik nama kecamatan lain, mis. Sukajadi atau Dayeuhkolot.',
  }
}

export async function checkPointArea(point: PickupPoint, signal?: AbortSignal) {
  const params = new URLSearchParams({ lat: String(point.lat), lng: String(point.lng) })
  const response = await fetch(`${urlFor('area.check')}?${params}`, {
    signal,
    headers: { accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error('area check failed')
  }
  const body = (await response.json()) as { covered: boolean; name: string | null }
  return body.covered ? 'covered' : 'outside'
}
