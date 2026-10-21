import { inject } from '@adonisjs/core'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { ActivityAction } from '#enums/activity_enum'
import { MessagePurpose } from '#enums/message_enum'
import { OrderStatus, OrderTask, OrderTaskLabel, PhotoKind } from '#enums/order_enum'
import ActivityLog from '#models/activity_log'
import Order from '#models/order'
import type User from '#models/user'
import ActivityService from '#services/activity_service'
import NotificationService from '#services/notification_service'
import OrderStatusService from '#services/order/order_status_service'
import OrderTaskService from '#services/order/order_task_service'
import ProofPhotoService from '#services/proof_photo_service'
import { fieldError } from '#validators/shared/field_error'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

export type TripKind = 'pickup' | 'delivery'

export const SKIP_REASONS = [
  'Pelanggan tidak bisa dihubungi (±15 menit)',
  'Pelanggan tidak ada di lokasi',
  'Jalan ditutup / masalah rute',
  'Lokasi tidak bisa diakses',
  'Kendaraan bermasalah',
  'Lainnya',
] as const

const TRIP = {
  pickup: {
    queued: OrderStatus.AWAITING_PICKUP,
    active: OrderStatus.COURIER_EN_ROUTE,
    done: OrderStatus.PICKED_UP,
    task: OrderTask.PICKUP,
    photo: PhotoKind.PICKUP,
    doneAction: ActivityAction.PICKUP_DONE,
    skipAction: ActivityAction.PICKUP_SKIPPED,
    startMessage: MessagePurpose.COURIER_ON_THE_WAY,
    doneMessage: MessagePurpose.PICKED_UP,
    skipMessage: MessagePurpose.PICKUP_SKIPPED,
  },
  delivery: {
    queued: OrderStatus.READY_FOR_DELIVERY,
    active: OrderStatus.IN_DELIVERY,
    done: OrderStatus.COMPLETED,
    task: OrderTask.DELIVERY,
    photo: PhotoKind.DELIVERY,
    doneAction: ActivityAction.DELIVERY_DONE,
    skipAction: ActivityAction.DELIVERY_SKIPPED,
    startMessage: MessagePurpose.OUT_FOR_DELIVERY,
    doneMessage: null,
    skipMessage: MessagePurpose.DELIVERY_SKIPPED,
  },
} as const

function startOfToday() {
  return DateTime.now().setZone(SERVICE_ZONE).startOf('day')
}

@inject()
export default class FieldTaskService {
  constructor(
    protected statuses: OrderStatusService,
    protected tasks: OrderTaskService,
    protected activity: ActivityService,
    protected photos: ProofPhotoService,
    protected notifications: NotificationService
  ) {}

  #query() {
    return Order.query()
      .preload('pickupAddress')
      .preload('deliveryAddress')
      .preload('items', (items) => items.orderBy('position', 'asc'))
      .preload('bill', (bill) => bill.preload('lines'))
  }

  async active(user: User, kind: TripKind) {
    return this.#query()
      .where('status', TRIP[kind].active)
      .where('claimed_by', user.id)
      .orderBy('claimed_at', 'asc')
      .first()
  }

  async queue(user: User, kind: TripKind) {
    const floor = this.tasks.claimFloor().toJSDate()
    const query = this.#query().where((builder) => {
      builder.where('status', TRIP[kind].queued).orWhere((expired) => {
        expired.where('status', TRIP[kind].active).where('claimed_at', '<', floor)
      })
    })
    this.tasks.available(user, query)
    if (kind === 'pickup') {
      query
        .where('pickup_date', '<=', startOfToday().toISODate()!)
        .orderBy('pickup_date', 'asc')
        .orderBy('pickup_slot', 'asc')
    } else {
      query.orderBy('updated_at', 'asc')
    }
    const orders = await query.orderBy('id', 'asc')
    const skipped = await this.#skippedToday(user, kind)
    return [
      ...orders.filter((order) => !skipped.has(order.id)),
      ...orders.filter((order) => skipped.has(order.id)),
    ]
  }

  async handledToday(user: User, kind: TripKind) {
    return ActivityLog.query()
      .where('actor_id', user.id)
      .whereIn('action', [TRIP[kind].doneAction, TRIP[kind].skipAction])
      .where('created_at', '>=', startOfToday().toJSDate())
      .whereNotNull('order_id')
      .preload('order', (order) => {
        order.preload('pickupAddress').preload('deliveryAddress').preload('items')
      })
      .orderBy('id', 'desc')
  }

  async hasArrived(user: User, order: Order) {
    if (!order.claimedAt) {
      return false
    }
    const arrival = await ActivityLog.query()
      .where('order_id', order.id)
      .where('actor_id', user.id)
      .where('action', ActivityAction.ARRIVED)
      .where('created_at', '>=', order.claimedAt.toJSDate())
      .first()
    return !!arrival
  }

  async start(user: User, code: string, kind: TripKind) {
    const trip = TRIP[kind]
    const current = await this.active(user, kind)
    if (current && current.publicCode !== code) {
      throw fieldError(
        'form',
        `Selesaikan atau lewati dulu tugas ${current.publicCode}.`,
        'task.busy'
      )
    }

    const order = await db.transaction(async (transaction) => {
      const locked = await this.#lockByCode(transaction, code)
      if (this.tasks.holds(user, locked) && locked.status === trip.active) {
        return locked
      }
      this.tasks.assertAvailable(user, locked)
      const detail = `${OrderTaskLabel[trip.task]} dimulai`
      if (locked.status === trip.active) {
        await this.activity.record(
          { actor: user, order: locked, action: ActivityAction.TASK_STARTED, detail },
          transaction
        )
      } else {
        await this.statuses.transition(
          locked,
          trip.active,
          { actor: user, action: ActivityAction.TASK_STARTED, detail },
          transaction
        )
      }
      await this.tasks.claim(user, locked, trip.task, transaction)
      return locked
    })

    await this.notifications.toCustomer(order, trip.startMessage, user.firstName())
    return order
  }

  async arrive(user: User, code: string, kind: TripKind) {
    const order = await this.#held(user, code, kind)
    await this.activity.record({ actor: user, order, action: ActivityAction.ARRIVED })
  }

  async release(user: User, code: string, kind: TripKind) {
    const trip = TRIP[kind]
    await db.transaction(async (transaction) => {
      const order = await this.#lockByCode(transaction, code)
      this.#assertHeld(user, order, kind)
      await this.statuses.transition(
        order,
        trip.queued,
        { actor: user, action: ActivityAction.TASK_RELEASED, note: 'Tugas dilepas staf' },
        transaction
      )
      await this.tasks.clear(order, transaction)
    })
  }

  async complete(
    user: User,
    code: string,
    kind: TripKind,
    photo: MultipartFile,
    receiver?: string
  ) {
    const trip = TRIP[kind]
    const order = await db.transaction(async (transaction) => {
      const locked = await this.#lockByCode(transaction, code)
      this.#assertHeld(user, locked, kind)
      await this.photos.store(photo, locked, trip.photo, user, transaction)
      if (receiver) {
        locked.receiverName = receiver
      }
      await this.statuses.transition(
        locked,
        trip.done,
        {
          actor: user,
          action: trip.doneAction,
          note: receiver ? `Diterima oleh ${receiver}` : null,
          detail:
            kind === 'pickup'
              ? `${locked.itemCount()} barang dijemput · foto bukti`
              : `Foto bukti · diterima oleh “${receiver}”`,
        },
        transaction
      )
      await this.tasks.clear(locked, transaction)
      return locked
    })

    if (trip.doneMessage) {
      await this.notifications.toCustomer(order, trip.doneMessage)
    }
    return order
  }

  async skip(user: User, code: string, kind: TripKind, reason: string, note?: string | null) {
    const trip = TRIP[kind]
    const text = note ? `${reason} · ${note}` : reason
    const order = await db.transaction(async (transaction) => {
      const locked = await this.#lockByCode(transaction, code)
      this.#assertHeld(user, locked, kind)
      await this.statuses.transition(
        locked,
        trip.queued,
        { actor: user, action: trip.skipAction, note: text, detail: text },
        transaction
      )
      await this.tasks.clear(locked, transaction)
      return locked
    })

    await this.notifications.toCustomer(order, trip.skipMessage, reason.toLowerCase())
    return order
  }

  async #skippedToday(user: User, kind: TripKind) {
    const rows = await ActivityLog.query()
      .where('actor_id', user.id)
      .where('action', TRIP[kind].skipAction)
      .where('created_at', '>=', startOfToday().toJSDate())
      .select('order_id')
    return new Set(rows.map((row) => row.orderId))
  }

  async #held(user: User, code: string, kind: TripKind) {
    const order = await Order.findBy('public_code', code)
    if (!order) {
      throw fieldError('form', 'Pesanan tidak ditemukan.', 'order.missing')
    }
    this.#assertHeld(user, order, kind)
    return order
  }

  #assertHeld(user: User, order: Order, kind: TripKind) {
    if (order.status !== TRIP[kind].active || !this.tasks.holds(user, order)) {
      throw fieldError(
        'form',
        'Tugas ini tidak sedang Anda pegang. Buka lagi dari antrean.',
        'task.not_held'
      )
    }
  }

  async #lockByCode(transaction: Parameters<OrderStatusService['lock']>[0], code: string) {
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
