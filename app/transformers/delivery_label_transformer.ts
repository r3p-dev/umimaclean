import { BaseTransformer } from '@adonisjs/core/transformers'
import { PaymentStatus } from '#enums/payment_enum'
import { displayPhone } from '#helpers/phone'
import type Order from '#models/order'

export default class DeliveryLabelTransformer extends BaseTransformer<Order> {
  toObject() {
    const order = this.resource
    const address = order.deliveryAddress
    const isPaid = order.payments.some((payment) => payment.status === PaymentStatus.PAID)

    return {
      id: order.id,
      number: order.number(),
      recipient: address.recipientName,
      phone: address.recipientPhone ? displayPhone(address.recipientPhone) : null,
      address: address.addressText,
      landmark: address.landmark,
      itemCount: order.items.length || order.itemCount(),
      items: order.items.map((item) => item.name),
      isPaid,
      due: isPaid ? 0 : (order.bill?.total ?? 0),
    }
  }
}
