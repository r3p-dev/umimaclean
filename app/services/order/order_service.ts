import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import { MessagePurpose } from '#enums/message_enum'
import { OrderAddressType, OrderStatus } from '#enums/order_enum'
import type CustomerAddress from '#models/customer_address'
import Order from '#models/order'
import OrderAddress from '#models/order_address'
import type User from '#models/user'
import AddressBookService from '#services/address_book_service'
import { isUniqueViolation } from '#services/database_service'
import NotificationService from '#services/notification_service'
import OrderStatusService from '#services/order/order_status_service'
import SettingsService from '#services/settings_service'
import { newPublicCode } from '#services/order/public_code_service'
import type { OrderPayload } from '#validators/customer/order'
import { fieldError } from '#validators/shared/field_error'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

const CODE_RETRIES = 5

export function snapshotOf(user: User, address: CustomerAddress) {
  return {
    customerAddressId: address.id,
    label: address.label,
    recipientName: address.recipientName,
    recipientPhone: address.recipientPhone ?? user.phone,
    addressText: address.addressText,
    landmark: address.landmark,
    lat: address.lat,
    lng: address.lng,
  }
}

export const SLOT_FULL_MESSAGE = 'Jam penjemputan ini sudah penuh. Pilih jam atau tanggal lain.'

@inject()
export default class OrderService {
  constructor(
    protected addresses: AddressBookService,
    protected settings: SettingsService,
    protected statuses: OrderStatusService,
    protected notifications: NotificationService
  ) {}

  findByCode(code: string) {
    return Order.query()
      .where('public_code', code)
      .withScopes((scopes) => {
        scopes.withDetails()
        scopes.withHistory()
      })
      .first()
  }

  async resolveAddress(
    user: User,
    id: number,
    field: string,
    transaction?: TransactionClientContract
  ) {
    const address = await this.addresses.find(user, id, transaction)
    if (!address) {
      throw fieldError(field, 'Alamat tidak ditemukan. Pilih alamat lain.', 'address.missing')
    }
    return address
  }

  async assertSlotOpen(payload: OrderPayload, transaction?: TransactionClientContract) {
    const lookup = await this.settings.availability(payload.date, payload.date, transaction)
    const slot = lookup(payload.date)[payload.slot]
    if (!slot || !slot.isOpen) {
      throw fieldError('slot', 'Jam ini tidak tersedia. Pilih jam lain.', 'slot.closed')
    }
    if (slot.isFull) {
      throw fieldError('slot', SLOT_FULL_MESSAGE, 'slot.full')
    }
  }

  async check(user: User, payload: OrderPayload) {
    await this.assertSlotOpen(payload)
    const pickup = await this.resolveAddress(user, payload.pickupAddressId, 'pickupAddressId')
    await this.addresses.assertServiceable(pickup, 'pickupAddressId')
    const delivery = payload.deliveryAddressId
      ? await this.resolveAddress(user, payload.deliveryAddressId, 'deliveryAddressId')
      : null
    if (delivery) {
      await this.addresses.assertServiceable(delivery, 'deliveryAddressId')
    }
    return { pickup, delivery }
  }

  async place(user: User, payload: OrderPayload) {
    await this.check(user, payload)
    const result = await db.transaction(async (transaction) => {
      const existing = await Order.query({ client: transaction })
        .where('user_id', user.id)
        .where('request_key', payload.key)
        .first()
      if (existing) {
        return { order: existing, isNew: false }
      }

      await transaction.rawQuery('select pg_advisory_xact_lock(hashtext(?))', [
        `pickup-slot:${payload.date}:${payload.slot}`,
      ])
      await this.assertSlotOpen(payload, transaction)

      const pickup = await this.resolveAddress(
        user,
        payload.pickupAddressId,
        'pickupAddressId',
        transaction
      )
      const delivery = payload.deliveryAddressId
        ? await this.resolveAddress(
            user,
            payload.deliveryAddressId,
            'deliveryAddressId',
            transaction
          )
        : pickup

      const order = await this.#createWithCode(user, payload, transaction)
      await OrderAddress.createMany(
        [
          { ...snapshotOf(user, pickup), orderId: order.id, type: OrderAddressType.PICKUP },
          { ...snapshotOf(user, delivery), orderId: order.id, type: OrderAddressType.DELIVERY },
        ],
        { client: transaction }
      )
      await this.addresses.touch([...new Set([pickup.id, delivery.id])], transaction)
      await this.statuses.record(order, OrderStatus.AWAITING_PICKUP, { actor: user }, transaction)
      return { order, isNew: true }
    })

    if (result.isNew) {
      const slots = await this.settings.get('pickup_slots')
      const slot = slots[payload.slot]
      await this.notifications.toShop(result.order, MessagePurpose.NEW_ORDER, slot?.label ?? '')
    }
    return result.order
  }

  async #createWithCode(user: User, payload: OrderPayload, transaction: TransactionClientContract) {
    for (let attempt = 0; attempt < CODE_RETRIES; attempt++) {
      try {
        return await transaction.transaction((savepoint) =>
          Order.create(
            {
              publicCode: newPublicCode(),
              userId: user.id,
              customerName: user.name,
              customerPhone: user.phone,
              requestKey: payload.key,
              status: OrderStatus.AWAITING_PICKUP,
              itemsSepatu: payload.items.sepatu,
              itemsTas: payload.items.tas,
              itemsHelm: payload.items.helm,
              note: payload.note ?? '',
              pickupDate: DateTime.fromISO(payload.date, { zone: SERVICE_ZONE }),
              pickupSlot: payload.slot,
            },
            { client: savepoint }
          )
        )
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error
        }
      }
    }
    throw new Error('Could not allocate a unique order code')
  }

  async cancelByCustomer(user: User, order: Order, reason: string) {
    const cancelled = await db.transaction(async (transaction) => {
      const locked = await this.statuses.lock(transaction, order.id)
      if (locked.status !== OrderStatus.AWAITING_PICKUP) {
        throw fieldError(
          'form',
          'Pesanan sudah diproses kurir dan tidak bisa dibatalkan di sini. Hubungi kami via WhatsApp.',
          'order.not_cancellable'
        )
      }
      locked.cancelReason = reason
      await this.statuses.transition(
        locked,
        OrderStatus.CANCELLED,
        { actor: user, note: `Dibatalkan pelanggan: ${reason}` },
        transaction
      )
      return locked
    })
    await this.notifications.toShop(cancelled, MessagePurpose.CUSTOMER_CANCELLED, reason)
    return cancelled
  }
}
