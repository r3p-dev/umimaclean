import type { Data } from '@generated/data'

export type OrderStatus = Data.OrderSummary['status']

export type OrderStage = 'jemput' | 'periksa' | 'bayar' | 'cuci' | 'antar' | 'selesai' | 'batal'

export const OrderStatusLabel: Record<OrderStatus, string> = {
  awaiting_pickup: 'Menunggu Penjemputan',
  courier_en_route: 'Kurir Menuju Lokasi',
  picked_up: 'Barang Kami Terima',
  in_inspection: 'Sedang Diperiksa',
  awaiting_payment: 'Menunggu Pembayaran',
  in_cleaning: 'Dalam Pencucian',
  ready_for_delivery: 'Siap Diantar',
  in_delivery: 'Sedang Diantar',
  ready_for_collection: 'Siap Diambil',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export const OrderStageOf: Record<OrderStatus, OrderStage> = {
  awaiting_pickup: 'jemput',
  courier_en_route: 'jemput',
  picked_up: 'periksa',
  in_inspection: 'periksa',
  awaiting_payment: 'bayar',
  in_cleaning: 'cuci',
  ready_for_delivery: 'antar',
  in_delivery: 'antar',
  ready_for_collection: 'antar',
  completed: 'selesai',
  cancelled: 'batal',
}

// One map of order stages to Tailwind's palette (CONVENTIONS §9.1).
export const STAGE_TONES: Record<OrderStage, { badge: string; dot: string }> = {
  jemput: { badge: 'border-sky-200 bg-sky-50 text-sky-900', dot: 'bg-sky-600' },
  periksa: { badge: 'border-indigo-200 bg-indigo-50 text-indigo-900', dot: 'bg-indigo-600' },
  bayar: { badge: 'border-amber-200 bg-amber-50 text-amber-900', dot: 'bg-amber-600' },
  cuci: { badge: 'border-cyan-200 bg-cyan-50 text-cyan-900', dot: 'bg-cyan-600' },
  antar: { badge: 'border-violet-200 bg-violet-50 text-violet-900', dot: 'bg-violet-600' },
  selesai: { badge: 'border-emerald-200 bg-emerald-50 text-emerald-900', dot: 'bg-emerald-600' },
  batal: { badge: 'border-red-200 bg-red-50 text-red-900', dot: 'bg-red-600' },
}

const PROGRESS_STAGES: readonly { key: OrderStage; label: string }[] = [
  { key: 'jemput', label: 'Jemput' },
  { key: 'periksa', label: 'Periksa' },
  { key: 'bayar', label: 'Bayar' },
  { key: 'cuci', label: 'Cuci' },
  { key: 'antar', label: 'Antar' },
]

export type ProgressStepState = 'done' | 'current' | 'upcoming'

export function stageProgressSteps(status: OrderStatus): {
  key: OrderStage
  label: string
  state: ProgressStepState
}[] {
  const stage = OrderStageOf[status]
  if (stage === 'batal') {
    return PROGRESS_STAGES.map((entry) => ({ ...entry, state: 'upcoming' }))
  }
  if (stage === 'selesai') {
    return PROGRESS_STAGES.map((entry) => ({ ...entry, state: 'done' }))
  }
  const activeIndex = PROGRESS_STAGES.findIndex((entry) => entry.key === stage)
  return PROGRESS_STAGES.map((entry, index) => ({
    ...entry,
    state: index < activeIndex ? 'done' : index === activeIndex ? 'current' : 'upcoming',
  }))
}

export function itemsSummaryText(items: { itemKind: string }[]) {
  const shoes = items.filter((item) => item.itemKind === 'shoe').length
  const bags = items.filter((item) => item.itemKind === 'bag').length
  const helmets = items.filter((item) => item.itemKind === 'helmet').length
  const parts: string[] = []
  if (shoes > 0) {
    parts.push(`${shoes} sepatu`)
  }
  if (bags > 0) {
    parts.push(`${bags} tas`)
  }
  if (helmets > 0) {
    parts.push(`${helmets} helm`)
  }
  return parts.join(', ') || `${items.length} barang`
}

const SHORT_DATE_TIME = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Jakarta',
})

const CREATED_DATE = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
})

export function formatDateTimeId(iso: string) {
  return SHORT_DATE_TIME.format(new Date(iso))
}

export function formatCreatedDateId(iso: string) {
  return CREATED_DATE.format(new Date(iso))
}

export function whatsappOrderLink(whatsapp: string, storeName: string, orderNumber: string) {
  const text = `Halo ${storeName}, saya mau tanya pesanan ${orderNumber}.`
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`
}
