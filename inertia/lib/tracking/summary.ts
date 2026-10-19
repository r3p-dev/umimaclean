import { urlFor } from '~/client'
import { itemsSummary } from '~/lib/order/items'
import { billTotal } from '~/lib/payment/bill'
import { formatDate } from '~/lib/shared/date'
import { formatRupiah } from '~/lib/shared/format'
import type { OrderRecord } from '~/lib/tracking/orders'
import {
  AWAITING_PAYMENT,
  CANCELLED,
  COMPLETED,
  ORDER_STATUSES,
  isPaid,
  paymentLabel,
} from '~/lib/tracking/status'

export type OrderSummary = ReturnType<typeof orderSummary>

export function orderSummary(order: OrderRecord) {
  const paid = isPaid(order)
  return {
    number: order.number,
    status: ORDER_STATUSES[order.status],
    items: itemsSummary(order.items),
    date: formatDate(order.createdOn, 'full'),
    payment: paid ? `${paymentLabel(order)} · QRIS` : paymentLabel(order),
    paid,
    total: order.bill ? formatRupiah(billTotal(order.bill)) : null,
    needsAction: order.status === AWAITING_PAYMENT,
    finished: order.status === COMPLETED || order.status === CANCELLED,
    cancelled: order.status === CANCELLED,
    href: urlFor('tracking.status', { number: order.number }),
  }
}
