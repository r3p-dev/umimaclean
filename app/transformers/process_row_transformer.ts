import { BaseTransformer } from '@adonisjs/core/transformers'
import { OrderSource, OrderStatus } from '#enums/order_enum'
import { PaymentMethodLabel, PaymentStatus } from '#enums/payment_enum'
import type Order from '#models/order'
import type User from '#models/user'
import { formatRupiah } from '#helpers/money'
import { formatClock, formatEvent } from '#transformers/order_transformer'
import { countLines, shortName } from '#transformers/task_transformer'

export type ProcessAction = 'inspect' | 'continue' | 'collect' | 'open' | 'handover' | 'locked'

export default class ProcessRowTransformer extends BaseTransformer<Order> {
  constructor(
    resource: Order,
    protected user: User
  ) {
    super(resource)
  }

  toObject() {
    const order = this.resource
    const received = order.events?.find((event) => event.status === OrderStatus.PICKED_UP)
    const paid = order.payments?.find((payment) => payment.status === PaymentStatus.PAID)
    const itemsText =
      order.items?.length && order.status !== OrderStatus.PICKED_UP
        ? countLines({
            itemsSepatu: order.items.filter((item) => item.kind === 'shoe').length,
            itemsTas: order.items.filter((item) => item.kind === 'bag').length,
            itemsHelm: order.items.filter((item) => item.kind === 'helmet').length,
          } as Order).join(', ')
        : countLines(order).join(', ')

    let action: ProcessAction = 'open'
    let meta = ''
    if (order.status === OrderStatus.PICKED_UP) {
      action = 'inspect'
      meta = received
        ? `Diterima ${formatClock(received.createdAt)}${received.actor ? ` · dijemput ${received.actor.firstName()}` : ''}`
        : 'Menunggu diperiksa'
    } else if (order.status === OrderStatus.IN_INSPECTION) {
      const isOther = order.isClaimedByOther(this.user)
      action = isOther ? 'locked' : 'continue'
      meta = isOther
        ? `Sedang diperiksa ${order.claimer?.firstName() ?? 'staf lain'}`
        : order.source === OrderSource.STORE
          ? 'Datang ke toko · bayar di kasir setelah diperiksa'
          : 'Sedang diperiksa'
    } else if (order.status === OrderStatus.AWAITING_PAYMENT) {
      action = 'collect'
      meta = `Tersimpan · total ${formatRupiah(order.bill?.total ?? 0)} · bayar di kasir`
    } else if (order.status === OrderStatus.IN_CLEANING) {
      meta = paid?.paidAt
        ? `Lunas · ${PaymentMethodLabel[paid.method]} · dicuci sejak ${formatEvent(paid.paidAt)}`
        : 'Dalam pencucian'
    } else if (order.status === OrderStatus.READY_FOR_COLLECTION) {
      action = 'handover'
      meta = 'Selesai dicuci · menunggu diambil pelanggan'
    }

    return {
      number: order.publicCode,
      name: shortName(order.customerName),
      source: order.source === OrderSource.STORE ? ('toko' as const) : ('online' as const),
      status: order.status,
      items: itemsText,
      meta,
      action,
    }
  }
}
