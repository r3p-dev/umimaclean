import type { Data } from '@generated/data'
import type { PickupPoint } from '~/lib/location/point'

export type SavedAddress = Data.Address

export type AddressInput = {
  label: string
  recipientName: string
  recipientPhone: string
  addressText: string
  landmark: string
  point: PickupPoint
  isPrimary: boolean
}

export const ADDRESS_LABELS = ['Rumah', 'Kantor', 'Kos', 'Lainnya'] as const

export const MAX_ADDRESSES = 5

export function shortStreet(text: string) {
  return text
    .split(',')
    .slice(0, 2)
    .map((part) => part.trim())
    .filter((part) => part && !/^rt\b|^rw\b|\brt\s*\d/i.test(part))
    .join(', ')
}

export function addressSummary(count: number, primaryLabel: string | null) {
  if (count === 0) {
    return 'Belum ada alamat'
  }
  return primaryLabel ? `${count} alamat · ${primaryLabel} sebagai utama` : `${count} alamat`
}
