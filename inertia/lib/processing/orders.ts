import { CATEGORY_KEY, type ItemCategory, type Selection } from '~/lib/processing/catalog'
import { WASHED_DELIVERY, type Task, type TaskSource } from '~/lib/tasks/queue'
import type { ReturnMethod, WalkInOrder, Workday } from '~/lib/staff/workday'

export type ProcessItem = { id: string; category: ItemCategory; title: string; note: string }

export type ProcessOrder = {
  number: string
  customer: string
  customerFull: string
  phone: string
  source: TaskSource
  received: string
  estimate: string
  itemCount: number
  customerNote: string | null
  items: ProcessItem[]
  initial: Record<string, Selection>
  queueMeta: string
  returnMethod: ReturnMethod
  delivery?: Omit<Task, 'source' | 'tel' | 'count'>
}

export type WashItem = { name: string; category: ItemCategory; services: string[] }

export type WashOrder = {
  number: string
  customer: string
  source: TaskSource
  queueMeta: string
  statusSub: string
  items: WashItem[]
  returnMethod: ReturnMethod
  delivery?: Omit<Task, 'source' | 'tel' | 'count'>
}

export const INSPECTION_ORDERS: ProcessOrder[] = [
  {
    number: 'UMC-8F3K2Q',
    customer: 'Rina K.',
    customerFull: 'Rina Kartika',
    phone: '0812-••••-6789',
    source: 'online',
    received: 'Kam, 8 Okt · 10.24 · dijemput Dedi',
    estimate: 'Sepatu ×2, Tas ×1',
    itemCount: 3,
    customerNote: 'Sepatu putih ada noda kopi di bagian depan.',
    items: [
      {
        id: '1',
        category: 'Sepatu',
        title: 'Sepatu kanvas putih',
        note: 'Noda kopi di bagian depan, sol menguning ringan.',
      },
      {
        id: '2',
        category: 'Sepatu',
        title: 'Sneakers kulit hitam',
        note: 'Sol menguning, kulit kusam di bagian ujung.',
      },
      { id: '3', category: 'Tas', title: 'Ransel abu-abu', note: 'Debu dan noda di bagian bawah.' },
    ],
    initial: {
      '1': { base: 'Deep Clean', adds: ['Whitening'] },
      '2': { base: 'Deep Clean', adds: ['Unyellowing sol'] },
      '3': { base: null, adds: [] },
    },
    queueMeta: 'Diterima 10.24 · dijemput Dedi',
    returnMethod: 'antar',
  },
  {
    number: 'UMC-V8K2NP',
    customer: 'Wulan T.',
    customerFull: 'Wulan Tania',
    phone: '0813-••••-4231',
    source: 'online',
    received: 'Kam, 8 Okt · 08.55 · dijemput Dedi',
    estimate: 'Sepatu ×2',
    itemCount: 2,
    customerNote: null,
    items: [
      { id: '1', category: 'Sepatu', title: 'Sepatu lari biru', note: '' },
      { id: '2', category: 'Sepatu', title: 'Sepatu kanvas krem', note: '' },
    ],
    initial: {},
    queueMeta: 'Diterima 08.55 · dijemput Dedi',
    returnMethod: 'antar',
  },
  {
    number: 'UMC-T6M1QA',
    customer: 'Andi P.',
    customerFull: 'Andi Pratama',
    phone: '0813-••••-7016',
    source: 'toko',
    received: 'Kam, 8 Okt · 09.20 · datang ke toko',
    estimate: 'Sepatu ×1',
    itemCount: 1,
    customerNote: null,
    items: [{ id: '1', category: 'Sepatu', title: 'Sepatu running putih', note: '' }],
    initial: {},
    queueMeta: 'Datang ke toko 09.20 · bayar di kasir setelah diperiksa',
    returnMethod: 'toko',
  },
]

export const WASH_ORDERS: WashOrder[] = [
  {
    number: 'UMC-N5D9JC',
    customer: 'Maya S.',
    source: 'online',
    queueMeta: 'Lunas · QRIS · dicuci sejak kemarin 15.30',
    statusSub: 'Maya S. · Lunas via QRIS · dicuci sejak Rab, 7 Okt 15.30',
    items: [
      { name: 'Sepatu running putih', category: 'Sepatu', services: ['Deep Clean', 'Whitening'] },
      { name: 'Tas selempang hitam', category: 'Tas', services: ['Cuci Tas Kecil'] },
    ],
    returnMethod: 'antar',
    delivery: WASHED_DELIVERY,
  },
  {
    number: 'UMC-F8L3ZP',
    customer: 'Tono W.',
    source: 'toko',
    queueMeta: 'Lunas · Tunai · dicuci sejak 07.40',
    statusSub: 'Tono W. · Lunas tunai di toko · dicuci sejak Kam, 8 Okt 07.40',
    items: [{ name: 'Helm half-face hitam', category: 'Helm', services: ['Helm Half-face'] }],
    returnMethod: 'toko',
  },
  {
    number: 'UMC-Y1H6WS',
    customer: 'Indra K.',
    source: 'online',
    queueMeta: 'Lunas · QRIS · dicuci sejak 08.15',
    statusSub: 'Indra K. · Lunas via QRIS · dicuci sejak Kam, 8 Okt 08.15',
    items: [
      { name: 'Ransel kanvas hijau', category: 'Tas', services: ['Cuci Tas Besar'] },
      { name: 'Tas laptop abu', category: 'Tas', services: ['Cuci Tas Kecil'] },
    ],
    returnMethod: 'antar',
    delivery: {
      ref: 'UMC-Y1H6WS',
      name: 'Indra K.',
      full: 'Indra Kusuma',
      area: 'Lebakgede, Coblong',
      km: '0,6 km',
      eta: '3 mnt',
      at: '14.30',
      slot: '15.00–18.00',
      items: 'Tas ×2',
      lines: ['Ransel kanvas hijau · Cuci Tas Besar', 'Tas laptop abu · Cuci Tas Kecil'],
      addr: 'Jl. Dipatiukur No. 66, Lebakgede, Coblong, Kota Bandung',
      note: 'Kos hijau, lantai 2',
      receiver: 'Indra (pemilik)',
      point: { lat: -6.8898, lng: 107.6158 },
      doneAt: '14.36',
      fresh: true,
    },
  },
]

export const AWAITING_QRIS = ['Lina M.', 'Rudi H.']

function shortName(full: string) {
  const [first, second] = full.trim().split(/\s+/)
  return second ? `${first} ${second[0]}.` : first
}

export function walkInOrder(order: WalkInOrder): ProcessOrder {
  const items: ProcessItem[] = []
  const parts: string[] = []
  for (const category of ['Sepatu', 'Tas', 'Helm'] as ItemCategory[]) {
    const count = order.items[CATEGORY_KEY[category]]
    if (!count) continue
    parts.push(`${category} ×${count}`)
    for (let index = 1; index <= count; index++) {
      items.push({
        id: `${category}-${index}`,
        category,
        title: count > 1 ? `${category} ${index}` : category,
        note: '',
      })
    }
  }
  return {
    number: order.number,
    customer: shortName(order.customerFull),
    customerFull: order.customerFull,
    phone: order.phone,
    source: 'toko',
    received: `Hari ini · ${order.createdAt} · datang ke toko`,
    estimate: parts.join(', '),
    itemCount: items.length,
    customerNote: null,
    items,
    initial: {},
    queueMeta: `Datang ke toko ${order.createdAt} · bayar di kasir setelah diperiksa`,
    returnMethod: order.returnMethod,
    delivery:
      order.returnMethod === 'antar' && order.point
        ? {
            ref: order.number,
            name: shortName(order.customerFull),
            full: order.customerFull,
            area: order.address.split(',').slice(-2).join(',').trim() || order.address,
            km: '—',
            eta: '—',
            at: '—',
            slot: 'Hari ini',
            items: parts.join(', '),
            lines: parts,
            addr: order.address,
            note: '—',
            receiver: `${order.customerFull.split(' ')[0]} (pemilik)`,
            point: order.point,
            doneAt: '—',
            fresh: true,
          }
        : undefined,
  }
}

export function inspectionOrders(day: Workday) {
  return [...INSPECTION_ORDERS, ...day.walkIns.map(walkInOrder)]
}

export function findInspectionOrder(day: Workday, number: string) {
  return inspectionOrders(day).find((order) => order.number === number) ?? null
}
