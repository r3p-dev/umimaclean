import { BaseTransformer } from '@adonisjs/core/transformers'
import { OrderStatus } from '#enums/order_status_enum'
import type Order from '#models/order'

export default class OrderDetailTransformer extends BaseTransformer<Order> {
  toObject() {
    return {
      id: this.resource.id,
      number: this.resource.number(),
      status: this.resource.status,
      pickupDate: this.resource.pickupDate.toISODate()!,
      pickupStartsAt: this.resource.pickupStartsAt,
      pickupEndsAt: this.resource.pickupEndsAt,
      note: this.resource.note,
      canCancel: this.resource.status === OrderStatus.AWAITING_PICKUP,
      createdAt: this.resource.createdAt.toISO()!,
      addresses: (this.resource.addresses ?? []).map((address) => ({
        id: address.id,
        kind: address.kind,
        label: address.label,
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone,
        addressText: address.addressText,
        details: address.details,
        street: address.street,
        kelurahan: address.kelurahan,
        kecamatan: address.kecamatan,
        city: address.city,
      })),
      items: (this.resource.items ?? []).map((item) => ({
        id: item.id,
        itemKind: item.itemKind,
        brand: item.brand,
        type: item.type,
        size: item.size,
      })),
      events: (this.resource.events ?? []).map((event) => ({
        id: event.id,
        status: event.status,
        note: event.note,
        createdAt: event.createdAt.toISO()!,
      })),
    }
  }
}
