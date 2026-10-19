import type { GeocodedAddress } from '~/lib/location/geocode'
import type { PickupPoint } from '~/lib/order/draft'

export const SERVICE_CENTER: PickupPoint = { lat: -6.8779, lng: 107.6106 }

export type AreaTone = 'idle' | 'covered' | 'outside' | 'unknown'

const COVERED = {
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
  'Kab. Bandung': [
    'Dayeuhkolot',
    'Bojongsoang',
    'Baleendah',
    'Margahayu',
    'Margaasih',
    'Cileunyi',
    'Soreang',
    'Katapang',
    'Rancaekek',
  ],
  'Kab. Bandung Barat': ['Lembang', 'Parongpong', 'Ngamprah', 'Padalarang', 'Cisarua'],
}

const OUTSIDE: Record<string, string> = {
  Jatinangor: 'Kab. Sumedang',
  Tanjungsari: 'Kab. Sumedang',
  Purwakarta: 'Kab. Purwakarta',
  Garut: 'Kab. Garut',
  Subang: 'Kab. Subang',
  Cianjur: 'Kab. Cianjur',
}

export const SERVICE_REGIONS = Object.keys(COVERED)

export const AREA_QUERY_MAX = 40

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/^(kec\.?|kecamatan)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function checkServiceArea(query: string): { tone: AreaTone; message: string } {
  const q = normalize(query)

  if (q.length < 3) {
    return {
      tone: 'idle',
      message: 'Ketik nama kecamatan untuk mengecek apakah alamat Anda bisa dijemput.',
    }
  }

  for (const [region, districts] of Object.entries(COVERED)) {
    const district = districts.find((name) => normalize(name).startsWith(q))
    if (district) {
      return {
        tone: 'covered',
        message: `Kec. ${district}, ${region} masuk area layanan. Antar-jemput gratis.`,
      }
    }
  }

  const region = SERVICE_REGIONS.find((name) => normalize(name).includes(q))
  if (region) {
    return { tone: 'covered', message: `${region} masuk area layanan. Antar-jemput gratis.` }
  }

  const outside = Object.keys(OUTSIDE).find((name) => normalize(name).startsWith(q))
  if (outside) {
    return {
      tone: 'outside',
      message: `Kec. ${outside}, ${OUTSIDE[outside]} belum masuk area layanan. Hubungi kami via WhatsApp untuk info perluasan area.`,
    }
  }

  return {
    tone: 'unknown',
    message:
      'Kecamatan tidak ditemukan. Coba ketik nama kecamatan lain, mis. Sukajadi atau Lembang.',
  }
}

const COVERED_REGIONS = ['bandung', 'cimahi', 'bandung barat']

function normalizeRegion(value: string) {
  return normalize(value).replace(/^(kota|kabupaten|kab\.?)\s+/, '')
}

export function checkPointArea(address: GeocodedAddress | null): AreaTone {
  if (!address) return 'unknown'
  const regions = [address.city, address.county, address.municipality, address.town]
    .filter((value): value is string => !!value)
    .map(normalizeRegion)
  const districts = [address.district, address.city_district, address.suburb, address.village]
    .filter((value): value is string => !!value)
    .map(normalize)
  const coveredDistricts = Object.values(COVERED).flat().map(normalize)
  if (
    regions.some((region) => COVERED_REGIONS.includes(region)) ||
    districts.some((district) => coveredDistricts.includes(district))
  ) {
    return 'covered'
  }
  return regions.length || districts.length ? 'outside' : 'unknown'
}
