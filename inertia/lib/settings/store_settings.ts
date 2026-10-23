import { router } from '@inertiajs/react'
import { urlFor } from '~/client'
import type { Coverage } from '~/lib/location/service_area'

export type StorePayKey = 'qris' | 'cash' | 'edc'

export const STORE_PAY_METHODS: { key: StorePayKey; label: string }[] = [
  { key: 'qris', label: 'QRIS (dari Midtrans)' },
  { key: 'cash', label: 'Tunai di toko' },
  { key: 'edc', label: 'EDC di toko' },
]

export type PickupSlotSetting = { label: string; capacity: number; on: boolean }

export type StoreSettings = {
  name: string
  whatsapp: string
  address: string
  hours: string
  areas: Coverage
  slots: PickupSlotSetting[]
  payments: Record<StorePayKey, boolean>
  inactiveDays: number
}

export const SLOT_CAPACITY = { min: 1, max: 20 }

export function areaCount(areas: Coverage) {
  return areas.reduce((sum, area) => sum + (area.districts?.length ?? 0), 0)
}

export function areaError(areas: Coverage, city: string, name: string) {
  const value = name.trim()
  if (!value) {
    return 'Tulis nama kecamatan.'
  }
  const area = areas.find((item) => item.city === city)
  if (area && area.districts === null) {
    return `Seluruh ${city} sudah termasuk area layanan.`
  }
  if ((area?.districts ?? []).some((item) => item.toLowerCase() === value.toLowerCase())) {
    return `Sudah ada di ${city}.`
  }
  return null
}

export function saveStoreSettings(
  settings: StoreSettings,
  callbacks: { onError?: (errors: Record<string, string>) => void; onFinish?: () => void } = {}
) {
  const { name, address, ...rest } = settings
  router.put(
    urlFor('admin.store.update'),
    { ...rest, storeName: name, storeAddress: address },
    { preserveScroll: true, ...callbacks }
  )
}
