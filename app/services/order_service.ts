import { randomInt, randomUUID } from 'node:crypto'
import { inject } from '@adonisjs/core'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import transmit from '@adonisjs/transmit/services/main'
import { DateTime } from 'luxon'
import { ActivityAction } from '#enums/activity_enum'
import { MessagePurpose, MessageStatus } from '#enums/message_enum'
import {
  FINISHED_STATUSES,
  OrderAddressType,
  OrderSource,
  OrderStatus,
  OrderStatusLabel,
  OrderStatusStage,
  OrderTask,
  PhotoKind,
  ReturnMethod,
  type OrderStage,
} from '#enums/order_enum'
import { Role } from '#enums/role_enum'
import ActivityLog from '#models/activity_log'
import CustomerAddress from '#models/customer_address'
import Order from '#models/order'
import OrderAddress from '#models/order_address'
import OrderEvent from '#models/order_event'
import OrderPhoto from '#models/order_photo'
import Setting, { type StoreInfo } from '#models/setting'
import User from '#models/user'
import WhatsappMessage from '#models/whatsapp_message'
import { isUniqueViolation } from '#services/database_service'
import FonnteService from '#services/fonnte_service'
import ServiceAreaService, { type Point } from '#services/service_area_service'
import env from '#start/env'
import type { OrderPayload } from '#validators/customer/order'
import { fieldError } from '#validators/shared/field_error'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'
import type { WalkInPayload } from '#validators/staff/store'

export const PUBLIC_CODE_PREFIX = 'UMC-'
export const PUBLIC_CODE_LENGTH = 6
export const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

const CODE_PATTERN = new RegExp(`^[${CROCKFORD_ALPHABET}]{${PUBLIC_CODE_LENGTH}}$`)
const CODE_RETRIES = 5

export function newPublicCode() {
  return (
    PUBLIC_CODE_PREFIX +
    Array.from(
      { length: PUBLIC_CODE_LENGTH },
      () => CROCKFORD_ALPHABET[randomInt(CROCKFORD_ALPHABET.length)]
    ).join('')
  )
}

export function normalizePublicCode(value: string) {
  let code = value.toUpperCase().replace(/[\s-]/g, '')
  if (code.startsWith('UMC')) {
    code = code.slice(3)
  }
  code = code.replaceAll('O', '0').replace(/[IL]/g, '1')
  return CODE_PATTERN.test(code) ? PUBLIC_CODE_PREFIX + code : null
}

export const STAFF_QUEUES_CHANNEL = 'staff/queues'
export const ADMIN_ORDERS_CHANNEL = 'admin/orders'

export function orderChannel(publicCode: string) {
  return `orders/${publicCode}`
}

export const ORDER_FILTERS = ['semua', 'berjalan', 'selesai', 'dibatalkan'] as const
export const ORDERS_PER_PAGE = 10

export type OrderFilter = (typeof ORDER_FILTERS)[number]

export function orderFilterOf(value: unknown): OrderFilter {
  return ORDER_FILTERS.find((filter) => filter === value) ?? 'semua'
}

export function orderSearchTerm(value: unknown) {
  return String(value ?? '')
    .toUpperCase()
    .replace(/^UMC-?/, '')
    .replace(/[^0-9A-Z]/g, '')
    .slice(0, 6)
}

export function deliveryNote(status: MessageStatus, who = 'Pelanggan') {
  if (status === MessageStatus.SENT) {
    return `${who} diberi tahu via WhatsApp.`
  }
  if (status === MessageStatus.LOGGED) {
    return 'WhatsApp belum dikonfigurasi, pesan hanya dicatat di log server.'
  }
  return `WhatsApp ke ${who.toLowerCase()} gagal terkirim.`
}

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

export type SlotAvailability = {
  slot: number
  label: string
  capacity: number
  booked: number
  isOpen: boolean
  isFull: boolean
}

export type TransitionOptions = {
  actor: User | null
  note?: string | null
  action?: ActivityAction
  detail?: string
  isSensitive?: boolean
  isOwnerOverride?: boolean
}

@inject()
export default class OrderService {
  constructor(
    protected fonnte: FonnteService,
    protected area: ServiceAreaService
  ) {}

  lock(transaction: TransactionClientContract, orderId: number) {
    return Order.query({ client: transaction }).where('id', orderId).forUpdate().firstOrFail()
  }

  async lockByCode(transaction: TransactionClientContract, code: string) {
    const order = await Order.query({ client: transaction })
      .where('public_code', code)
      .forUpdate()
      .first()
    if (!order) {
      throw fieldError('form', 'Pesanan tidak ditemukan.', 'order.missing')
    }
    return order
  }

  async transition(
    order: Order,
    to: OrderStatus,
    options: TransitionOptions,
    transaction: TransactionClientContract
  ) {
    if (!order.canTransitionTo(to, options.isOwnerOverride)) {
      throw fieldError(
        'form',
        `Pesanan ${order.publicCode} sedang "${OrderStatusLabel[order.status]}", jadi tidak bisa diubah ke "${OrderStatusLabel[to]}". Muat ulang halaman.`,
        'order.transition'
      )
    }

    const from = order.status
    order.useTransaction(transaction)
    order.status = to
    await order.save()

    await this.#record(order, to, options, transaction)
    await ActivityLog.record(
      {
        actor: options.actor,
        order,
        action: options.action ?? ActivityAction.STATUS_CHANGED,
        detail: options.detail ?? `${OrderStatusLabel[from]} → ${OrderStatusLabel[to]}`,
        isSensitive: options.isSensitive,
      },
      transaction
    )
    return order
  }

  broadcast(order: Order) {
    const payload = { code: order.publicCode, status: order.status }
    transmit.broadcast(orderChannel(order.publicCode), payload)
    transmit.broadcast(STAFF_QUEUES_CHANNEL, payload)
    transmit.broadcast(ADMIN_ORDERS_CHANNEL, payload)
  }

  async notify(order: Order, purpose: MessagePurpose, detail = '') {
    const isForShop =
      purpose === MessagePurpose.NEW_ORDER || purpose === MessagePurpose.CUSTOMER_CANCELLED
    const store = await Setting.get('store')
    if (!isForShop && !order.customerPhone) {
      return MessageStatus.FAILED
    }
    const target = isForShop ? store.whatsapp : order.customerPhone
    const status = await this.fonnte.send(target, this.#text(order, purpose, detail, store))
    await WhatsappMessage.create({
      target,
      purpose,
      status,
      orderId: order.id,
      userId: isForShop ? null : order.userId,
    })
    return status
  }

  async sendReceipt(staff: User, order: Order, receipt: string) {
    const status = await this.notify(order, MessagePurpose.RECEIPT, receipt)
    await ActivityLog.record({
      actor: staff,
      order,
      action: ActivityAction.RECEIPT_SENT,
      detail: deliveryNote(status),
    })
    return status
  }

  async slotAvailability(from: string, to: string, transaction?: TransactionClientContract) {
    const slots = await Setting.get('pickup_slots', transaction)
    const rows = await (transaction ?? db)
      .from('orders')
      .whereBetween('pickup_date', [from, to])
      .whereNot('status', OrderStatus.CANCELLED)
      .whereNotNull('pickup_slot')
      .select(db.raw(`to_char(pickup_date, 'YYYY-MM-DD') as day`), 'pickup_slot')
      .count('* as total')
      .groupBy('pickup_date', 'pickup_slot')

    const booked = new Map<string, number>()
    for (const row of rows) {
      booked.set(`${row.day}:${row.pickup_slot}`, Number(row.total))
    }

    return (date: string): SlotAvailability[] =>
      slots.map((setting, slot) => {
        const count = booked.get(`${date}:${slot}`) ?? 0
        return {
          slot,
          label: setting.label,
          capacity: setting.capacity,
          booked: count,
          isOpen: setting.on,
          isFull: count >= setting.capacity,
        }
      })
  }

  async upcomingAvailability(days = 7) {
    const today = DateTime.now().setZone(SERVICE_ZONE).startOf('day')
    const from = today.plus({ days: 1 }).toISODate()!
    const to = today.plus({ days }).toISODate()!
    const lookup = await this.slotAvailability(from, to)
    const result: Record<string, SlotAvailability[]> = {}
    for (let offset = 1; offset <= days; offset++) {
      const date = today.plus({ days: offset }).toISODate()!
      result[date] = lookup(date)
    }
    return result
  }

  findByCode(code: string) {
    return Order.query()
      .where('public_code', code)
      .withScopes((scopes) => {
        scopes.withDetails()
        scopes.withHistory()
      })
      .first()
  }

  latestActive(user: User) {
    return this.#forCustomer(user)
      .whereNotIn('status', [...FINISHED_STATUSES])
      .orderBy('created_at', 'desc')
      .first()
  }

  recentCompleted(user: User, limit = 3) {
    return this.#forCustomer(user)
      .where('status', OrderStatus.COMPLETED)
      .orderBy('created_at', 'desc')
      .limit(limit)
  }

  async hasOrders(user: User) {
    return !!(await Order.query().where('user_id', user.id).select('id').first())
  }

  async listForCustomer(
    user: User,
    options: { filter: OrderFilter; search: string; page: number }
  ) {
    const query = this.#forCustomer(user).orderBy('created_at', 'desc')
    if (options.filter === 'berjalan') {
      query.whereNotIn('status', [...FINISHED_STATUSES])
    }
    if (options.filter === 'selesai') {
      query.where('status', OrderStatus.COMPLETED)
    }
    if (options.filter === 'dibatalkan') {
      query.where('status', OrderStatus.CANCELLED)
    }
    if (options.search) {
      query.whereILike('public_code', `%${options.search}%`)
    }
    const result = await query.paginate(options.page, ORDERS_PER_PAGE)
    return {
      orders: result.all(),
      meta: { currentPage: result.currentPage, lastPage: result.lastPage, total: result.total },
      counts: await this.#filterCounts(user),
    }
  }

  listForOwner() {
    return Order.query()
      .preload('pickupAddress')
      .preload('deliveryAddress')
      .preload('bill')
      .preload('payments')
      .preload('events', (events) => events.preload('actor').orderBy('id', 'asc'))
      .orderBy('created_at', 'desc')
  }

  detailForOwner(code: string) {
    return Order.query()
      .where('public_code', code)
      .preload('pickupAddress')
      .preload('deliveryAddress')
      .preload('items', (items) => items.orderBy('position', 'asc'))
      .preload('bill', (bill) => bill.preload('lines').preload('decider'))
      .preload('payments', (payments) => payments.preload('recorder').orderBy('id', 'asc'))
      .preload('photos', (photos) => photos.preload('taker').orderBy('id', 'asc'))
      .preload('events', (events) => events.preload('actor').orderBy('id', 'asc'))
      .first()
  }

  activityOf(order: Order) {
    return ActivityLog.query().where('order_id', order.id).preload('actor').orderBy('id', 'desc')
  }

  historyOf(order: Order) {
    return this.listForOwner()
      .where((query) => {
        query.where('customer_phone', order.customerPhone)
        if (order.userId) {
          query.orWhere('user_id', order.userId)
        }
      })
      .limit(20)
  }

  async check(user: User, payload: OrderPayload) {
    await this.#assertSlotOpen(payload)
    const pickup = await this.#resolveAddress(user, payload.pickupAddressId, 'pickupAddressId')
    await this.#assertServiceable(pickup, 'pickupAddressId')
    const delivery = payload.deliveryAddressId
      ? await this.#resolveAddress(user, payload.deliveryAddressId, 'deliveryAddressId')
      : null
    if (delivery) {
      await this.#assertServiceable(delivery, 'deliveryAddressId')
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
      await this.#assertSlotOpen(payload, transaction)

      const pickup = await this.#resolveAddress(
        user,
        payload.pickupAddressId,
        'pickupAddressId',
        transaction
      )
      const delivery = payload.deliveryAddressId
        ? await this.#resolveAddress(
            user,
            payload.deliveryAddressId,
            'deliveryAddressId',
            transaction
          )
        : pickup

      const order = await this.#createWithCode(transaction, {
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
      })
      await OrderAddress.createMany(
        [
          { ...snapshotOf(user, pickup), orderId: order.id, type: OrderAddressType.PICKUP },
          { ...snapshotOf(user, delivery), orderId: order.id, type: OrderAddressType.DELIVERY },
        ],
        { client: transaction }
      )
      await CustomerAddress.query({ client: transaction })
        .whereIn('id', [...new Set([pickup.id, delivery.id])])
        .update({ last_used_at: DateTime.now().toJSDate() })
      await this.#record(order, OrderStatus.AWAITING_PICKUP, { actor: user }, transaction)
      return { order, isNew: true }
    })

    if (result.isNew) {
      const slots = await Setting.get('pickup_slots')
      const slot = slots[payload.slot]
      await this.notify(result.order, MessagePurpose.NEW_ORDER, slot?.label ?? '')
    }
    return result.order
  }

  async cancelByCustomer(user: User, order: Order, reason: string) {
    const cancelled = await db.transaction(async (transaction) => {
      const locked = await this.lock(transaction, order.id)
      if (locked.status !== OrderStatus.AWAITING_PICKUP) {
        throw fieldError(
          'form',
          'Pesanan sudah diproses kurir dan tidak bisa dibatalkan di sini. Hubungi kami via WhatsApp.',
          'order.not_cancellable'
        )
      }
      locked.cancelReason = reason
      await this.transition(
        locked,
        OrderStatus.CANCELLED,
        { actor: user, note: `Dibatalkan pelanggan: ${reason}` },
        transaction
      )
      return locked
    })
    await this.notify(cancelled, MessagePurpose.CUSTOMER_CANCELLED, reason)
    return cancelled
  }

  customerByPhone(phone: string) {
    return User.query().where('phone', phone).where('role', Role.CUSTOMER).first()
  }

  async createWalkIn(staff: User, phone: string, payload: WalkInPayload) {
    const customer = await this.customerByPhone(phone)
    const name = customer?.name ?? payload.name?.trim()
    if (!name) {
      throw fieldError('name', 'Isi nama pelanggan.', 'name.required')
    }

    let delivery = null
    if (payload.returnMethod === ReturnMethod.DELIVERY) {
      const saved =
        customer && payload.useSavedAddress
          ? await CustomerAddress.query()
              .where('user_id', customer.id)
              .where('is_primary', true)
              .withScopes((scopes) => scopes.active())
              .first()
          : null
      if (saved) {
        delivery = snapshotOf(customer!, saved)
      } else {
        if (!payload.address || !payload.point) {
          throw fieldError('address', 'Isi alamat dan titik antar di peta.', 'address.required')
        }
        await this.#assertServiceable(payload.point, 'address')
        delivery = {
          customerAddressId: null,
          label: 'Alamat antar',
          recipientName: name,
          recipientPhone: phone,
          addressText: payload.address,
          landmark: null,
          lat: payload.point.lat,
          lng: payload.point.lng,
        }
      }
    }

    return db.transaction(async (transaction) => {
      const order = await this.#createWithCode(transaction, {
        userId: customer?.id ?? null,
        requestKey: randomUUID(),
        source: OrderSource.STORE,
        returnMethod: payload.returnMethod,
        customerName: name,
        customerPhone: phone,
        status: OrderStatus.IN_INSPECTION,
        itemsSepatu: payload.items.sepatu,
        itemsTas: payload.items.tas,
        itemsHelm: payload.items.helm,
        note: payload.note ?? '',
        pickupDate: null,
        pickupSlot: null,
      })

      if (delivery) {
        await OrderAddress.create(
          { ...delivery, orderId: order.id, type: OrderAddressType.DELIVERY },
          { client: transaction }
        )
      }
      await this.#record(order, OrderStatus.IN_INSPECTION, { actor: staff }, transaction)
      await ActivityLog.record(
        {
          actor: staff,
          order,
          action: ActivityAction.WALK_IN_CREATED,
          detail: `${order.itemCount()} barang · ${name}`,
        },
        transaction
      )
      order.useTransaction(transaction)
      order.merge({
        claimedBy: staff.id,
        claimedTask: OrderTask.INSPECTION,
        claimedAt: DateTime.now(),
      })
      await order.save()
      return order
    })
  }

  async addIntakePhotos(staff: User, order: Order, files: MultipartFile[]) {
    await db.transaction(async (transaction) => {
      for (const file of files) {
        await OrderPhoto.store(file, order, PhotoKind.INTAKE, staff, transaction)
      }
      await ActivityLog.record(
        {
          actor: staff,
          order,
          action: ActivityAction.ITEMS_PHOTOGRAPHED,
          detail: `${files.length} foto barang diterima`,
        },
        transaction
      )
    })
  }

  async moveToStage(owner: User, codes: string[], stage: OrderStage) {
    let changed = 0
    for (const code of codes) {
      const isChanged = await db.transaction(async (transaction) => {
        const order = await Order.query({ client: transaction })
          .where('public_code', code)
          .forUpdate()
          .first()
        const next = order?.ownerMoves().find((status) => OrderStatusStage[status] === stage)
        if (!order || !next) {
          return false
        }
        await this.transition(
          order,
          next,
          { actor: owner, note: 'Diubah owner', isSensitive: true },
          transaction
        )
        order.clearClaim()
        await order.save()
        return true
      })
      changed += isChanged ? 1 : 0
    }
    return { changed, skipped: codes.length - changed }
  }

  async cancelByOwner(owner: User, codes: string[], reason: string) {
    const cancelled: Order[] = []
    for (const code of codes) {
      const order = await db.transaction(async (transaction) => {
        const locked = await Order.query({ client: transaction })
          .where('public_code', code)
          .forUpdate()
          .first()
        if (!locked || FINISHED_STATUSES.includes(locked.status)) {
          return null
        }
        locked.cancelReason = reason
        await this.transition(
          locked,
          OrderStatus.CANCELLED,
          {
            actor: owner,
            note: reason,
            action: ActivityAction.ORDER_CANCELLED,
            detail: `${OrderStatusLabel[locked.status]} → Dibatalkan · ${reason}`,
            isSensitive: true,
            isOwnerOverride: true,
          },
          transaction
        )
        locked.clearClaim()
        await locked.save()
        return locked
      })
      if (order) {
        cancelled.push(order)
      }
    }

    const notices: MessageStatus[] = []
    for (const order of cancelled) {
      notices.push(await this.notify(order, MessagePurpose.ORDER_CANCELLED, reason))
    }
    return { cancelled: cancelled.length, skipped: codes.length - cancelled.length, notices }
  }

  async #record(
    order: Order,
    status: OrderStatus,
    options: { actor: User | null; note?: string | null },
    transaction: TransactionClientContract
  ) {
    await OrderEvent.create(
      { orderId: order.id, status, actorId: options.actor?.id ?? null, note: options.note ?? null },
      { client: transaction }
    )
    transaction.after('commit', async () => {
      this.broadcast(order)
    })
  }

  #forCustomer(user: User) {
    return Order.query()
      .where('user_id', user.id)
      .withScopes((scopes) => {
        scopes.withDetails()
        scopes.withHistory()
      })
  }

  async #filterCounts(user: User): Promise<Record<OrderFilter, number>> {
    const rows = await Order.query()
      .where('user_id', user.id)
      .select('status')
      .count('* as total')
      .groupBy('status')
    const totals = Object.fromEntries(
      rows.map((row) => [row.status, Number(row.$extras.total)])
    ) as Partial<Record<OrderStatus, number>>
    const all = Object.values(totals).reduce((sum, count) => sum + count, 0)
    const completed = totals[OrderStatus.COMPLETED] ?? 0
    const cancelled = totals[OrderStatus.CANCELLED] ?? 0
    return {
      semua: all,
      berjalan: all - completed - cancelled,
      selesai: completed,
      dibatalkan: cancelled,
    }
  }

  async #resolveAddress(
    user: User,
    id: number,
    field: string,
    transaction?: TransactionClientContract
  ) {
    const address = await CustomerAddress.query({ client: transaction })
      .where('user_id', user.id)
      .where('id', id)
      .withScopes((scopes) => scopes.active())
      .first()
    if (!address) {
      throw fieldError(field, 'Alamat tidak ditemukan. Pilih alamat lain.', 'address.missing')
    }
    return address
  }

  async #assertServiceable(point: Point, field: string) {
    if ((await this.area.check(point)) === 'outside') {
      throw fieldError(field, 'Titik jemput di luar area antar-jemput gratis.', 'area.outside')
    }
  }

  async #assertSlotOpen(payload: OrderPayload, transaction?: TransactionClientContract) {
    const lookup = await this.slotAvailability(payload.date, payload.date, transaction)
    const slot = lookup(payload.date)[payload.slot]
    if (!slot || !slot.isOpen) {
      throw fieldError('slot', 'Jam ini tidak tersedia. Pilih jam lain.', 'slot.closed')
    }
    if (slot.isFull) {
      throw fieldError('slot', SLOT_FULL_MESSAGE, 'slot.full')
    }
  }

  async #createWithCode(transaction: TransactionClientContract, attributes: Partial<Order>) {
    for (let attempt = 0; attempt < CODE_RETRIES; attempt++) {
      try {
        return await transaction.transaction((savepoint) =>
          Order.create({ ...attributes, publicCode: newPublicCode() }, { client: savepoint })
        )
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error
        }
      }
    }
    throw new Error('Could not allocate a unique order code')
  }

  #text(order: Order, purpose: MessagePurpose, detail: string, store: StoreInfo) {
    const code = order.publicCode
    const link = (path = '') => `${env.get('APP_URL')}/pesanan/${code}${path}`
    const greeting = `Halo ${order.customerName.split(' ')[0] || 'Kak'},`
    switch (purpose) {
      case MessagePurpose.NEW_ORDER: {
        const date = order.pickupDate
          ? DateTime.fromISO(order.pickupDate.toISODate()!, { zone: SERVICE_ZONE })
              .setLocale('id')
              .toFormat('ccc, d LLL')
          : '-'
        const items = [
          [order.itemsSepatu, 'Sepatu'],
          [order.itemsTas, 'Tas'],
          [order.itemsHelm, 'Helm'],
        ]
          .filter(([count]) => Number(count) > 0)
          .map(([count, label]) => `${label} ×${count}`)
          .join(', ')
        return `Pesanan baru ${code} dari ${order.customerName} (${order.customerPhone}). Jemput ${date} ${detail}. Barang: ${items}.`
      }
      case MessagePurpose.CUSTOMER_CANCELLED:
        return `Pesanan ${code} (${order.customerName}) dibatalkan pelanggan. Alasan: ${detail}.`
      case MessagePurpose.COURIER_ON_THE_WAY:
        return `${greeting} kurir ${detail} sedang menuju lokasi Anda untuk menjemput pesanan ${code}.`
      case MessagePurpose.PICKED_UP:
        return `${greeting} barang pesanan ${code} sudah kami terima. Kami periksa dulu, lalu tagihan dikirim lewat WhatsApp ini.`
      case MessagePurpose.PICKUP_SKIPPED:
        return `${greeting} kurir belum bisa menjemput pesanan ${code} (${detail}). Kami akan menghubungi Anda untuk jadwal ulang. Balas pesan ini bila ada pertanyaan.`
      case MessagePurpose.BILL_READY:
        return `${greeting} barang pesanan ${code} sudah diperiksa. Total tagihan ${detail}. Lihat rincian dan bayar dengan QRIS: ${link('/tagihan')}`
      case MessagePurpose.PAID:
        return `${greeting} pembayaran pesanan ${code} sebesar ${detail} sudah kami terima. Barang Anda mulai dicuci.`
      case MessagePurpose.OUT_FOR_DELIVERY:
        return `${greeting} pesanan ${code} sedang diantar oleh ${detail}. Mohon pastikan ada yang menerima di lokasi.`
      case MessagePurpose.DELIVERY_SKIPPED:
        return `${greeting} pengantaran pesanan ${code} tertunda (${detail}). Kami akan menghubungi Anda untuk jadwal ulang.`
      case MessagePurpose.READY_FOR_COLLECTION:
        return `${greeting} pesanan ${code} sudah selesai dicuci dan siap diambil di ${store.name}, ${store.address} (${store.hours}).`
      case MessagePurpose.ORDER_CANCELLED:
        return `${greeting} pesanan ${code} dibatalkan oleh ${store.name}. Alasan: ${detail}. Hubungi kami bila ada pertanyaan.`
      case MessagePurpose.RECEIPT:
        return `Struk ${store.name}\n${detail}\nTerima kasih!`
      default:
        return `${greeting} ada pembaruan untuk pesanan ${code}: ${detail}`
    }
  }
}
