import { BaseTransformer } from '@adonisjs/core/transformers'
import { ItemKindLabel, OrderSource } from '#enums/order_enum'
import type Order from '#models/order'
import { nationalNumber } from '#helpers/phone'
import { estimateLeg } from '#helpers/route'
import { STORE_POINT, type PickupSlotSetting } from '#models/setting'
import type { TripLeg } from '#services/types'

export type TripKind = 'pickup' | 'delivery'

function tripAddress(order: Order, kind: TripKind) {
  return kind === 'pickup' ? order.pickupAddress : (order.deliveryAddress ?? order.pickupAddress)
}

export function tripPoint(order: Order, kind: TripKind) {
  const address = tripAddress(order, kind)
  return address ? { lat: address.lat, lng: address.lng } : STORE_POINT
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

export function formatLeg(leg: TripLeg) {
  const approximately = leg.source === 'estimate' ? '± ' : ''
  const minutes = Math.max(1, Math.round(leg.seconds / 60))
  const hours = Math.floor(minutes / 60)
  const duration = hours
    ? `${hours} jam${minutes % 60 ? ` ${minutes % 60} mnt` : ''}`
    : `${minutes} mnt`
  return {
    km: `${approximately}${(leg.meters / 1000).toFixed(1).replace('.', ',')} km`,
    eta: `${approximately}${duration}`,
  }
}

export default class TaskTransformer extends BaseTransformer<Order> {
  constructor(
    resource: Order,
    protected kind: TripKind,
    protected slots: PickupSlotSetting[],
    protected leg?: TripLeg,
    protected legStart: 'courier' | 'store' | null = null
  ) {
    super(resource)
  }

  toObject() {
    const order = this.resource
    const address = tripAddress(order, this.kind)
    const point = tripPoint(order, this.kind)
    const { km, eta } = formatLeg(
      this.leg ?? { source: 'estimate', ...estimateLeg(STORE_POINT, point) }
    )
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
      km,
      eta,
      legFrom:
        this.legStart === 'courier'
          ? 'dari posisi Anda'
          : this.legStart === 'store'
            ? 'dari toko'
            : null,
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
