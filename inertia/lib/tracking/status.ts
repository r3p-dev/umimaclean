import { itemsSummary, totalItems } from '~/lib/order/items'
import { PICKUP_SLOTS, formatSchedule } from '~/lib/order/schedule'
import { billTotal } from '~/lib/payment/bill'
import { daysFromToday, formatDate } from '~/lib/shared/date'
import { formatRupiah } from '~/lib/shared/format'
import type { OrderRecord } from '~/lib/tracking/orders'

export const ORDER_STATUSES = [
  'Menunggu Penjemputan',
  'Kurir Menuju Lokasi',
  'Barang Kami Terima',
  'Sedang Diperiksa',
  'Menunggu Pembayaran',
  'Dalam Pencucian',
  'Siap Diantar',
  'Sedang Diantar',
  'Selesai',
  'Dibatalkan',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type StatusTone = 'jemput' | 'periksa' | 'bayar' | 'cuci' | 'antar' | 'selesai' | 'batal'

const TONES: StatusTone[] = ['jemput', 'periksa', 'bayar', 'cuci', 'antar', 'selesai', 'batal']
const PHASE_OF = [0, 0, 1, 1, 2, 3, 4, 4, 5, 6]
const PHASE_INDEX = [0, 0, 1, 1, 2, 3, 4, 4, 5, 5]

export const PHASES = ['Jemput', 'Periksa', 'Bayar', 'Cuci', 'Antar']

export const CANCELLED = 9
export const COMPLETED = 8
export const AWAITING_PAYMENT = 4

export function statusTone(index: number): StatusTone {
  return TONES[PHASE_OF[index]]
}

export function toneOfStatus(status: OrderStatus) {
  return statusTone(ORDER_STATUSES.indexOf(status))
}

export type StepState = 'done' | 'current' | 'upcoming'

export type ProofView = {
  key: 'pickup' | 'clean' | 'deliver'
  title: string
  time: string
  by: string
  caption: string
  available: boolean
  waitText: string
}

export type HistoryEntry = {
  key: string
  label: string
  state: StepState
  cancelledEntry: boolean
  tone: StatusTone
  time: string
  description: string
  isCurrent: boolean
  last: boolean
  proof: ProofView | null
}

export type InfoRow = { label: string; value: string }

export function isPaid(order: OrderRecord, index = order.status) {
  return index >= 5 && index !== CANCELLED
}

export function paymentLabel(order: OrderRecord, index = order.status) {
  if (index === CANCELLED) return 'Tidak ada tagihan'
  if (index < AWAITING_PAYMENT) return 'Belum ada tagihan'
  if (index === AWAITING_PAYMENT) return 'Belum dibayar'
  return 'Lunas'
}

function joined(parts: (string | undefined)[], separator = ' · ') {
  return parts.filter(Boolean).join(separator)
}

export function buildTracking(order: OrderRecord, index = order.status) {
  const cancelled = index === CANCELLED
  const count = totalItems(order.items)
  const total = order.bill ? formatRupiah(billTotal(order.bill)) : null
  const courier = order.courier ?? 'Kurir'
  const pickupDays = daysFromToday(order.pickupDate)
  const pickupWhen =
    pickupDays === 1
      ? 'besok'
      : pickupDays === 0
        ? 'hari ini'
        : formatDate(order.pickupDate, 'long')

  const headlines = [
    `Kurir akan menjemput ${pickupWhen}`,
    'Kurir sedang menuju alamat Anda',
    'Barang sudah kami terima',
    'Barang Anda sedang diperiksa',
    'Tagihan siap, silakan bayar',
    'Barang Anda sedang dicuci',
    'Bersih dan siap diantar',
    'Kurir sedang mengantar pesanan',
    'Pesanan selesai',
    'Pesanan dibatalkan',
  ]

  const sublines = [
    `${formatSchedule(order.pickupDate, order.pickupSlot, 'day')}. Kurir menghubungi via WhatsApp sebelum datang.`,
    joined([order.courier, order.pickupEta && `perkiraan tiba pukul ${order.pickupEta}`]) ||
      'Kurir dalam perjalanan ke alamat Anda.',
    `${count} barang dijemput${order.pickedAt ? ` pukul ${order.pickedAt}` : ''} dan sedang dibawa ke workshop.`,
    'Tim kami menentukan layanan yang paling sesuai, lalu mengirim tagihan.',
    'Pencucian dimulai setelah pembayaran diterima.',
    order.doneEstimateLong
      ? `Perkiraan selesai ${order.doneEstimateLong}.`
      : 'Kami kabari via WhatsApp saat selesai.',
    'Kami kabari via WhatsApp sebelum kurir berangkat.',
    joined([order.courier, order.deliveryEta && `perkiraan tiba pukul ${order.deliveryEta}`]) ||
      'Kurir dalam perjalanan ke alamat Anda.',
    order.receiver && order.events[COMPLETED]
      ? `Diterima oleh ${order.receiver}, ${order.events[COMPLETED].replace(', ', ' ')}. Terima kasih!`
      : 'Terima kasih sudah memakai Umima Clean!',
    'Dibatalkan atas permintaan pelanggan sebelum penjemputan.',
  ]

  const doneText = [
    `Pesanan dibuat. Jadwal jemput ${formatSchedule(order.pickupDate, order.pickupSlot, 'short')}.`,
    `${courier} berangkat menjemput.`,
    `${count} barang dijemput dan dibawa ke workshop.`,
    'Kondisi tiap barang diperiksa dan dicatat.',
    `Layanan ditentukan, tagihan ${total ?? ''} dikirim via WhatsApp.${order.paidTime ? ` Dibayar via QRIS pukul ${order.paidTime}.` : ''}`,
    'Pencucian dimulai.',
    'Pencucian selesai, barang dikemas.',
    `${courier} berangkat mengantar.`,
    order.receiver
      ? `Diterima oleh ${order.receiver}. Terima kasih!`
      : 'Pesanan diterima. Terima kasih!',
  ]

  const currentText = [
    'Kurir menghubungi via WhatsApp sebelum datang.',
    `${sublines[1]}.`.replace('..', '.'),
    'Barang sedang dibawa ke workshop.',
    'Tim menentukan layanan yang paling sesuai dengan kondisi barang.',
    `Tagihan ${total ?? ''} sudah dikirim via WhatsApp. Pencucian dimulai setelah dibayar dengan QRIS.`,
    order.doneEstimate ? `Perkiraan selesai ${order.doneEstimate}.` : '',
    'Kami kabari via WhatsApp sebelum kurir berangkat.',
    `${sublines[7]}.`.replace('..', '.'),
    '',
  ]

  const upcomingText = [
    '',
    'Kurir mengabari via WhatsApp sebelum berangkat.',
    'Kurir memotret barang saat menjemput.',
    'Tim menentukan layanan sesuai kondisi barang.',
    'Tagihan dikirim via WhatsApp setelah pemeriksaan.',
    'Dimulai setelah pembayaran diterima.',
    order.doneEstimate ? `Perkiraan ${order.doneEstimate}.` : '',
    'Jadwal antar dikabari via WhatsApp.',
    order.deliveryDate ? `Perkiraan ${order.deliveryDate}.` : '',
  ]

  const proofs: Record<number, Omit<ProofView, 'available' | 'waitText'>> = {
    2: {
      key: 'pickup',
      title: 'Bukti penjemputan',
      time: order.proofs?.pickup?.time ?? '',
      by: order.proofs?.pickup?.by ?? 'Kurir',
      caption: `foto: ${count} barang saat dijemput`,
    },
    6: {
      key: 'clean',
      title: 'Bukti pencucian',
      time: order.proofs?.clean?.time ?? '',
      by: order.proofs?.clean?.by ?? 'Tim workshop',
      caption: 'foto: barang setelah dicuci',
    },
    8: {
      key: 'deliver',
      title: 'Bukti pengantaran',
      time: order.proofs?.deliver?.time ?? '',
      by: order.proofs?.deliver?.by ?? 'Kurir',
      caption: 'foto: barang diterima pelanggan',
    },
  }

  const waitText = (key: ProofView['key']) => {
    if (cancelled) return 'Tidak ada. Pesanan dibatalkan sebelum tahap ini.'
    if (key === 'pickup')
      return index === 1
        ? 'Kurir sedang menuju. Foto diambil saat barang dijemput.'
        : 'Tersedia setelah kurir menjemput barang.'
    if (key === 'clean')
      return index === 5
        ? 'Pencucian sedang berlangsung. Foto tersedia setelah selesai.'
        : 'Tersedia setelah proses pencucian selesai.'
    return index === 7
      ? 'Kurir sedang mengantar. Foto diambil saat barang diserahkan.'
      : 'Belum tersedia. Foto diambil saat barang diserahkan.'
  }

  const steps = cancelled ? [0, -1] : [0, 1, 2, 3, 4, 5, 6, 7, 8]
  const history: HistoryEntry[] = steps.map((step, position) => {
    const cancelledEntry = step === -1
    const state: StepState = cancelledEntry
      ? 'current'
      : cancelled || step < index || index === COMPLETED
        ? 'done'
        : step === index
          ? 'current'
          : 'upcoming'
    const proof = cancelledEntry ? null : proofs[step]
    return {
      key: cancelledEntry ? 'cancelled' : String(step),
      label: cancelledEntry ? 'Dibatalkan' : ORDER_STATUSES[step],
      state,
      cancelledEntry,
      tone: cancelledEntry ? 'batal' : statusTone(step),
      time: cancelledEntry
        ? (order.events[CANCELLED] ?? '')
        : state === 'upcoming'
          ? ''
          : (order.events[step] ?? ''),
      description: cancelledEntry
        ? 'Dibatalkan atas permintaan Anda sebelum penjemputan. Tidak ada tagihan.'
        : state === 'done'
          ? doneText[step]
          : state === 'current'
            ? currentText[step]
            : upcomingText[step],
      isCurrent: state === 'current' && !cancelledEntry,
      last: position === steps.length - 1,
      proof: proof
        ? {
            ...proof,
            available: !cancelled && index >= step,
            waitText: waitText(proof.key),
          }
        : null,
    }
  })

  const phaseIndex = PHASE_INDEX[index]
  const phases = PHASES.map((label, position) => ({
    label,
    state: (cancelled
      ? 'upcoming'
      : position < phaseIndex
        ? 'done'
        : position === phaseIndex
          ? 'current'
          : 'upcoming') as StepState,
  }))

  const paymentRows: InfoRow[] = cancelled
    ? [{ label: 'Total', value: 'Rp0' }]
    : index < AWAITING_PAYMENT || !total
      ? [
          { label: 'Metode', value: 'QRIS' },
          { label: 'Total', value: 'Setelah barang diperiksa' },
        ]
      : index === AWAITING_PAYMENT
        ? [
            { label: 'Metode', value: 'QRIS' },
            { label: 'Total', value: total },
            { label: 'Tagihan dikirim', value: order.bill?.sentAt ?? '—' },
          ]
        : [
            { label: 'Metode', value: 'QRIS' },
            { label: 'Total', value: total },
            { label: 'Dibayar', value: order.paidAt ?? '—' },
          ]

  const picked = index >= 2 && !cancelled

  return {
    status: ORDER_STATUSES[index],
    index,
    cancelled,
    tone: statusTone(index),
    headline: headlines[index],
    subline: sublines[index],
    phases,
    history,
    historyCount: cancelled
      ? 'Dibatalkan'
      : index === COMPLETED
        ? 'Semua tahap selesai'
        : `${index} dari 9 tahap selesai`,
    needsPay: index === AWAITING_PAYMENT,
    servicesKnown: index >= AWAITING_PAYMENT && !cancelled && !!order.bill,
    servicesPending: !cancelled && (index < AWAITING_PAYMENT || !order.bill),
    itemsSummary: itemsSummary(order.items),
    total,
    payment: {
      label: paymentLabel(order, index),
      tone: (isPaid(order, index)
        ? 'antar'
        : index === AWAITING_PAYMENT
          ? 'bayar'
          : 'selesai') as StatusTone,
      rows: paymentRows,
    },
    pickup: {
      title: formatDate(order.pickupDate, 'short'),
      detail:
        picked && order.pickedAt ? `Dijemput ${order.pickedAt}` : PICKUP_SLOTS[order.pickupSlot],
    },
    delivery: {
      title: index >= 7 && !cancelled ? (order.deliveryDate ?? 'Segera') : 'Setelah selesai',
      detail:
        index === COMPLETED
          ? `Diterima ${order.deliveredTime ?? ''}`.trim()
          : index === 7
            ? `Tiba ±${order.deliveryEta ?? ''}`
            : 'Alamat yang sama',
    },
  }
}

export type TrackingView = ReturnType<typeof buildTracking>
