import type { PickupPoint } from '~/lib/order/draft'

export type TaskKind = 'jemput' | 'antar'

export type TaskSource = 'online' | 'toko'

export type Task = {
  ref: string
  name: string
  full: string
  area: string
  km: string
  eta: string
  at: string
  slot: string
  items: string
  lines: string[]
  addr: string
  note: string
  receiver?: string
  point: PickupPoint
  doneAt: string
  source: TaskSource
  tel: string
  count: number
  fresh?: boolean
}

type TaskSeed = Omit<Task, 'source' | 'tel' | 'count'>

const PICKUPS: TaskSeed[] = [
  {
    ref: 'UMC-H2F7QX',
    name: 'Laras P.',
    full: 'Laras Putri',
    area: 'Dago, Coblong',
    km: '0,8 km',
    eta: '4 mnt',
    at: '09.41',
    slot: '09.00–12.00',
    items: 'Sepatu ×2, Tas ×1',
    lines: ['Sepatu ×2', 'Tas ×1'],
    addr: 'Jl. Cisitu Indah III No. 12, RT 03/RW 05, Dago, Coblong, Kota Bandung',
    note: 'Pagar hitam, sebelah warung',
    point: { lat: -6.8806, lng: 107.6113 },
    doneAt: '09.48',
  },
  {
    ref: 'UMC-C4N8VD',
    name: 'Fajar N.',
    full: 'Fajar Nugraha',
    area: 'Sukagalih, Sukajadi',
    km: '1,4 km',
    eta: '6 mnt',
    at: '10.05',
    slot: '09.00–12.00',
    items: 'Sepatu ×1',
    lines: ['Sepatu ×1'],
    addr: 'Jl. Sukajadi No. 140, Sukagalih, Sukajadi, Kota Bandung',
    note: 'Rumah cat hijau, garasi biru',
    point: { lat: -6.889, lng: 107.596 },
    doneAt: '10.12',
  },
  {
    ref: 'UMC-K9P2RT',
    name: 'Siti A.',
    full: 'Siti Aminah',
    area: 'Sukarasa, Sukasari',
    km: '2,1 km',
    eta: '9 mnt',
    at: '10.30',
    slot: '12.00–15.00',
    items: 'Helm ×1, Tas ×1',
    lines: ['Helm ×1', 'Tas ×1'],
    addr: 'Jl. Gegerkalong Hilir No. 41, Sukarasa, Sukasari, Kota Bandung',
    note: 'Kos putri, titip ke ibu kos',
    point: { lat: -6.872, lng: 107.589 },
    doneAt: '10.41',
  },
  {
    ref: 'UMC-W3J6HB',
    name: 'Budi S.',
    full: 'Budi Santoso',
    area: 'Hegarmanah, Cidadap',
    km: '3,7 km',
    eta: '14 mnt',
    at: '11.00',
    slot: '12.00–15.00',
    items: 'Sepatu ×3',
    lines: ['Sepatu ×3'],
    addr: 'Jl. Setiabudi No. 229, Hegarmanah, Cidadap, Kota Bandung',
    note: 'Pos satpam, titip ke Pak Ujang',
    point: { lat: -6.865, lng: 107.598 },
    doneAt: '11.16',
  },
]

const DELIVERIES: TaskSeed[] = [
  {
    ref: 'UMC-P5H1ZE',
    name: 'Dewi L.',
    full: 'Dewi Lestari',
    area: 'Sekeloa, Coblong',
    km: '1,1 km',
    eta: '5 mnt',
    at: '13.20',
    slot: '13.00–15.00',
    items: 'Sepatu ×2',
    lines: ['Sepatu running abu · Deep Clean + Waterproofing', 'Sepatu kanvas biru · Cuci Reguler'],
    addr: 'Jl. Tubagus Ismail VIII No. 7, Sekeloa, Coblong, Kota Bandung',
    note: 'Pintu samping, bel sebelah kiri',
    receiver: 'Dewi (pemilik)',
    point: { lat: -6.886, lng: 107.621 },
    doneAt: '13.28',
  },
  {
    ref: 'UMC-R2C7MU',
    name: 'Hendra W.',
    full: 'Hendra Wijaya',
    area: 'Isola, Sukasari',
    km: '2,3 km',
    eta: '9 mnt',
    at: '13.45',
    slot: '13.00–15.00',
    items: 'Helm ×1, Sepatu ×1',
    lines: [
      'Helm full-face hitam · Helm Full-face + Anti-bau',
      'Sepatu kulit coklat · Deep Clean + Leather conditioning',
    ],
    addr: 'Jl. Gegerkalong Girang No. 18, Isola, Sukasari, Kota Bandung',
    note: 'Rumah pojok, pagar putih',
    receiver: 'Hendra (pemilik)',
    point: { lat: -6.864, lng: 107.593 },
    doneAt: '13.55',
  },
  {
    ref: 'UMC-B7J3KS',
    name: 'Yuni P.',
    full: 'Yuni Permata',
    area: 'Kayuambon, Lembang',
    km: '6,8 km',
    eta: '22 mnt',
    at: '14.20',
    slot: '15.00–18.00',
    items: 'Tas ×2',
    lines: ['Ransel hitam · Cuci Tas Besar', 'Tote kanvas · Cuci Tas Kecil + Waterproofing'],
    addr: 'Jl. Kolonel Masturi No. 88, Kayuambon, Lembang, Kab. Bandung Barat',
    note: 'Depan warung kopi',
    receiver: 'Yuni (pemilik)',
    point: { lat: -6.812, lng: 107.618 },
    doneAt: '14.31',
  },
]

export const WASHED_DELIVERY: TaskSeed = {
  ref: 'UMC-N5D9JC',
  name: 'Maya S.',
  full: 'Maya Sari',
  area: 'Cipaganti, Coblong',
  km: '2,9 km',
  eta: '11 mnt',
  at: '14.00',
  slot: '13.00–15.00',
  items: 'Sepatu ×1, Tas ×1',
  lines: ['Sepatu running putih · Deep Clean + Whitening', 'Tas selempang hitam · Cuci Tas Kecil'],
  addr: 'Jl. Cipaganti No. 102, Pasteur, Sukajadi, Kota Bandung',
  note: 'Pagar hijau, depan masjid',
  receiver: 'Maya (pemilik)',
  point: { lat: -6.889, lng: 107.604 },
  doneAt: '14.08',
  fresh: true,
}

export const SKIP_REASONS = [
  'Pelanggan tidak bisa dihubungi (±15 menit)',
  'Pelanggan tidak ada di lokasi',
  'Jalan ditutup / masalah rute',
  'Lokasi tidak bisa diakses',
  'Kendaraan bermasalah',
  'Lainnya',
]

function lineCount(line: string) {
  const match = line.match(/×(\d+)/)
  return match ? Number(match[1]) : 1
}

export function pickupQueue(): Task[] {
  return PICKUPS.map((task, index) => ({
    ...task,
    source: 'online',
    tel: `81223${456701 + index}`,
    count: task.lines.reduce((sum, line) => sum + lineCount(line), 0),
  }))
}

export function deliveryQueue(inserted: { at: number; tasks: TaskSeed[] }[] = []): Task[] {
  const seeds = DELIVERIES.slice()
  for (const group of inserted) seeds.splice(group.at, 0, ...group.tasks)
  return seeds.map((task, index) => ({
    ...task,
    source: task.ref === 'UMC-B7J3KS' ? 'toko' : 'online',
    tel: `81390${227801 + index}`,
    count: task.lines.length,
  }))
}

export const TASK_COPY = {
  jemput: {
    noun: 'Penjemputan',
    short: 'Jemput',
    title: 'Jemput',
    itemsTitle: 'Barang yang dijemput',
    itemsSub: 'perkiraan pelanggan',
  },
  antar: {
    noun: 'Pengantaran',
    short: 'Antar',
    title: 'Antar',
    itemsTitle: 'Barang yang diantar',
    itemsSub: 'sesuai pesanan',
  },
} as const

export const TASK_STEPS = ['Menuju Lokasi', 'Tiba', 'Foto Bukti', 'Selesai']

export function itemLineLabel(line: string) {
  const match = line.match(/^(\S+) ×(\d+)$/)
  if (!match) return line
  return `${match[2]} ${match[1] === 'Sepatu' ? 'pasang sepatu' : match[1].toLowerCase()}`
}

export function itemLineIcon(line: string) {
  const word = line.split(' ')[0]
  if (word === 'Sepatu' || word === 'Sneakers') return 'shoe'
  if (word === 'Tas' || word === 'Ransel' || word === 'Tote') return 'bag'
  if (word === 'Helm') return 'helmet'
  return 'other'
}

export type ItemIconKind = ReturnType<typeof itemLineIcon>
