import { BaseTransformer } from '@adonisjs/core/transformers'
import { ItemKindLabel } from '#enums/order_enum'
import { PaymentMethod, PaymentMethodLabel, PaymentStatus } from '#enums/payment_enum'
import type Order from '#models/order'
import { formatEvent } from '#transformers/order_transformer'

export default class ReceiptTransformer extends BaseTransformer<Order> {
  toObject() {
    const order = this.resource
    const payment = order.payments.find((entry) => entry.status === PaymentStatus.PAID) ?? null
    const items = order.items.map((item) => {
      const lines = (order.bill?.lines ?? []).filter((line) => line.orderItemId === item.id)
      return {
        name: item.name,
        kind: ItemKindLabel[item.kind],
        services: lines.map((line) => ({ name: line.name, price: line.price })),
        subtotal: lines.reduce((sum, line) => sum + line.price, 0),
      }
    })
    const cashReceived =
      payment?.method === PaymentMethod.CASH ? (payment.cashReceived ?? null) : null

    return {
      id: order.id,
      number: order.number(),
      customer: order.customerName,
      createdAt: formatEvent(order.createdAt),
      items,
      total: order.bill?.total ?? 0,
      payment: payment
        ? {
            method: PaymentMethodLabel[payment.method],
            paidAt: payment.paidAt ? formatEvent(payment.paidAt) : '',
            reference: payment.reference ?? payment.providerTransactionId,
            cashReceived,
            change: cashReceived !== null ? cashReceived - payment.amount : null,
          }
        : null,
    }
  }
}
