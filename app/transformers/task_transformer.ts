import { BaseTransformer } from '@adonisjs/core/transformers'
import { ItemKindLabel, OrderSource } from '#enums/order_enum'
import type Order from '#models/order'
import { nationalNumber } from '#helpers/phone'
import { STORE_POINT, type PickupSlotSetting } from '#models/setting'

export type TripKind = 'pickup' | 'delivery'

function distanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const radians = (value: number) => (value * Math.PI) / 180
  const dLat = radians(to.lat - from.lat)
  const dLng = radians(to.lng - from.lng)
  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function shortName(full: string) {
  const [first, second] = full.trim().split(/\s+/)
  return second ? `${first} ${second[0]}.` : (first ?? '')
}

export function countLines(order: Order) {
  return [
    [order.itemsSepatu, 'Sepatu'],
    [order.itemsTas, 'Tas'],
    [order.itemsHelm, 'Helm'],
  ]
    .filter(([count]) => Number(count) > 0)
    .map(([count, label]) => `${label} ×${count}`)
}

export default class TaskTransformer extends BaseTransformer<Order> {
  constructor(
    resource: Order,
    protected kind: TripKind,
    protected slots: PickupSlotSetting[]
  ) {
    super(resource)
  }

  toObject() {
    const order = this.resource
    const address =
      this.kind === 'pickup' ? order.pickupAddress : (order.deliveryAddress ?? order.pickupAddress)
    const point = address ? { lat: address.lat, lng: address.lng } : STORE_POINT
    const km = distanceKm(STORE_POINT, point)
    const parts = (address?.addressText ?? '').split(',').map((part) => part.trim())
    const area = parts.length >= 3 ? parts.slice(-3, -1).join(', ') : parts.join(', ')
    const counts = countLines(order)
    const itemLines =
      this.kind === 'delivery' && order.items?.length
        ? order.items.map((item) => {
            const services = order.bill?.lines
              .filter((line) => line.orderItemId === item.id)
              .map((line) => line.name)
            return `${item.name} · ${services?.join(' + ') || ItemKindLabel[item.kind]}`
          })
        : counts

    return {
      id: order.id,
      ref: order.number(),
      name: shortName(order.customerName),
      full: order.customerName,
      area: area || '—',
      km: `${km.toFixed(1).replace('.', ',')} km`,
      eta: `${Math.max(1, Math.round((km / 25) * 60))} mnt`,
      at: '—',
      slot:
        this.kind === 'pickup' && order.pickupSlot !== null
          ? (this.slots[order.pickupSlot]?.label ?? '')
          : 'Hari ini',
      items: counts.join(', '),
      lines: itemLines,
      address: address?.addressText ?? '',
      note: address?.landmark || order.note || '—',
      receiver: address?.recipientName,
      point,
      doneAt: '',
      source: order.source === OrderSource.STORE ? ('toko' as const) : ('online' as const),
      tel: nationalNumber(address?.recipientPhone ?? order.customerPhone),
      count:
        this.kind === 'delivery' && order.items?.length ? order.items.length : order.itemCount(),
      isFresh: false,
      canPrintLabel: order.canPrintLabel(),
      canPrintReceipt: order.canPrintReceipt(),
    }
  }
}
