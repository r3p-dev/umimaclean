import { customerLinks } from '~/lib/navigation/customer_links'
import type { OrderRecord } from '~/lib/tracking/orders'
import {
  AWAITING_PAYMENT,
  CANCELLED,
  COMPLETED,
  IN_CLEANING,
  ORDER_STATUSES,
  type StepState,
} from '~/lib/tracking/status'

type Step = { label: string; doneAt: number; waitingLabel: string | null }

function stepsOf(order: OrderRecord): Step[] {
  const washedAt = order.route.find((index) => index > IN_CLEANING) ?? COMPLETED
  const first: Step =
    order.source === 'store'
      ? { label: 'Diterima di toko', doneAt: order.route[0], waitingLabel: null }
      : { label: 'Dijemput kurir', doneAt: 2, waitingLabel: 'Menunggu penjemputan' }
  return [
    first,
    { label: 'Barang diperiksa, tagihan dibuat', doneAt: AWAITING_PAYMENT, waitingLabel: null },
    { label: 'Dibayar', doneAt: IN_CLEANING, waitingLabel: 'Menunggu pembayaran' },
    { label: 'Dicuci', doneAt: washedAt, waitingLabel: null },
    {
      label: order.returnMethod === 'store' ? 'Diambil di toko' : 'Diantar kembali',
      doneAt: COMPLETED,
      waitingLabel: order.returnMethod === 'store' ? 'Siap diambil di toko' : null,
    },
  ]
}

export type TimelineStep = { label: string; state: StepState; time: string }

export function orderTimeline(order: OrderRecord): TimelineStep[] {
  if (order.status === CANCELLED) {
    return [
      { label: 'Pesanan dibuat', state: 'done', time: order.events[0] ?? '' },
      { label: ORDER_STATUSES[CANCELLED], state: 'current', time: order.events[CANCELLED] ?? '' },
    ]
  }
  const steps = stepsOf(order)
  const current = steps.findIndex((step) => order.status < step.doneAt)
  return steps.map((step, index) => {
    const state: StepState =
      current === -1 || index < current ? 'done' : index === current ? 'current' : 'upcoming'
    return {
      label: state === 'current' && step.waitingLabel ? step.waitingLabel : step.label,
      state,
      time:
        state === 'done'
          ? (order.events[step.doneAt] ?? order.events[0] ?? '')
          : state === 'current'
            ? 'Sekarang'
            : '',
    }
  })
}

export function helpLink(number: string) {
  return `${customerLinks.whatsapp}?text=${encodeURIComponent(`Halo Umima Clean, saya mau tanya pesanan ${number}.`)}`
}
