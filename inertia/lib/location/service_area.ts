import type { GeocodedAddress } from '~/lib/location/geocode'
import type { PickupPoint } from '~/lib/location/point'

export const SERVICE_CENTER: PickupPoint = { lat: -6.8779, lng: 107.6106 }

export type AreaTone = 'idle' | 'covered' | 'outside' | 'unknown'

export type Coverage = { city: string; districts: string[] | null }[]

export const CITY_DISTRICTS: Record<string, string[]> = {
  'Kota Bandung': [
    'Coblong',
    'Sukajadi',
    'Sukasari',
    'Cidadap',
    'Bandung Wetan',
    'Sumur Bandung',
    'Cicendo',
    'Andir',
    'Lengkong',
    'Regol',
    'Batununggal',
    'Kiaracondong',
    'Antapani',
    'Arcamanik',
    'Buahbatu',
    'Bojongloa Kaler',
    'Bojongloa Kidul',
    'Astanaanyar',
    'Babakan Ciparay',
    'Bandung Kulon',
    'Bandung Kidul',
    'Cibeunying Kaler',
    'Cibeunying Kidul',
    'Cibiru',
    'Cinambo',
    'Gedebage',
    'Mandalajati',
    'Panyileukan',
    'Rancasari',
    'Ujungberung',
  ],
  'Kota Cimahi': ['Cimahi Utara', 'Cimahi Tengah', 'Cimahi Selatan'],
}

const OUTSIDE: Record<string, string> = {
  Cileunyi: 'Kab. Bandung',
  Rancaekek: 'Kab. Bandung',
  Lembang: 'Kab. Bandung Barat',
  Parongpong: 'Kab. Bandung Barat',
  Ngamprah: 'Kab. Bandung Barat',
  Padalarang: 'Kab. Bandung Barat',
  Cisarua: 'Kab. Bandung Barat',
  Jatinangor: 'Kab. Sumedang',
  Tanjungsari: 'Kab. Sumedang',
  Purwakarta: 'Kab. Purwakarta',
  Garut: 'Kab. Garut',
  Subang: 'Kab. Subang',
  Cianjur: 'Kab. Cianjur',
}

export const AREA_QUERY_MAX = 40

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/^(kec\.?|kecamatan)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function bareRegion(value: string) {
  return normalize(value).replace(/^(kota|kab\.?|kabupaten)\s+/, '')
}

function isRegency(name: string) {
  return /^(kab\.?|kabupaten)\s/i.test(name.trim())
}

function districtsOf(entry: Coverage[number]) {
  return entry.districts ?? CITY_DISTRICTS[entry.city] ?? []
}

export function checkServiceArea(
  query: string,
  coverage: Coverage
): { tone: AreaTone; message: string } {
  const normalized = normalize(query)

  if (normalized.length < 3) {
    return {
      tone: 'idle',
      message: 'Ketik nama kecamatan untuk mengecek apakah alamat Anda bisa dijemput.',
    }
  }

  for (const entry of coverage) {
    const district = districtsOf(entry).find((name) => normalize(name).startsWith(normalized))
    if (district) {
      return {
        tone: 'covered',
        message: `Kec. ${district}, ${entry.city} masuk area layanan. Antar-jemput gratis.`,
      }
    }
  }

  const region = coverage.find((entry) => normalize(entry.city).includes(normalized))
  if (region?.districts) {
    return {
      tone: 'covered',
      message: `Sebagian ${region.city} masuk area layanan: Kec. ${region.districts.join(', ')}.`,
    }
  }
  if (region) {
    return { tone: 'covered', message: `${region.city} masuk area layanan. Antar-jemput gratis.` }
  }

  const outside = Object.keys(OUTSIDE).find((name) => normalize(name).startsWith(normalized))
  if (outside) {
    return {
      tone: 'outside',
      message: `Kec. ${outside}, ${OUTSIDE[outside]} belum masuk area layanan. Hubungi kami via WhatsApp untuk info perluasan area.`,
    }
  }

  return {
    tone: 'unknown',
    message:
      'Kecamatan tidak ditemukan. Coba ketik nama kecamatan lain, mis. Sukajadi atau Dayeuhkolot.',
  }
}

export function checkPointArea(address: GeocodedAddress | null, coverage: Coverage): AreaTone {
  if (!address) {
    return 'unknown'
  }

  const region = address.county ?? address.city ?? address.municipality
  if (!region) {
    return 'unknown'
  }
  const wantsRegency = !!address.county
  const area = coverage.find(
    (entry) =>
      isRegency(entry.city) === wantsRegency && bareRegion(entry.city) === bareRegion(region)
  )
  if (!area) {
    return 'outside'
  }
  if (area.districts === null) {
    return 'covered'
  }

  const covered = area.districts.map(normalize)
  const districts = [address.town, address.city_district, address.district, address.municipality]
    .filter((value): value is string => !!value)
    .map(normalize)
  if (districts.some((district) => covered.includes(district))) {
    return 'covered'
  }
  return districts.length ? 'outside' : 'unknown'
}
