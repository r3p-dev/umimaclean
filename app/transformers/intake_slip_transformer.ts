import { BaseTransformer } from '@adonisjs/core/transformers'
import { OrderStatus, ReturnMethod } from '#enums/order_enum'
import { maskPhone } from '#helpers/phone'
import { orderLink } from '#helpers/whatsapp_text'
import type Order from '#models/order'
import { slipDate } from '#transformers/order_transformer'
import { countLines } from '#transformers/task_transformer'

export default class IntakeSlipTransformer extends BaseTransformer<Order> {
  toObject() {
    const order = this.resource
    const received = order.events.find((event) => event.status === OrderStatus.IN_INSPECTION)
    const delivery = order.returnMethod === ReturnMethod.DELIVERY ? order.deliveryAddress : null

    return {
      id: order.id,
      number: order.number(),
      receivedAt: slipDate(received?.createdAt ?? order.createdAt),
      staff: received?.actor?.firstName() ?? null,
      customer: order.customerName,
      phone: order.customerPhone ? maskPhone(order.customerPhone) : null,
      items: countLines(order),
      itemCount: order.itemCount(),
      note: order.note || null,
      delivery: delivery
        ? {
            recipient: delivery.recipientName,
            address: delivery.addressText,
            landmark: delivery.landmark,
          }
        : null,
      link: orderLink(order.id),
      isCancelled: order.status === OrderStatus.CANCELLED,
    }
  }
}
