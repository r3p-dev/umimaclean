import { BaseTransformer } from '@adonisjs/core/transformers'
import { ItemKindLabel, OrderSource, OrderStatus, PhotoKind } from '#enums/order_enum'
import { PaymentMethodLabel, PaymentStatus } from '#enums/payment_enum'
import type Order from '#models/order'
import { formatEvent, photoUrl } from '#transformers/order_transformer'
import { shortName } from '#transformers/task_transformer'

export default class WashTransformer extends BaseTransformer<Order> {
  toObject() {
    const order = this.resource
    const paid = order.payments.find((payment) => payment.status === PaymentStatus.PAID)
    const photo = order.photos.filter((entry) => entry.kind === PhotoKind.WASHING).at(-1)
    const isDone = order.status !== OrderStatus.IN_CLEANING

    return {
      id: order.id,
      number: order.number(),
      customer: shortName(order.customerName),
      source: order.source === OrderSource.STORE ? ('toko' as const) : ('online' as const),
      returnMethod: order.returnMethod,
      isDone,
      isCollected: order.status === OrderStatus.COMPLETED,
      isWaitingCollection: order.status === OrderStatus.READY_FOR_COLLECTION,
      canPrintLabel: order.canPrintLabel(),
      canPrintReceipt: order.canPrintReceipt(),
      statusSub: paid?.paidAt
        ? `${shortName(order.customerName)} · Lunas ${PaymentMethodLabel[paid.method]} · dicuci sejak ${formatEvent(paid.paidAt)}`
        : shortName(order.customerName),
      shot: photo
        ? {
            url: photoUrl(photo),
            stamp: `${formatEvent(photo.createdAt)} · ${photo.taker?.name ?? 'Staf'}`,
          }
        : null,
      items: order.items.map((item) => ({
        name: item.name,
        category: ItemKindLabel[item.kind],
        services:
          order.bill?.lines
            .filter((line) => line.orderItemId === item.id)
            .map((line) => line.name) ?? [],
      })),
    }
  }
}
