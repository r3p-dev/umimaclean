import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import { OrderAddressKind } from '#enums/order_address_kind_enum'
import { OrderStatus, OrderStatusLabel } from '#enums/order_status_enum'
import { ZONE } from '#helpers/opening_hours'
import { orderReceivedText } from '#helpers/order_messages'
import { fieldError } from '#helpers/validation'
import ActivityLog from '#models/activity_log'
import type CustomerAddress from '#models/customer_address'
import Order from '#models/order'
import OrderAddress from '#models/order_address'
import OrderEvent from '#models/order_event'
import OrderItem from '#models/order_item'
import PickupSlot from '#models/pickup_slot'
import type User from '#models/user'
import AddressService from '#services/address_service'
import AreaService from '#services/area_service'
import PickupSlotService from '#services/pickup_slot_service'
import WhatsAppService from '#services/whatsapp_service'
import type { OrderDraft } from '#validators/order_validator'

export const SLOT_FULL_MESSAGE = 'Slot ini sudah penuh. Pilih slot lain.'
export const SLOT_UNAVAILABLE_MESSAGE = 'Slot ini tidak tersedia. Pilih slot lain.'
export const DATE_UNAVAILABLE_MESSAGE = 'Tanggal ini tidak bisa dipilih. Pilih tanggal lain.'

type Transition = { actor: User | null; note?: string }

// Orders (ORD-1…ORD-3, CUST-4, CUST-6). `transitionOrder` is the only writer of an order's status
// after it is placed (docs/ARCHITECTURE.md §5).
@inject()
export default class OrderService {
  constructor(
    protected addressService: AddressService,
    protected areaService: AreaService,
    protected pickupSlotService: PickupSlotService,
    protected whatsapp: WhatsAppService
  ) {}

  // ORD-3, ORD-4: locks the order, refuses a change the table does not allow (409), writes the
  // status and appends the timeline event; a change by staff or the owner also goes to the
  // activity log. Called inside the transaction of the flow that makes the change.
  async transitionOrder(
    order: Order,
    status: OrderStatus,
    { actor, note }: Transition,
    transaction: TransactionClientContract
  ) {
    const locked = await Order.query({ client: transaction })
      .where('id', order.id)
      .forUpdate()
      .firstOrFail()
    if (!locked.canTransitionTo(status)) {
      throw new Exception(
        `Pesanan ${locked.number()} tidak bisa diubah dari "${OrderStatusLabel[locked.status]}" ke "${OrderStatusLabel[status]}".`,
        { status: 409 }
      )
    }
    await locked.useTransaction(transaction).merge({ status }).save()
    await OrderEvent.create(
      { orderId: locked.id, status, actorId: actor?.id ?? null, note: note ?? null },
      { client: transaction }
    )
    if (actor?.canAccessStaff()) {
      await ActivityLog.create(
        {
          userId: actor.id,
          category: 'orders',
          action: 'orders.status',
          description: `${locked.number()}: ${OrderStatusLabel[status]}`,
          isSensitive: false,
        },
        { client: transaction }
      )
    }
    order.status = status
    return locked
  }

  // CUST-6: places an online order from a checked draft. Re-checks both addresses against the
  // active areas (AREA-4), the date (SLOT-1) and, with the slot row locked, its capacity (SLOT-3),
  // then creates the order at `awaiting_pickup` with copies of the addresses (CUST-4), the declared
  // items and the first timeline event. A second submit with the same `requestKey` returns the
  // first order. The "order received" message goes after the commit (MSG-1.1).
  async placeOnlineOrder(
    user: User,
    draft: OrderDraft,
    requestKey: string,
    now: DateTime = DateTime.now()
  ) {
    const repeated = await Order.findBy({ userId: user.id, requestKey })
    if (repeated) {
      return repeated
    }

    const pickupAddress = await this.addressService.findAddressOf(user, draft.pickupAddressId)
    const deliveryAddress = await this.addressService.findAddressOf(user, draft.deliveryAddressId)
    await this.#refuseOutsideArea(pickupAddress, 'pickupAddressId', 'penjemputan')
    await this.#refuseOutsideArea(deliveryAddress, 'deliveryAddressId', 'pengantaran')

    const date = draft.pickupDate.toISODate()!
    const dates = await this.pickupSlotService.listPickupDates(now)
    if (!dates.includes(date)) {
      fieldError('pickupDate', DATE_UNAVAILABLE_MESSAGE, 'dateUnavailable')
    }

    const placed = await db.transaction(async (transaction) => {
      // Two customers taking the last place wait for each other here (SLOT-3), and so do two
      // submits of the same form.
      const slot = await PickupSlot.query({ client: transaction })
        .where('id', draft.pickupSlotId)
        .forUpdate()
        .first()
      const sameSubmit = await Order.query({ client: transaction })
        .where('user_id', user.id)
        .where('request_key', requestKey)
        .first()
      if (sameSubmit) {
        return { order: sameSubmit, isNew: false }
      }
      if (
        !slot ||
        !slot.isActive ||
        slot.weekday !== DateTime.fromISO(date, { zone: ZONE }).weekday
      ) {
        fieldError('pickupSlotId', SLOT_UNAVAILABLE_MESSAGE, 'slotUnavailable')
      }
      const taken = await this.pickupSlotService.countTakenPlaces(slot.id, date, transaction)
      if (taken >= slot.capacity) {
        fieldError('pickupSlotId', SLOT_FULL_MESSAGE, 'slotFull')
      }

      const order = await Order.create(
        {
          userId: user.id,
          status: OrderStatus.AWAITING_PICKUP,
          pickupDate: DateTime.fromISO(date),
          pickupSlotId: slot.id,
          pickupStartsAt: slot.startsAt,
          pickupEndsAt: slot.endsAt,
          note: draft.note ?? null,
          requestKey,
        },
        { client: transaction }
      )
      await OrderAddress.createMany(
        [
          this.#copyAddress(order, pickupAddress, OrderAddressKind.PICKUP),
          this.#copyAddress(order, deliveryAddress, OrderAddressKind.DELIVERY),
        ],
        { client: transaction }
      )
      await OrderItem.createMany(
        draft.items.map((item) => ({
          orderId: order.id,
          itemKind: item.itemKind,
          brand: item.brand ?? null,
          type: item.type,
          size: item.size,
        })),
        { client: transaction }
      )
      // The first status is written with the order; every change after it goes through
      // `transitionOrder`.
      await OrderEvent.create(
        { orderId: order.id, status: OrderStatus.AWAITING_PICKUP, actorId: user.id },
        { client: transaction }
      )
      return { order, isNew: true }
    })

    if (placed.isNew) {
      await this.#sendOrderReceived(user, placed.order)
    }
    return placed.order
  }

  async #refuseOutsideArea(address: CustomerAddress, field: string, use: string) {
    const coverage = await this.areaService.checkCoverage(address.lat, address.lng)
    if (!coverage.isCovered) {
      fieldError(
        field,
        `Alamat ${use} "${address.label}" di luar area layanan. Ubah titiknya di Alamat atau pilih alamat lain.`,
        'area.outside'
      )
    }
  }

  #copyAddress(order: Order, address: CustomerAddress, kind: OrderAddressKind) {
    return {
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
    }
  }

  // MSG-1.1. A failed or crashing send is logged and never fails the order (MSG-3).
  async #sendOrderReceived(user: User, order: Order) {
    try {
      await this.whatsapp.sendMessage(
        user.phone,
        orderReceivedText(user.fullName, {
          number: order.number(),
          pickupDate: order.pickupDate,
          pickupStartsAt: order.pickupStartsAt,
          pickupEndsAt: order.pickupEndsAt,
        }),
        'order_received'
      )
    } catch (error) {
      logger.error({ err: error, orderId: order.id }, 'Order received message failed')
    }
  }
}
