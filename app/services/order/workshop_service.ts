import { inject } from '@adonisjs/core'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import { ActivityAction } from '#enums/activity_enum'
import { MessagePurpose } from '#enums/message_enum'
import { OrderSource, OrderStatus, OrderTask, PhotoKind, ReturnMethod } from '#enums/order_enum'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import type User from '#models/user'
import BillingService, { type InspectedItem } from '#services/billing_service'
import NotificationService, { formatRupiah } from '#services/notification_service'
import OrderStatusService from '#services/order/order_status_service'
import OrderTaskService from '#services/order/order_task_service'
import ProofPhotoService from '#services/proof_photo_service'
import { fieldError } from '#validators/shared/field_error'

export const WORKSHOP_STATUSES = [
  OrderStatus.PICKED_UP,
  OrderStatus.IN_INSPECTION,
  OrderStatus.AWAITING_PAYMENT,
  OrderStatus.IN_CLEANING,
  OrderStatus.READY_FOR_COLLECTION,
]

@inject()
export default class WorkshopService {
  constructor(
    protected statuses: OrderStatusService,
    protected tasks: OrderTaskService,
    protected billing: BillingService,
    protected photos: ProofPhotoService,
    protected notifications: NotificationService
  ) {}

  queue() {
    return Order.query()
      .whereIn('status', WORKSHOP_STATUSES)
      .preload('items', (items) => items.orderBy('position', 'asc'))
      .preload('bill')
      .preload('claimer')
      .preload('payments')
      .preload('events', (events) => events.preload('actor').orderBy('id', 'asc'))
      .orderBy('updated_at', 'asc')
  }

  find(code: string) {
    return Order.query()
      .where('public_code', code)
      .preload('items', (items) => items.orderBy('position', 'asc'))
      .preload('bill', (bill) => bill.preload('lines'))
      .preload('claimer')
      .preload('payments')
      .preload('photos', (photos) => photos.preload('taker').orderBy('id', 'asc'))
      .preload('events', (events) => events.preload('actor').orderBy('id', 'asc'))
      .preload('deliveryAddress')
      .first()
  }

  async startInspection(user: User, code: string) {
    return db.transaction(async (transaction) => {
      const order = await this.#lock(transaction, code)
      if (order.status === OrderStatus.PICKED_UP) {
        await this.statuses.transition(
          order,
          OrderStatus.IN_INSPECTION,
          { actor: user, action: ActivityAction.INSPECTION_STARTED },
          transaction
        )
      } else if (order.status !== OrderStatus.IN_INSPECTION) {
        throw fieldError('form', 'Pesanan ini tidak menunggu pemeriksaan.', 'order.status')
      }
      await this.tasks.claim(user, order, OrderTask.INSPECTION, transaction)
      return order
    })
  }

  async saveInspection(user: User, code: string, items: InspectedItem[]) {
    const order = await db.transaction(async (transaction) => {
      const locked = await this.#lock(transaction, code)
      if (locked.status !== OrderStatus.IN_INSPECTION) {
        throw fieldError('form', 'Pemeriksaan pesanan ini sudah disimpan.', 'order.status')
      }
      this.tasks.assertAvailable(user, locked)
      const bill = await this.billing.replace(locked, items, user, transaction)
      await this.statuses.transition(
        locked,
        OrderStatus.AWAITING_PAYMENT,
        {
          actor: user,
          action: ActivityAction.BILL_CREATED,
          detail: `${items.length} barang · ${formatRupiah(bill.total)}`,
        },
        transaction
      )
      await this.tasks.clear(locked, transaction)
      return { order: locked, total: bill.total }
    })

    const notice =
      order.order.source === OrderSource.ONLINE
        ? await this.notifications.toCustomer(
            order.order,
            MessagePurpose.BILL_READY,
            formatRupiah(order.total)
          )
        : null
    return { ...order, notice }
  }

  async completeWash(user: User, code: string, photo: MultipartFile) {
    const order = await db.transaction(async (transaction) => {
      const locked = await this.#lock(transaction, code)
      if (locked.status !== OrderStatus.IN_CLEANING) {
        throw fieldError('form', 'Pesanan ini tidak sedang dicuci.', 'order.status')
      }
      await this.photos.store(photo, locked, PhotoKind.WASHING, user, transaction)
      await OrderItem.query({ client: transaction })
        .where('order_id', locked.id)
        .whereNull('washed_at')
        .update({ washed_at: DateTime.now().toJSDate() })
      const next =
        locked.returnMethod === ReturnMethod.STORE
          ? OrderStatus.READY_FOR_COLLECTION
          : OrderStatus.READY_FOR_DELIVERY
      await this.statuses.transition(
        locked,
        next,
        { actor: user, action: ActivityAction.WASH_DONE, detail: 'Foto hasil cuci' },
        transaction
      )
      return locked
    })

    const notice =
      order.status === OrderStatus.READY_FOR_COLLECTION
        ? await this.notifications.toCustomer(order, MessagePurpose.READY_FOR_COLLECTION)
        : null
    return { order, notice }
  }

  async collect(user: User, code: string) {
    return db.transaction(async (transaction) => {
      const order = await this.#lock(transaction, code)
      await this.statuses.transition(
        order,
        OrderStatus.COMPLETED,
        { actor: user, action: ActivityAction.COLLECTED, note: 'Diambil di toko' },
        transaction
      )
      return order
    })
  }

  async #lock(transaction: TransactionClientContract, code: string) {
    const order = await Order.query({ client: transaction })
      .where('public_code', code)
      .forUpdate()
      .first()
    if (!order) {
      throw fieldError('form', 'Pesanan tidak ditemukan.', 'order.missing')
    }
    return order
  }
}
