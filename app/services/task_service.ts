import { inject } from '@adonisjs/core'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { ActivityAction } from '#enums/activity_enum'
import { MessagePurpose } from '#enums/message_enum'
import {
  OrderSource,
  OrderStatus,
  OrderTask,
  OrderTaskLabel,
  PhotoKind,
  ReturnMethod,
} from '#enums/order_enum'
import ActivityLog from '#models/activity_log'
import Order, { TASK_TAKEN_MESSAGE } from '#models/order'
import OrderItem from '#models/order_item'
import OrderPhoto from '#models/order_photo'
import type User from '#models/user'
import OrderService from '#services/order_service'
import { formatClock } from '#transformers/order_transformer'
import { shortName } from '#transformers/task_transformer'
import { fieldError } from '#validators/shared/field_error'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

export type TripKind = 'pickup' | 'delivery'

export type StaffCounts = { jemput: number; proses: number; antar: number }

export const SKIP_REASONS = [
  'Pelanggan tidak bisa dihubungi (±15 menit)',
  'Pelanggan tidak ada di lokasi',
  'Jalan ditutup / masalah rute',
  'Lokasi tidak bisa diakses',
  'Kendaraan bermasalah',
  'Lainnya',
] as const

export const WORKSHOP_STATUSES = [
  OrderStatus.PICKED_UP,
  OrderStatus.IN_INSPECTION,
  OrderStatus.AWAITING_PAYMENT,
  OrderStatus.IN_CLEANING,
  OrderStatus.READY_FOR_COLLECTION,
]

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

const HISTORY_ICON: Partial<
  Record<ActivityAction, 'jemput' | 'antar' | 'proses' | 'toko' | 'skip'>
> = {
  [ActivityAction.PICKUP_DONE]: 'jemput',
  [ActivityAction.PICKUP_SKIPPED]: 'skip',
  [ActivityAction.DELIVERY_DONE]: 'antar',
  [ActivityAction.DELIVERY_SKIPPED]: 'skip',
  [ActivityAction.BILL_CREATED]: 'proses',
  [ActivityAction.WASH_DONE]: 'proses',
  [ActivityAction.COLLECTED]: 'proses',
  [ActivityAction.WALK_IN_CREATED]: 'toko',
  [ActivityAction.PAYMENT_RECORDED]: 'toko',
  [ActivityAction.RECEIPT_SENT]: 'toko',
}

const HISTORY_TITLE: Partial<Record<ActivityAction, string>> = {
  [ActivityAction.PICKUP_DONE]: 'Jemput selesai',
  [ActivityAction.PICKUP_SKIPPED]: 'Jemput dilewati',
  [ActivityAction.DELIVERY_DONE]: 'Antar selesai',
  [ActivityAction.DELIVERY_SKIPPED]: 'Antar dilewati',
  [ActivityAction.BILL_CREATED]: 'Diperiksa · tagihan dibuat',
  [ActivityAction.WASH_DONE]: 'Selesai dicuci',
  [ActivityAction.COLLECTED]: 'Diserahkan di toko',
  [ActivityAction.WALK_IN_CREATED]: 'Transaksi toko dibuat',
  [ActivityAction.PAYMENT_RECORDED]: 'Pembayaran dicatat',
  [ActivityAction.RECEIPT_SENT]: 'Struk dikirim',
}

function startOfToday() {
  return DateTime.now().setZone(SERVICE_ZONE).startOf('day')
}

@inject()
export default class TaskService {
  constructor(protected orders: OrderService) {}

  activeTrip(user: User, kind: TripKind) {
    return this.#tripQuery()
      .where('status', TRIP[kind].active)
      .where('claimed_by', user.id)
      .orderBy('claimed_at', 'asc')
      .first()
  }

  async queue(user: User, kind: TripKind) {
    const floor = Order.claimFloor().toJSDate()
    const query = this.#tripQuery().where((builder) => {
      builder.where('status', TRIP[kind].queued).orWhere((expired) => {
        expired.where('status', TRIP[kind].active).where('claimed_at', '<', floor)
      })
    })
    this.#available(user, query)
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

  handledToday(user: User, kind: TripKind) {
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

  async startTrip(user: User, code: string, kind: TripKind) {
    const trip = TRIP[kind]
    const current = await this.activeTrip(user, kind)
    if (current && current.publicCode !== code) {
      throw fieldError(
        'form',
        `Selesaikan atau lewati dulu tugas ${current.publicCode}.`,
        'task.busy'
      )
    }

    const order = await db.transaction(async (transaction) => {
      const locked = await this.orders.lockByCode(transaction, code)
      if (locked.isClaimedBy(user) && locked.status === trip.active) {
        return locked
      }
      this.#assertAvailable(user, locked)
      const detail = `${OrderTaskLabel[trip.task]} dimulai`
      if (locked.status === trip.active) {
        await ActivityLog.record(
          { actor: user, order: locked, action: ActivityAction.TASK_STARTED, detail },
          transaction
        )
      } else {
        await this.orders.transition(
          locked,
          trip.active,
          { actor: user, action: ActivityAction.TASK_STARTED, detail },
          transaction
        )
      }
      await this.#claim(user, locked, trip.task, transaction)
      return locked
    })

    await this.orders.notify(order, trip.startMessage, user.firstName())
    return order
  }

  async arrive(user: User, code: string, kind: TripKind) {
    const order = await Order.findBy('public_code', code)
    if (!order) {
      throw fieldError('form', 'Pesanan tidak ditemukan.', 'order.missing')
    }
    this.#assertHeld(user, order, kind)
    await ActivityLog.record({ actor: user, order, action: ActivityAction.ARRIVED })
  }

  async releaseTrip(user: User, code: string, kind: TripKind) {
    const trip = TRIP[kind]
    await db.transaction(async (transaction) => {
      const order = await this.orders.lockByCode(transaction, code)
      this.#assertHeld(user, order, kind)
      await this.orders.transition(
        order,
        trip.queued,
        { actor: user, action: ActivityAction.TASK_RELEASED, note: 'Tugas dilepas staf' },
        transaction
      )
      order.clearClaim()
      await order.save()
    })
  }

  async completeTrip(
    user: User,
    code: string,
    kind: TripKind,
    photo: MultipartFile,
    receiver?: string
  ) {
    const trip = TRIP[kind]
    const order = await db.transaction(async (transaction) => {
      const locked = await this.orders.lockByCode(transaction, code)
      this.#assertHeld(user, locked, kind)
      await OrderPhoto.store(photo, locked, trip.photo, user, transaction)
      if (receiver) {
        locked.receiverName = receiver
      }
      await this.orders.transition(
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
      locked.clearClaim()
      await locked.save()
      return locked
    })

    if (trip.doneMessage) {
      await this.orders.notify(order, trip.doneMessage)
    }
    return order
  }

  async skipTrip(user: User, code: string, kind: TripKind, reason: string, note?: string | null) {
    const trip = TRIP[kind]
    const text = note ? `${reason} · ${note}` : reason
    const order = await db.transaction(async (transaction) => {
      const locked = await this.orders.lockByCode(transaction, code)
      this.#assertHeld(user, locked, kind)
      await this.orders.transition(
        locked,
        trip.queued,
        { actor: user, action: trip.skipAction, note: text, detail: text },
        transaction
      )
      locked.clearClaim()
      await locked.save()
      return locked
    })

    await this.orders.notify(order, trip.skipMessage, reason.toLowerCase())
    return order
  }

  workshopQueue() {
    return Order.query()
      .whereIn('status', WORKSHOP_STATUSES)
      .preload('items', (items) => items.orderBy('position', 'asc'))
      .preload('bill')
      .preload('claimer')
      .preload('payments')
      .preload('events', (events) => events.preload('actor').orderBy('id', 'asc'))
      .orderBy('updated_at', 'asc')
  }

  findForWorkshop(code: string) {
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
      const order = await this.orders.lockByCode(transaction, code)
      if (order.status === OrderStatus.PICKED_UP) {
        await this.orders.transition(
          order,
          OrderStatus.IN_INSPECTION,
          { actor: user, action: ActivityAction.INSPECTION_STARTED },
          transaction
        )
      } else if (order.status !== OrderStatus.IN_INSPECTION) {
        throw fieldError('form', 'Pesanan ini tidak menunggu pemeriksaan.', 'order.status')
      }
      await this.#claim(user, order, OrderTask.INSPECTION, transaction)
      return order
    })
  }

  async completeWash(user: User, code: string, photo: MultipartFile) {
    const order = await db.transaction(async (transaction) => {
      const locked = await this.orders.lockByCode(transaction, code)
      if (locked.status !== OrderStatus.IN_CLEANING) {
        throw fieldError('form', 'Pesanan ini tidak sedang dicuci.', 'order.status')
      }
      await OrderPhoto.store(photo, locked, PhotoKind.WASHING, user, transaction)
      await OrderItem.query({ client: transaction })
        .where('order_id', locked.id)
        .whereNull('washed_at')
        .update({ washed_at: DateTime.now().toJSDate() })
      const next =
        locked.returnMethod === ReturnMethod.STORE
          ? OrderStatus.READY_FOR_COLLECTION
          : OrderStatus.READY_FOR_DELIVERY
      await this.orders.transition(
        locked,
        next,
        { actor: user, action: ActivityAction.WASH_DONE, detail: 'Foto hasil cuci' },
        transaction
      )
      return locked
    })

    const notice =
      order.status === OrderStatus.READY_FOR_COLLECTION
        ? await this.orders.notify(order, MessagePurpose.READY_FOR_COLLECTION)
        : null
    return { order, notice }
  }

  async collect(user: User, code: string) {
    return db.transaction(async (transaction) => {
      const order = await this.orders.lockByCode(transaction, code)
      await this.orders.transition(
        order,
        OrderStatus.COMPLETED,
        { actor: user, action: ActivityAction.COLLECTED, note: 'Diambil di toko' },
        transaction
      )
      return order
    })
  }

  async counts(user: User): Promise<StaffCounts> {
    const [pickupActive, pickups, deliveryActive, deliveries, workshop] = await Promise.all([
      this.activeTrip(user, 'pickup'),
      this.queue(user, 'pickup'),
      this.activeTrip(user, 'delivery'),
      this.queue(user, 'delivery'),
      Order.query()
        .whereIn('status', WORKSHOP_STATUSES)
        .whereNot((query) => {
          query.where('status', OrderStatus.AWAITING_PAYMENT).where('source', OrderSource.ONLINE)
        })
        .count('* as total'),
    ])

    return {
      jemput: pickups.length + (pickupActive ? 1 : 0),
      antar: deliveries.length + (deliveryActive ? 1 : 0),
      proses: Number(workshop[0].$extras.total),
    }
  }

  async history(user: User, days = 7) {
    const since = startOfToday().minus({ days: days - 1 })
    const logs = await ActivityLog.query()
      .where('actor_id', user.id)
      .whereIn('action', Object.keys(HISTORY_ICON))
      .where('created_at', '>=', since.toJSDate())
      .whereNotNull('order_id')
      .preload('order')
      .orderBy('id', 'desc')

    return logs.map((log) => {
      const isSkip = HISTORY_ICON[log.action] === 'skip'
      return {
        id: log.id,
        date: log.createdAt.setZone(SERVICE_ZONE).toISODate()!,
        time: formatClock(log.createdAt),
        icon: HISTORY_ICON[log.action]!,
        title: isSkip ? HISTORY_TITLE[log.action]! : `${HISTORY_TITLE[log.action]} · ${log.detail}`,
        who: shortName(log.order.customerName),
        ref: log.order.publicCode,
        isInStore: log.order.source === OrderSource.STORE,
        note: isSkip ? log.detail : '',
      }
    })
  }

  #tripQuery() {
    return Order.query()
      .preload('pickupAddress')
      .preload('deliveryAddress')
      .preload('items', (items) => items.orderBy('position', 'asc'))
      .preload('bill', (bill) => bill.preload('lines'))
  }

  async #skippedToday(user: User, kind: TripKind) {
    const rows = await ActivityLog.query()
      .where('actor_id', user.id)
      .where('action', TRIP[kind].skipAction)
      .where('created_at', '>=', startOfToday().toJSDate())
      .select('order_id')
    return new Set(rows.map((row) => row.orderId))
  }

  #assertAvailable(user: User, order: Order) {
    if (order.isClaimedByOther(user)) {
      throw fieldError('form', TASK_TAKEN_MESSAGE, 'task.taken')
    }
  }

  #assertHeld(user: User, order: Order, kind: TripKind) {
    if (order.status !== TRIP[kind].active || !order.isClaimedBy(user)) {
      throw fieldError(
        'form',
        'Tugas ini tidak sedang Anda pegang. Buka lagi dari antrean.',
        'task.not_held'
      )
    }
  }

  async #claim(user: User, order: Order, task: OrderTask, transaction: TransactionClientContract) {
    this.#assertAvailable(user, order)
    order.useTransaction(transaction)
    order.merge({ claimedBy: user.id, claimedTask: task, claimedAt: DateTime.now() })
    await order.save()
  }

  #available(user: User, query: ModelQueryBuilderContract<typeof Order>) {
    return query.where((builder) => {
      builder
        .whereNull('claimed_by')
        .orWhere('claimed_by', user.id)
        .orWhere('claimed_at', '<', Order.claimFloor().toJSDate())
    })
  }
}
