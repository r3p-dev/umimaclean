import { ACTIVITIES } from '~/lib/activity/log'
import { CUSTOMERS } from '~/lib/customers/segments'
import { ORDER_ROWS } from '~/lib/orders/data'
import { MONTH_SHORT, formatDayMonth, fromIso } from '~/lib/shared/date'
import { formatRupiah } from '~/lib/shared/format'
import { createSharedStore } from '~/lib/shared/shared_store'
import type { StatusTone } from '~/lib/tracking/status'

export const PHASE_LABEL: Record<StatusTone, string> = {
  jemput: 'Menunggu Penjemputan',
  periksa: 'Sedang Diperiksa',
  bayar: 'Menunggu Pembayaran',
  cuci: 'Dalam Pencucian',
  antar: 'Siap Diantar',
  selesai: 'Selesai',
  batal: 'Dibatalkan',
}

export const PHASE_FILTERS: StatusTone[] = [
  'jemput',
  'periksa',
  'bayar',
  'cuci',
  'antar',
  'selesai',
  'batal',
]

const PHASE_ORDER: Record<StatusTone, number> = {
  jemput: 1,
  periksa: 2,
  bayar: 3,
  cuci: 4,
  antar: 5,
  selesai: 6,
  batal: 7,
}

export const CANCEL_REASONS = [
  'Pelanggan membatalkan',
  'Tidak bisa dihubungi',
  'Di luar area layanan',
  'Lainnya',
]

export const DETAIL_CANCEL_REASONS = [
  'Permintaan pelanggan',
  'Pelanggan tidak bisa dihubungi',
  'Di luar area layanan',
  'Lainnya',
]

export const FIX_METHODS = ['QRIS (offline)', 'Tunai di toko', 'EDC di toko', 'QRIS (online)']

export type AuditEntry = { time: string; who: string; what: string; sensitive: boolean }

export type PaymentFix = { method: string; amount: number; reason: string }

type OrderChange = {
  phase?: StatusTone
  status?: string
  payment?: string
  fix?: PaymentFix
  log?: AuditEntry[]
}

export type AdminOrder = {
  id: string
  label: string
  number: string
  customer: string
  area: string
  store: boolean
  status: string
  phase: StatusTone
  total: number
  payment: string
  staff: string
  date: Date
  fix: PaymentFix | null
  log: AuditEntry[]
}

export const orderChanges = createSharedStore<Record<string, OrderChange>>(
  'local',
  'umima:admin-order-changes',
  () => ({})
)

export function adminOrders(changes: Record<string, OrderChange>): AdminOrder[] {
  return ORDER_ROWS.map(
    ([number, customer, area, store, status, phase, total, payment, staff, date]) => {
      const edit = changes[number] ?? {}
      return {
        id: number,
        label: `${number} · ${customer}`,
        number,
        customer,
        area,
        store: store === 1,
        status: edit.status ?? status,
        phase: edit.phase ?? phase,
        total,
        payment: edit.payment ?? payment,
        staff,
        date: fromIso(date),
        fix: edit.fix ?? null,
        log: edit.log ?? [],
      }
    }
  )
}

export function phaseRank(phase: StatusTone) {
  return PHASE_ORDER[phase]
}

const NEEDS_PAYMENT: Partial<Record<StatusTone, boolean>> = {
  cuci: true,
  antar: true,
  selesai: true,
}

function isPaid(order: AdminOrder) {
  return /^Lunas/.test(order.payment)
}

export function statusEligible(selected: AdminOrder[], target: StatusTone) {
  return selected.filter(
    (order) =>
      order.phase !== 'batal' && order.phase !== target && (!NEEDS_PAYMENT[target] || isPaid(order))
  )
}

export function statusNote(selected: AdminOrder[], target: StatusTone | null) {
  if (!target) return 'Pilih status tujuan. Perubahan dicatat di Aktivitas Staf.'
  const eligible = statusEligible(selected, target).length
  const same = selected.filter((order) => order.phase === target).length
  const cancelled = selected.filter((order) => order.phase === 'batal' && target !== 'batal').length
  const unpaid = NEEDS_PAYMENT[target]
    ? selected.filter(
        (order) => order.phase !== 'batal' && order.phase !== target && !isPaid(order)
      ).length
    : 0
  const skipped: string[] = []
  if (same) skipped.push(`${same} sudah berstatus ini`)
  if (cancelled) skipped.push(`${cancelled} sudah dibatalkan`)
  if (unpaid) skipped.push(`${unpaid} belum lunas`)
  return (
    `${eligible} dari ${selected.length} pesanan akan diubah ke “${PHASE_LABEL[target]}”.` +
    (skipped.length ? ` Dilewati: ${skipped.join(', ')}.` : '')
  )
}

export function cancelable(selected: AdminOrder[]) {
  return selected.filter((order) => order.phase !== 'selesai' && order.phase !== 'batal')
}

function change(numbers: string[], update: (current: OrderChange) => OrderChange) {
  orderChanges.set((all) => {
    const next = { ...all }
    for (const number of numbers) next[number] = update(next[number] ?? {})
    return next
  })
}

export function applyStatus(numbers: string[], target: StatusTone) {
  change(numbers, (current) => ({ ...current, phase: target, status: PHASE_LABEL[target] }))
}

export function cancelOrders(orders: AdminOrder[], reason: string, time: string) {
  for (const order of orders) {
    change([order.number], (current) => ({
      ...current,
      phase: 'batal',
      status: 'Dibatalkan',
      payment: isPaid(order) ? `${order.payment} · perlu refund` : 'Tidak ada tagihan',
      log: [
        { time, who: 'Umi (owner)', what: `membatalkan pesanan · ${reason}`, sensitive: true },
        ...(current.log ?? []),
      ],
    }))
  }
}

export function fixPayment(order: AdminOrder, fix: PaymentFix, time: string) {
  change([order.number], (current) => ({
    ...current,
    phase: 'cuci',
    status: 'Dalam Pencucian',
    payment: 'Lunas · dikoreksi',
    fix,
    log: [
      {
        time,
        who: 'Umi (owner)',
        what: `mengoreksi pembayaran → ${fix.method} ${formatRupiah(fix.amount)} · “${fix.reason}”`,
        sensitive: true,
      },
      ...(current.log ?? []),
    ],
  }))
}

export type DetailItem = { name: string; category: string; services: [string, number][] }

type DetailExtras = {
  createdText: string
  phone: string
  address: string
  waNumber: string
  pricedBy: string
  items: DetailItem[]
  payRows: { label: string; value: string }[]
  audit: AuditEntry[]
  proofs: { label: string; time: string | null }[]
}

const DESIGNED: Record<string, DetailExtras> = {
  'UMC-8F3K2Q': {
    createdText: 'Dibuat Rab 7 Okt 2026 · 19.42 · dijemput Dedi · diperiksa Sari',
    phone: '+62 812-2345-6789',
    address: 'Jl. Cisitu Indah III No. 12, RT 03/RW 05, Dago, Coblong · patokan: pagar hitam',
    waNumber: '6281223456789',
    pricedBy: 'ditentukan Sari · 8 Okt 13.40',
    items: [
      {
        name: 'Sepatu running putih',
        category: 'Sepatu',
        services: [
          ['Deep Clean', 45000],
          ['Whitening', 10000],
          ['Unyellowing sol', 20000],
        ],
      },
      {
        name: 'Sneakers kulit hitam',
        category: 'Sepatu',
        services: [
          ['Deep Clean', 45000],
          ['Leather care', 15000],
        ],
      },
      { name: 'Ransel abu-abu', category: 'Tas', services: [['Premium Clean', 60000]] },
    ],
    payRows: [
      { label: 'Tagihan', value: 'Rp195.000 · dikirim 8 Okt 13.41' },
      { label: 'Metode', value: 'QRIS (online)' },
      { label: 'Pengingat', value: 'otomatis · 2 terkirim' },
      { label: 'Dicatat oleh', value: '—' },
    ],
    audit: [
      {
        time: '13.40',
        who: 'Sari',
        what: 'menentukan layanan 3 barang · total Rp195.000',
        sensitive: false,
      },
      {
        time: '10.24',
        who: 'Dedi',
        what: 'menyelesaikan penjemputan · foto bukti',
        sensitive: false,
      },
      { time: '19.42', who: 'Sistem', what: 'pesanan dibuat dari situs (7 Okt)', sensitive: false },
    ],
    proofs: [
      { label: 'Jemput', time: '8 Okt 10.24' },
      { label: 'Pencucian', time: null },
      { label: 'Antar', time: null },
    ],
  },
}

function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1)
}

export function orderDetail(order: AdminOrder, all: AdminOrder[]) {
  const designed = DESIGNED[order.number]
  const customer = CUSTOMERS.find((item) => item.name === order.customer)
  const rank = phaseRank(order.phase)
  const dateText = formatDayMonth(order.date)
  const extras: DetailExtras = designed ?? {
    createdText: `Dibuat ${formatDayMonth(order.date, true)} · ${order.store ? 'transaksi di toko' : 'dari situs'} · ditangani ${order.staff}`,
    phone: customer?.phone ?? '—',
    address: order.store ? 'Transaksi di toko' : `Area ${order.area}`,
    waNumber: '',
    pricedBy: order.total ? `ditentukan ${order.staff}` : 'belum diperiksa',
    items: [],
    payRows: [
      { label: 'Tagihan', value: order.total ? formatRupiah(order.total) : '—' },
      { label: 'Status', value: order.payment },
      { label: 'Dicatat oleh', value: /^Lunas/.test(order.payment) ? order.staff : '—' },
    ],
    audit: [
      ...ACTIVITIES.filter((activity) => activity.ref === order.number).map((activity) => ({
        time: activity.time,
        who: activity.staff.split(' ')[0],
        what: `${lowerFirst(activity.action)} · ${activity.detail}`,
        sensitive: activity.sensitive,
      })),
      {
        time: '—',
        who: 'Sistem',
        what: `pesanan dibuat ${order.store ? 'di toko' : 'dari situs'} (${dateText})`,
        sensitive: false,
      },
    ],
    proofs: [
      { label: 'Jemput', time: !order.store && rank >= 2 && rank < 7 ? dateText : null },
      { label: 'Pencucian', time: rank >= 5 && rank < 7 ? dateText : null },
      { label: 'Antar', time: rank === 6 ? dateText : null },
    ],
  }

  const history = all
    .filter((item) => item.customer === order.customer)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
  const since = history[history.length - 1]?.date ?? order.date
  const billed = history.reduce((sum, item) => sum + item.total, 0)

  return {
    ...extras,
    payRows: order.fix
      ? [
          { label: 'Metode', value: order.fix.method },
          { label: 'Jumlah', value: formatRupiah(order.fix.amount) },
          { label: 'Dicatat oleh', value: 'Umi Maryam (owner) · koreksi' },
          { label: 'Alasan', value: order.fix.reason },
        ]
      : extras.payRows,
    audit: [...order.log, ...extras.audit],
    history,
    historySummary: `Pelanggan sejak ${MONTH_SHORT[since.getMonth()]} ${since.getFullYear()} · ${history.length} pesanan · ${formatRupiah(billed)} total tagihan.`,
    paymentTone:
      order.phase === 'batal'
        ? 'batal'
        : /^Lunas/.test(order.payment)
          ? 'ok'
          : order.total
            ? 'bayar'
            : 'off',
  } as const
}
