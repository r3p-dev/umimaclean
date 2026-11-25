import { BaseTransformer } from '@adonisjs/core/transformers'
import type Order from '#models/order'

export default class OrderSummaryTransformer extends BaseTransformer<Order> {
  toObject() {
    return {
      id: this.resource.id,
      number: this.resource.number(),
      status: this.resource.status,
      pickupDate: this.resource.pickupDate.toISODate()!,
      pickupStartsAt: this.resource.pickupStartsAt,
      pickupEndsAt: this.resource.pickupEndsAt,
      createdAt: this.resource.createdAt.toISO()!,
      items: (this.resource.items ?? []).map((item) => ({
        id: item.id,
        itemKind: item.itemKind,
        brand: item.brand,
        type: item.type,
        size: item.size,
      })),
    }
  }
}
