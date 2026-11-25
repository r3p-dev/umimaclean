import app from '@adonisjs/core/services/app'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import { BagSize } from '#enums/bag_size_enum'
import { ItemKind } from '#enums/item_kind_enum'
import { OrderAddressKind } from '#enums/order_address_kind_enum'
import { OrderStatus } from '#enums/order_status_enum'
import { ZONE } from '#helpers/opening_hours'
import { normalizePhone } from '#helpers/phone'
import CustomerAddress from '#models/customer_address'
import Order from '#models/order'
import OrderAddress from '#models/order_address'
import OrderEvent from '#models/order_event'
import OrderItem from '#models/order_item'
import PickupSlot from '#models/pickup_slot'
import User from '#models/user'

const S = OrderStatus

// One demo order in every ORD-2 status, each with the timeline that led there along ORD-3 (status
// and timeline only: no trips, bills or payments yet). The rows are written directly, as a
// development fixture, without `OrderService` and its message.
const DEMO_ORDERS = [
  { phone: '082111223344', label: 'Rumah', path: [S.AWAITING_PICKUP] },
  { phone: '085299887766', label: 'Rumah', path: [S.AWAITING_PICKUP, S.COURIER_EN_ROUTE] },
  {
    phone: '082111223344',
    label: 'Kantor',
    path: [S.AWAITING_PICKUP, S.COURIER_EN_ROUTE, S.PICKED_UP],
  },
  {
    phone: '085299887766',
    label: 'Rumah',
    path: [S.AWAITING_PICKUP, S.COURIER_EN_ROUTE, S.PICKED_UP, S.IN_INSPECTION],
  },
  {
    phone: '082111223344',
    label: 'Rumah',
    path: [S.AWAITING_PICKUP, S.COURIER_EN_ROUTE, S.PICKED_UP, S.IN_INSPECTION, S.AWAITING_PAYMENT],
  },
  {
    phone: '085299887766',
    label: 'Rumah',
    path: [
      S.AWAITING_PICKUP,
      S.COURIER_EN_ROUTE,
      S.PICKED_UP,
      S.IN_INSPECTION,
      S.AWAITING_PAYMENT,
      S.IN_CLEANING,
    ],
  },
  {
    phone: '082111223344',
    label: 'Kantor',
    path: [
      S.AWAITING_PICKUP,
      S.COURIER_EN_ROUTE,
      S.PICKED_UP,
      S.IN_INSPECTION,
      S.AWAITING_PAYMENT,
      S.IN_CLEANING,
      S.READY_FOR_DELIVERY,
    ],
  },
  {
    phone: '085299887766',
    label: 'Rumah',
    path: [
      S.AWAITING_PICKUP,
      S.COURIER_EN_ROUTE,
      S.PICKED_UP,
      S.IN_INSPECTION,
      S.AWAITING_PAYMENT,
      S.IN_CLEANING,
      S.READY_FOR_DELIVERY,
      S.IN_DELIVERY,
    ],
  },
  {
    phone: '082111223344',
    label: 'Rumah',
    path: [
      S.AWAITING_PICKUP,
      S.COURIER_EN_ROUTE,
      S.PICKED_UP,
      S.IN_INSPECTION,
      S.AWAITING_PAYMENT,
      S.IN_CLEANING,
      S.READY_FOR_COLLECTION,
    ],
  },
  {
    phone: '082111223344',
    label: 'Rumah',
    path: [
      S.AWAITING_PICKUP,
      S.COURIER_EN_ROUTE,
      S.PICKED_UP,
      S.IN_INSPECTION,
      S.AWAITING_PAYMENT,
      S.IN_CLEANING,
      S.READY_FOR_DELIVERY,
      S.IN_DELIVERY,
      S.COMPLETED,
    ],
  },
  { phone: '085299887766', label: 'Rumah', path: [S.AWAITING_PICKUP, S.CANCELLED] },
]

const DEMO_ITEMS = [
  { itemKind: ItemKind.SHOE, brand: 'Nike', type: 'Air Force 1', size: '42' },
  { itemKind: ItemKind.SHOE, brand: null, type: 'Boots kulit', size: '40.5' },
  { itemKind: ItemKind.BAG, brand: 'Eiger', type: 'Ransel kanvas', size: BagSize.MEDIUM },
]

// Not picked up yet: tomorrow, or today when the courier is already on the way. Picked up: in the
// past, further back the further the order got. Sundays have no slots (SLOT-2) and are skipped.
function pickupDateFor(index: number, status: OrderStatus) {
  const today = DateTime.now().setZone(ZONE).startOf('day')
  const isPending = status === S.AWAITING_PICKUP || status === S.COURIER_EN_ROUTE
  let date = isPending
    ? today.plus({ days: status === S.AWAITING_PICKUP ? 1 : 0 })
    : today.minus({ days: 2 * index })
  while (date.weekday === 7) {
    date = date.plus({ days: isPending ? 1 : -1 })
  }
  return date
}

// The customer places the order the evening before; staff work on it from 09.00 on the pickup day,
// an hour a step. Nothing is dated after now.
function eventTimeFor(pickupDate: DateTime, step: number) {
  const time =
    step === 0
      ? pickupDate.minus({ days: 1 }).set({ hour: 19 })
      : pickupDate.set({ hour: 9 }).plus({ hours: step - 1 })
  return DateTime.min(time, DateTime.now().minus({ minutes: 30 - step }))
}

export default class OrderSeeder extends BaseSeeder {
  override async run() {
    // Tests create the orders they need: these would stay in the test database (seeded outside the
    // tests' transactions) and their pending pickups would hold slots the slot tests change.
    if (app.inTest || (await Order.query().first())) {
      return
    }
    const staff = await User.findByOrFail('phone', normalizePhone('081312345678'))

    for (const [index, demo] of DEMO_ORDERS.entries()) {
      const customer = await User.findByOrFail('phone', normalizePhone(demo.phone))
      const address = await CustomerAddress.query()
        .where('user_id', customer.id)
        .where('label', demo.label)
        .firstOrFail()
      const status = demo.path.at(-1)!
      const pickupDate = pickupDateFor(index, status)
      const slot = await PickupSlot.query()
        .where('weekday', pickupDate.weekday)
        .orderBy('starts_at')
        .firstOrFail()
      const order = await Order.create({
        userId: customer.id,
        status,
        pickupDate,
        pickupSlotId: slot.id,
        pickupStartsAt: slot.startsAt,
        pickupEndsAt: slot.endsAt,
        note: index === 0 ? 'Tolong telepon dulu sebelum datang.' : null,
        requestKey: `seed-${index}`,
        createdAt: eventTimeFor(pickupDate, 0),
      })
      await OrderAddress.createMany(
        [OrderAddressKind.PICKUP, OrderAddressKind.DELIVERY].map((kind) => ({
          orderId: order.id,
          kind,
          label: address.label,
          recipientName: address.recipientName,
          recipientPhone: address.recipientPhone,
          addressText: address.addressText,
          details: address.details,
          lat: address.lat,
          lng: address.lng,
          street: address.street,
          kelurahan: address.kelurahan,
          kecamatan: address.kecamatan,
          city: address.city,
        }))
      )
      await OrderItem.createMany(
        DEMO_ITEMS.slice(0, 1 + (index % 3)).map((item) => ({ ...item, orderId: order.id }))
      )
      await OrderEvent.createMany(
        demo.path.map((eventStatus, step) => ({
          orderId: order.id,
          status: eventStatus,
          // The customer places and cancels; staff move the order on.
          actorId: step === 0 || eventStatus === S.CANCELLED ? customer.id : staff.id,
          note: eventStatus === S.CANCELLED ? 'Jadwal saya berubah.' : null,
          createdAt: eventTimeFor(pickupDate, step),
        }))
      )
    }
  }
}
