import { createSharedStore } from '~/lib/shared/shared_store'

export type StorePayKey = 'qris' | 'cash' | 'edc'

export const STORE_PAY_METHODS: { key: StorePayKey; label: string }[] = [
  { key: 'qris', label: 'QRIS (offline)' },
  { key: 'cash', label: 'Tunai di toko' },
  { key: 'edc', label: 'EDC di toko' },
]

export type PickupSlotSetting = { label: string; capacity: number; on: boolean }

export type StoreSettings = {
  name: string
  whatsapp: string
  address: string
  hours: string
  areas: Record<string, string[]>
  slots: PickupSlotSetting[]
  payments: Record<StorePayKey, boolean>
  inactiveDays: number
}

export function defaultStoreSettings(): StoreSettings {
  return {
    name: 'Umima Clean',
    whatsapp: '0811-2200-1100',
    address: 'Jl. Margacinta No. 132, Margasari, Buahbatu, Kota Bandung 40286',
    hours: 'Senin–Sabtu · 08.00–19.00',
    areas: {
      'Kota Bandung': [
        'Coblong',
        'Sukajadi',
        'Cidadap',
        'Bandung Wetan',
        'Sumur Bandung',
        'Lengkong',
        'Antapani',
        'Cicendo',
      ],
      'Kota Cimahi': ['Cimahi Utara', 'Cimahi Tengah'],
      'Kab. Bandung': ['Dayeuhkolot', 'Bojongsoang'],
      'Kab. Bandung Barat': ['Lembang', 'Parongpong'],
    },
    slots: [
      { label: '09.00–12.00', capacity: 6, on: true },
      { label: '12.00–15.00', capacity: 6, on: true },
      { label: '15.00–18.00', capacity: 4, on: true },
    ],
    payments: { qris: true, cash: true, edc: true },
    inactiveDays: 60,
  }
}

export const storeSettings = createSharedStore<StoreSettings>(
  'local',
  'umima:store-settings',
  defaultStoreSettings
)

export const SLOT_CAPACITY = { min: 1, max: 20 }

export function areaCount(areas: Record<string, string[]>) {
  return Object.values(areas).reduce((sum, list) => sum + list.length, 0)
}

export function areaError(areas: Record<string, string[]>, city: string, name: string) {
  const value = name.trim()
  if (!value) return 'Tulis nama kecamatan.'
  if ((areas[city] ?? []).some((item) => item.toLowerCase() === value.toLowerCase())) {
    return `Sudah ada di ${city}.`
  }
  return null
}
