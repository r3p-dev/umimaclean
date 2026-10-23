import {
  ORDER_STATUS_SEQUENCE,
  OrderStatus as OrderStatusKey,
  OrderStatusLabel,
  OrderStatusStage,
  orderStatusIndex,
  type OrderStage,
} from '@enums/order_enum'
import { itemsSummary } from '~/lib/order/items'
import { formatRupiah } from '~/lib/shared/format'
import type { OrderRecord } from '~/lib/tracking/orders'

export const ORDER_STATUSES = ORDER_STATUS_SEQUENCE.map((status) => OrderStatusLabel[status])

export type OrderStatus = (typeof OrderStatusLabel)[keyof typeof OrderStatusLabel]

export type StatusTone = OrderStage

export type StepState = 'done' | 'current' | 'upcoming'

const TONES: StatusTone[] = ['jemput', 'periksa', 'bayar', 'cuci', 'antar', 'selesai', 'batal']

export const PHASES = ['Jemput', 'Periksa', 'Bayar', 'Cuci', 'Antar']

export const CANCELLED = orderStatusIndex(OrderStatusKey.CANCELLED)
export const COMPLETED = orderStatusIndex(OrderStatusKey.COMPLETED)
export const AWAITING_PAYMENT = orderStatusIndex(OrderStatusKey.AWAITING_PAYMENT)
export const IN_CLEANING = orderStatusIndex(OrderStatusKey.IN_CLEANING)

export function statusTone(index: number): StatusTone {
  return OrderStatusStage[ORDER_STATUS_SEQUENCE[index]]
}

export function phaseOf(index: number) {
  return TONES.indexOf(statusTone(index))
}

export function toneOfStatus(status: OrderStatus) {
  return statusTone(ORDER_STATUSES.indexOf(status))
}

export function isPaid(order: OrderRecord, index = order.status) {
  return index >= IN_CLEANING && index !== CANCELLED
}

export function paymentLabel(order: OrderRecord, index = order.status) {
  if (index === CANCELLED) {
    return 'Tidak ada tagihan'
  }
  if (index < AWAITING_PAYMENT) {
    return 'Belum ada tagihan'
  }
  if (index === AWAITING_PAYMENT) {
    return 'Belum dibayar'
  }
  return order.paymentMethod ? `Lunas · ${order.paymentMethod}` : 'Lunas'
}

export function buildTracking(order: OrderRecord, index = order.status) {
  const isCancelled = index === CANCELLED
  const total = order.bill ? formatRupiah(order.bill.total) : null
  const phaseIndex = Math.min(phaseOf(index), PHASES.length)
  const phases = PHASES.map((label, position) => ({
    label,
    state: (isCancelled
      ? 'upcoming'
      : position < phaseIndex
        ? 'done'
        : position === phaseIndex
          ? 'current'
          : 'upcoming') as StepState,
  }))

  return {
    status: ORDER_STATUSES[index],
    cancelled: isCancelled,
    tone: statusTone(index),
    phases,
    needsPay: index === AWAITING_PAYMENT,
    servicesKnown: index >= AWAITING_PAYMENT && !isCancelled && !!order.bill,
    itemsSummary: itemsSummary(order.items),
    total,
    payment: { label: paymentLabel(order, index) },
  }
}
