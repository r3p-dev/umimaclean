import { BaseTransformer } from '@adonisjs/core/transformers'
import type { DateTime } from 'luxon'
import {
  ItemKindLabel,
  OrderStatus,
  OrderStatusLabel,
  PhotoKind,
  orderStatusIndex,
  type ReturnMethod,
} from '#enums/order_enum'
import { PaymentMethodLabel, PaymentStatus } from '#enums/payment_enum'
import type Order from '#models/order'
import type OrderAddress from '#models/order_address'
import type OrderPhoto from '#models/order_photo'
import type Payment from '#models/payment'
import { displayPhone, maskPhone } from '#services/phone_service'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

export function formatEvent(date: DateTime) {
  return date.setZone(SERVICE_ZONE).setLocale('id').toFormat('ccc, d LLL · HH.mm')
}

export function formatClock(date: DateTime) {
  return date.setZone(SERVICE_ZONE).toFormat('HH.mm')
}

export function photoUrl(photo: OrderPhoto) {
  return photo.path ? `/foto-bukti/${photo.id}` : null
}

export function addressOf(address: OrderAddress) {
  return {
    label: address.label,
    recipientName: address.recipientName,
    recipientPhone: displayPhone(address.recipientPhone),
    addressText: address.addressText,
    landmark: address.landmark ?? '',
    point: { lat: address.lat, lng: address.lng },
  }
}

export function billOf(order: Order) {
  const bill = order.bill
  if (!bill) {
    return null
  }
  const sentAt = formatEvent(bill.createdAt)
  return {
    total: bill.total,
    lines: order.items.map((item) => ({
      name: item.name,
      kind: ItemKindLabel[item.kind],
      note: item.note,
      services: bill.lines
        .filter((line) => line.orderItemId === item.id)
        .map((line) => ({ name: line.name, price: line.price })),
    })),
    decidedAt: sentAt,
    sentAt,
  }
}

function proofOf(order: Order, kind: PhotoKind) {
  const photo = order.photos.filter((entry) => entry.kind === kind).at(-1)
  if (!photo) {
    return undefined
  }
  return {
    time: formatEvent(photo.createdAt),
    by: photo.taker?.name ?? 'Staf',
    url: photoUrl(photo),
  }
}

export function orderRoute(source: string, returnMethod: ReturnMethod) {
  const statuses: OrderStatus[] =
    source === 'store'
      ? [OrderStatus.IN_INSPECTION, OrderStatus.AWAITING_PAYMENT, OrderStatus.IN_CLEANING]
      : [
          OrderStatus.AWAITING_PICKUP,
          OrderStatus.COURIER_EN_ROUTE,
          OrderStatus.PICKED_UP,
          OrderStatus.IN_INSPECTION,
          OrderStatus.AWAITING_PAYMENT,
          OrderStatus.IN_CLEANING,
        ]
  statuses.push(
    ...(returnMethod === 'store'
      ? [OrderStatus.READY_FOR_COLLECTION]
      : [OrderStatus.READY_FOR_DELIVERY, OrderStatus.IN_DELIVERY]),
    OrderStatus.COMPLETED
  )
  return statuses.map(orderStatusIndex)
}

export default class OrderTransformer extends BaseTransformer<Order> {
  toObject() {
    const order = this.resource
    const events: Partial<Record<number, string>> = { 0: formatEvent(order.createdAt) }
    const eventActors: Partial<Record<number, string>> = {}
    for (const event of order.events ?? []) {
      events[orderStatusIndex(event.status)] = formatEvent(event.createdAt)
      if (event.actor) {
        eventActors[orderStatusIndex(event.status)] = event.actor.name
      }
    }
    const pickedUp = order.events?.findLast((event) => event.status === OrderStatus.PICKED_UP)
    const completed = order.events?.findLast((event) => event.status === OrderStatus.COMPLETED)
    const payment = order.payments?.find((entry) => entry.status === PaymentStatus.PAID)
    const pickup = order.pickupAddress
    const delivery = order.deliveryAddress
    const hasSeparateDelivery =
      !!delivery &&
      (!pickup ||
        delivery.addressText !== pickup.addressText ||
        delivery.lat !== pickup.lat ||
        delivery.lng !== pickup.lng)
    const firstName = order.customerName.trim().split(/\s+/)[0] ?? ''

    return {
      number: order.publicCode,
      status: orderStatusIndex(order.status),
      source: order.source,
      returnMethod: order.returnMethod,
      route: orderRoute(order.source, order.returnMethod),
      contact: {
        name: order.customerName,
        firstName,
        phone: order.customerPhone ? displayPhone(order.customerPhone) : '',
        maskedPhone: order.customerPhone ? maskPhone(order.customerPhone) : '',
      },
      createdOn: order.createdAt.setZone(SERVICE_ZONE).toISODate() ?? '',
      items: { sepatu: order.itemsSepatu, tas: order.itemsTas, helm: order.itemsHelm },
      note: order.note,
      pickupDate: order.pickupDate?.toISODate() ?? null,
      pickupSlot: order.pickupSlot,
      events,
      courier: eventActors[orderStatusIndex(OrderStatus.COURIER_EN_ROUTE)],
      pickedAt: pickedUp ? formatClock(pickedUp.createdAt) : undefined,
      bill: order.bill !== undefined ? billOf(order) : null,
      paidAt: payment?.paidAt ? formatEvent(payment.paidAt) : undefined,
      paidOn: payment?.paidAt ? formatEvent(payment.paidAt) : undefined,
      paidTime: payment?.paidAt ? formatClock(payment.paidAt) : undefined,
      paymentMethod: payment ? PaymentMethodLabel[payment.method] : undefined,
      receiver: order.receiverName ?? undefined,
      deliveredTime: completed ? formatClock(completed.createdAt) : undefined,
      cancelReason: order.cancelReason,
      canCancel: order.status === OrderStatus.AWAITING_PICKUP,
      proofs: order.photos
        ? {
            pickup: proofOf(order, PhotoKind.PICKUP),
            clean: proofOf(order, PhotoKind.WASHING),
            deliver: proofOf(order, PhotoKind.DELIVERY),
          }
        : undefined,
      pickupAddress: pickup ? addressOf(pickup) : null,
      deliveryAddress: hasSeparateDelivery && delivery ? addressOf(delivery) : null,
    }
  }
}

export function orderStatusLabel(status: OrderStatus) {
  return OrderStatusLabel[status]
}

export function qrisOf(payment: Payment) {
  return {
    qrUrl: payment.qrUrl,
    expiresAt: payment.expiresAt?.toISO() ?? null,
    status: payment.status,
  }
}
