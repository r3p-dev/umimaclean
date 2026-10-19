import { EMPTY_ITEMS, type ItemCounts } from '~/lib/order/items'
import type { OrderDraft } from '~/lib/order/draft'
import type { Bill } from '~/lib/payment/bill'
import { formatClock, toIso } from '~/lib/shared/date'
import { readStore, writeStore } from '~/lib/shared/storage'

export type Proof = { time: string; by: string }

export type OrderRecord = {
  number: string
  phone: string
  createdOn: string
  items: ItemCounts
  note: string
  address: string
  landmark: string
  pickupDate: string
  pickupSlot: number
  status: number
  demo?: boolean
  events: Partial<Record<number, string>>
  courier?: string
  pickupEta?: string
  pickedAt?: string
  bill?: Bill
  paidAt?: string
  paidTime?: string
  paidOn?: string
  doneEstimate?: string
  doneEstimateLong?: string
  deliveryDate?: string
  deliveryEta?: string
  deliveredTime?: string
  receiver?: string
  proofs?: { pickup?: Proof; clean?: Proof; deliver?: Proof }
}

export const DEMO_PHONE = '81223456789'

const DEMO_ADDRESS = 'Jl. Cisitu Indah III No. 12, RT 03/RW 05, Dago, Coblong'

const DEMO_ORDERS: OrderRecord[] = [
  {
    number: 'UMC-8F3K2Q',
    phone: DEMO_PHONE,
    createdOn: '2026-10-07',
    items: { sepatu: 2, tas: 1, helm: 0 },
    note: 'Sepatu putih ada noda kopi di bagian depan.',
    address: DEMO_ADDRESS,
    landmark: 'Pagar hitam, sebelah warung',
    pickupDate: '2026-10-08',
    pickupSlot: 0,
    status: 4,
    demo: true,
    events: {
      0: 'Rab, 7 Okt · 14.20',
      1: 'Kam, 8 Okt · 09.52',
      2: 'Kam, 8 Okt · 10.24',
      3: 'Kam, 8 Okt · 11.05',
      4: 'Kam, 8 Okt · 13.40',
      5: 'Kam, 8 Okt · 15.12',
      6: 'Sab, 10 Okt · 16.30',
      7: 'Sen, 12 Okt · 13.35',
      8: 'Sen, 12 Okt · 14.12',
      9: 'Rab, 7 Okt · 18.05',
    },
    courier: 'Dedi',
    pickupEta: '10.20',
    pickedAt: '10.24',
    bill: {
      lines: [
        {
          name: 'Sepatu kanvas putih',
          kind: 'Sepatu',
          services: [
            ['Deep Clean', 45000],
            ['Whitening', 10000],
          ],
        },
        {
          name: 'Sneakers kulit hitam',
          kind: 'Sepatu',
          services: [
            ['Deep Clean', 45000],
            ['Unyellowing sol', 20000],
            ['Leather conditioning', 10000],
          ],
        },
        { name: 'Ransel abu-abu', kind: 'Tas', services: [['Cuci Tas Besar', 65000]] },
      ],
      decidedAt: 'Kam, 8 Okt 13.40',
      sentAt: 'Kam, 8 Okt · 13.40',
    },
    paidAt: 'Kam, 8 Okt · 15.08',
    paidTime: '15.08',
    paidOn: 'Kam, 8 Okt 2026 · 15.08',
    doneEstimate: 'Sab, 10 Okt',
    doneEstimateLong: 'Sabtu, 10 Okt',
    deliveryDate: 'Sen, 12 Okt',
    deliveryEta: '14.10',
    deliveredTime: '14.12',
    receiver: 'Rina',
    proofs: {
      pickup: { time: 'Kam, 8 Okt 2026 · 10.24', by: 'Dedi (kurir)' },
      clean: { time: 'Sab, 10 Okt 2026 · 16.30', by: 'Sari (workshop)' },
      deliver: { time: 'Sen, 12 Okt 2026 · 14.12', by: 'Dedi (kurir)' },
    },
  },
  {
    number: 'UMC-3TQ9LM',
    phone: DEMO_PHONE,
    createdOn: '2026-08-14',
    items: { sepatu: 1, tas: 0, helm: 0 },
    note: '',
    address: DEMO_ADDRESS,
    landmark: '',
    pickupDate: '2026-08-15',
    pickupSlot: 1,
    status: 8,
    events: {},
    bill: {
      lines: [
        {
          name: 'Sepatu kanvas',
          kind: 'Sepatu',
          services: [
            ['Deep Clean', 45000],
            ['Whitening', 10000],
          ],
        },
      ],
      decidedAt: 'Sab, 15 Agu 14.10',
      sentAt: 'Sab, 15 Agu · 14.10',
    },
    paidAt: 'Sab, 15 Agu · 15.02',
  },
  {
    number: 'UMC-H7D2WA',
    phone: DEMO_PHONE,
    createdOn: '2026-06-02',
    items: { sepatu: 1, tas: 0, helm: 1 },
    note: '',
    address: DEMO_ADDRESS,
    landmark: '',
    pickupDate: '2026-06-03',
    pickupSlot: 0,
    status: 8,
    events: {},
    bill: {
      lines: [
        { name: 'Helm full-face', kind: 'Helm', services: [['Cuci Helm', 35000]] },
        {
          name: 'Sepatu lari',
          kind: 'Sepatu',
          services: [
            ['Deep Clean', 45000],
            ['Whitening', 10000],
          ],
        },
      ],
      decidedAt: 'Rab, 3 Jun 13.15',
      sentAt: 'Rab, 3 Jun · 13.15',
    },
    paidAt: 'Rab, 3 Jun · 14.40',
  },
  {
    number: 'UMC-Z4K8PE',
    phone: DEMO_PHONE,
    createdOn: '2026-03-19',
    items: { sepatu: 0, tas: 1, helm: 0 },
    note: '',
    address: DEMO_ADDRESS,
    landmark: '',
    pickupDate: '2026-03-20',
    pickupSlot: 2,
    status: 9,
    events: {},
  },
]

const ORDERS_KEY = 'umima:orders'
const LAST_ORDER_KEY = 'umima:last-order'

function placedOrders() {
  return readStore<OrderRecord[]>('local', ORDERS_KEY) ?? []
}

export function findOrder(number: string) {
  const key = number.toUpperCase()
  return [...placedOrders(), ...DEMO_ORDERS].find((order) => order.number === key) ?? null
}

export function ordersForPhone(phone: string) {
  return [...placedOrders(), ...DEMO_ORDERS]
    .filter((order) => order.phone === phone)
    .sort((a, b) => b.createdOn.localeCompare(a.createdOn))
}

export function newOrderNumber() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return 'UMC-' + Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

export function placeOrder(draft: OrderDraft) {
  const now = new Date()
  const order: OrderRecord = {
    number: newOrderNumber(),
    phone: draft.phone,
    createdOn: toIso(now),
    items: draft.items ?? EMPTY_ITEMS,
    note: draft.note,
    address: draft.address,
    landmark: draft.landmark,
    pickupDate: draft.date ?? toIso(now),
    pickupSlot: draft.slot ?? 0,
    status: 0,
    events: { 0: formatClock(now) },
  }
  writeStore('local', ORDERS_KEY, [order, ...placedOrders()])
  writeStore('session', LAST_ORDER_KEY, order.number)
  return order
}

export function lastPlacedOrder() {
  const number = readStore<string>('session', LAST_ORDER_KEY)
  return number ? findOrder(number) : null
}
