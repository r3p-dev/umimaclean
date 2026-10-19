import { totalItems, type ItemCounts } from '~/lib/order/items'
import type { PickupPoint } from '~/lib/order/draft'
import { newOrderNumber } from '~/lib/tracking/orders'
import { createSharedStore } from '~/lib/shared/shared_store'
import { STORE_LOCATION } from '~/lib/staff/profile'
import { clockTime, workday, type ReturnMethod } from '~/lib/staff/workday'

export type KnownCustomer = {
  phone: string
  name: string
  initial: string
  masked: string
  history: string
  area: string
  address: string
  point: PickupPoint
}

const KNOWN_CUSTOMERS: KnownCustomer[] = [
  {
    phone: '081223456789',
    name: 'Rina Kartika',
    initial: 'R',
    masked: '0812-••••-6789',
    history: '4 pesanan · terakhir 14 Agu',
    area: 'sekitar Dago, Coblong',
    address: 'Jl. Cisitu Indah III No. 12, RT 03/RW 05, Dago, Coblong, Kota Bandung',
    point: { lat: -6.8806, lng: 107.6113 },
  },
]

export const WALK_IN_STEPS = [
  { label: '1 Pelanggan', done: true },
  { label: '2 Barang diterima', done: true },
  { label: '3 Pengembalian', done: true },
  { label: '4 Periksa & layanan', done: false },
  { label: '5 Bayar (QRIS · Tunai · EDC)', done: false },
  { label: '6 Dalam pencucian', done: false },
]

export const RETURN_OPTIONS: {
  key: ReturnMethod
  label: string
  description: string
}[] = [
  {
    key: 'toko',
    label: 'Diambil di toko',
    description: 'Pelanggan mengambil sendiri setelah dikabari',
  },
  {
    key: 'antar',
    label: 'Diantar ke alamat',
    description: 'Masuk antrean Antar setelah selesai dicuci',
  },
]

export function sanitizePhone(value: string) {
  return value.replace(/[^\d+ ]/g, '').slice(0, 16)
}

export function lookupCustomer(value: string) {
  const digits = value.replace(/\D/g, '')
  const complete = digits.length >= 10
  const normalized = digits.replace(/^62/, '0')
  const match = complete
    ? (KNOWN_CUSTOMERS.find((customer) => customer.phone === normalized) ?? null)
    : null
  return { digits, complete, match }
}

export function maskWalkInPhone(digits: string) {
  const normalized = digits.replace(/^62/, '0')
  return `${normalized.slice(0, 4)}-••••-${normalized.slice(-4)}`
}

export type WalkInDraft = {
  phone: string
  name: string
  customer: KnownCustomer | null
  items: ItemCounts
  returnMethod: ReturnMethod
  address: string
  point: PickupPoint | null
}

export function walkInBlocker(draft: WalkInDraft) {
  const lookup = lookupCustomer(draft.phone)
  if (!lookup.complete) return 'Masukkan nomor HP pelanggan.'
  if (lookup.match && !draft.customer) return 'Pilih pelanggan yang disarankan.'
  if (!lookup.match && !draft.name.trim()) return 'Isi nama pelanggan.'
  if (totalItems(draft.items) === 0) return 'Tambahkan minimal 1 barang.'
  if (draft.returnMethod === 'antar' && draft.point && !draft.address.trim()) {
    return 'Isi alamat antar.'
  }
  return null
}

export function createWalkIn(draft: WalkInDraft) {
  const lookup = lookupCustomer(draft.phone)
  const number = newOrderNumber()
  const known = draft.customer
  workday.set((day) => ({
    ...day,
    walkIns: [
      ...day.walkIns,
      {
        number,
        customer: known ? known.name : draft.name.trim(),
        customerFull: known ? known.name : draft.name.trim(),
        phone: known ? known.masked : maskWalkInPhone(lookup.digits),
        known: Boolean(known),
        items: draft.items,
        returnMethod: draft.returnMethod,
        address: known && !draft.point ? known.address : draft.address.trim(),
        point: known && !draft.point ? known.point : draft.point,
        createdAt: clockTime(),
      },
    ],
  }))
  return number
}

export type WalkInForm = {
  phone: string
  name: string
  picked: boolean
  items: ItemCounts
  returnMethod: ReturnMethod
  useSaved: boolean
  point: PickupPoint
  typedAddress: string | null
  photos: number
}

export const walkInForm = createSharedStore<WalkInForm>('session', 'umima:walk-in-form', () => ({
  phone: '',
  name: '',
  picked: false,
  items: { sepatu: 0, tas: 0, helm: 0 },
  returnMethod: 'antar',
  useSaved: true,
  point: STORE_LOCATION,
  typedAddress: null,
  photos: 0,
}))

export function updateWalkInForm(patch: Partial<WalkInForm>) {
  walkInForm.set((form) => ({ ...form, ...patch }))
}
