import { inject } from '@adonisjs/core'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import db from '@adonisjs/lucid/services/db'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { ActivityAction } from '#enums/activity_enum'
import { OrderSource, OrderStatus, PhotoKind, ReturnMethod } from '#enums/order_enum'
import ActivityLog from '#models/activity_log'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import OrderPhoto from '#models/order_photo'
import Setting from '#models/setting'
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

const WORKSHOP_STATUSES = [
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
    startDetail: 'Jemput dimulai',
    photo: PhotoKind.PICKUP,
    doneAction: ActivityAction.PICKUP_DONE,
    skipAction: ActivityAction.PICKUP_SKIPPED,
  },
  delivery: {
    queued: OrderStatus.READY_FOR_DELIVERY,
    active: OrderStatus.IN_DELIVERY,
    done: OrderStatus.COMPLETED,
    startDetail: 'Antar dimulai',
    photo: PhotoKind.DELIVERY,
    doneAction: ActivityAction.DELIVERY_DONE,
    skipAction: ActivityAction.DELIVERY_SKIPPED,
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
}

function startOfToday() {
  return DateTime.now().setZone(SERVICE_ZONE).startOf('day')
}

@inject()
export default class TaskService {
  constructor(protected orders: OrderService) {}

  async tripBoard(kind: TripKind) {
    const [active, queue, slots] = await Promise.all([
      this.#activeTrip(kind),
      this.#tripQueue(kind),
      Setting.get('pickup_slots'),
    ])
    return { active, queue, slots }
  }

  #activeTrip(kind: TripKind) {
    return this.#tripQuery().where('status', TRIP[kind].active).orderBy('updated_at', 'asc').first()
  }

  async #tripQueue(kind: TripKind) {
    const query = this.#tripQuery().where('status', TRIP[kind].queued)
    if (kind === 'pickup') {
      query
        .where('pickup_date', '<=', startOfToday().toISODate()!)
        .orderBy('pickup_date', 'asc')
        .orderBy('pickup_slot', 'asc')
    } else {
      query.orderBy('updated_at', 'asc')
    }
    const orders = await query.orderBy('id', 'asc')
    const skipped = await this.#skippedToday(kind)
    return [
      ...orders.filter((order) => !skipped.has(order.id)),
      ...orders.filter((order) => skipped.has(order.id)),
    ]
  }

  tripsHandledToday(user: User, kind: TripKind) {
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

  async hasArrived(order: Order) {
    const started = await ActivityLog.query()
      .where('order_id', order.id)
      .where('action', ActivityAction.TASK_STARTED)
      .orderBy('id', 'desc')
      .first()
    if (!started) {
      return false
    }
    const arrival = await ActivityLog.query()
      .where('order_id', order.id)
      .where('action', ActivityAction.ARRIVED)
      .where('id', '>', started.id)
      .first()
    return !!arrival
  }

  async startTrip(user: User, id: number, kind: TripKind) {
    const trip = TRIP[kind]
    const current = await this.#activeTrip(kind)
    if (current && current.id !== id) {
      throw fieldError(
        'form',
        `Selesaikan atau lewati dulu tugas ${current.number()}.`,
        'task.busy'
      )
    }

    return db.transaction(async (transaction) => {
      const locked = await this.orders.lockOrder(transaction, id)
      await this.orders.transitionOrder(
        locked,
        trip.active,
        { actor: user, action: ActivityAction.TASK_STARTED, detail: trip.startDetail },
        transaction
      )
      return locked
    })
  }

  async arriveAtTrip(user: User, id: number, kind: TripKind) {
    const order = await Order.find(id)
    if (!order) {
      throw fieldError('form', 'Pesanan tidak ditemukan.', 'order.missing')
    }
    this.#assertActive(order, kind)
    await ActivityLog.record({ actor: user, order, action: ActivityAction.ARRIVED })
  }

  async completeTrip(
    user: User,
    id: number,
    kind: TripKind,
    photo: MultipartFile,
    receiver?: string
  ) {
    const trip = TRIP[kind]
    return db.transaction(async (transaction) => {
      const locked = await this.orders.lockOrder(transaction, id)
      this.#assertActive(locked, kind)
      await OrderPhoto.storePhoto(photo, locked, trip.photo, user, transaction)
      if (receiver) {
        locked.receiverName = receiver
      }
      await this.orders.transitionOrder(
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
      return locked
    })
  }

  async skipTrip(user: User, id: number, kind: TripKind, reason: string, note?: string | null) {
    const trip = TRIP[kind]
    const text = note ? `${reason} · ${note}` : reason
    return db.transaction(async (transaction) => {
      const locked = await this.orders.lockOrder(transaction, id)
      this.#assertActive(locked, kind)
      await this.orders.transitionOrder(
        locked,
        trip.queued,
        { actor: user, action: trip.skipAction, note: text, detail: text },
        transaction
      )
      return locked
    })
  }

  workshopQueue() {
    return Order.query()
      .whereIn('status', WORKSHOP_STATUSES)
      .preload('items', (items) => items.orderBy('position', 'asc'))
      .preload('bill')
      .preload('payments')
      .preload('events', (events) => events.preload('actor').orderBy('id', 'asc'))
      .orderBy('updated_at', 'asc')
  }

  findOrderForWorkshop(id: number) {
    return Order.query()
      .where('id', id)
      .preload('items', (items) => items.orderBy('position', 'asc'))
      .preload('bill', (bill) => bill.preload('lines', (lines) => lines.preload('service')))
      .preload('payments')
      .preload('photos', (photos) => photos.preload('taker').orderBy('id', 'asc'))
      .preload('events', (events) => events.preload('actor').orderBy('id', 'asc'))
      .preload('deliveryAddress')
      .first()
  }

  async startInspection(user: User, id: number) {
    return db.transaction(async (transaction) => {
      const order = await this.orders.lockOrder(transaction, id)
      if (order.status === OrderStatus.PICKED_UP) {
        await this.orders.transitionOrder(
          order,
          OrderStatus.IN_INSPECTION,
          { actor: user, action: ActivityAction.INSPECTION_STARTED },
          transaction
        )
      } else if (order.status !== OrderStatus.IN_INSPECTION) {
        throw fieldError('form', 'Pesanan ini tidak menunggu pemeriksaan.', 'order.status')
      }
      return order
    })
  }

  async completeWash(user: User, id: number, photo: MultipartFile) {
    return db.transaction(async (transaction) => {
      const locked = await this.orders.lockOrder(transaction, id)
      if (locked.status !== OrderStatus.IN_CLEANING) {
        throw fieldError('form', 'Pesanan ini tidak sedang dicuci.', 'order.status')
      }
      await OrderPhoto.storePhoto(photo, locked, PhotoKind.WASHING, user, transaction)
      await OrderItem.query({ client: transaction })
        .where('order_id', locked.id)
        .whereNull('washed_at')
        .update({ washed_at: DateTime.now().toJSDate() })
      const next =
        locked.returnMethod === ReturnMethod.STORE
          ? OrderStatus.READY_FOR_COLLECTION
          : OrderStatus.READY_FOR_DELIVERY
      await this.orders.transitionOrder(
        locked,
        next,
        { actor: user, action: ActivityAction.WASH_DONE, detail: 'Foto hasil cuci' },
        transaction
      )
      return locked
    })
  }

  async collectOrder(user: User, id: number) {
    return db.transaction(async (transaction) => {
      const order = await this.orders.lockOrder(transaction, id)
      await this.orders.transitionOrder(
        order,
        OrderStatus.COMPLETED,
        { actor: user, action: ActivityAction.COLLECTED, note: 'Diambil di toko' },
        transaction
      )
      return order
    })
  }

  async staffCounts(): Promise<StaffCounts> {
    const [jemput, antar, proses] = await Promise.all([
      this.#count(
        Order.query().where((query) => {
          query
            .where((waiting) => {
              waiting
                .where('status', OrderStatus.AWAITING_PICKUP)
                .where('pickup_date', '<=', startOfToday().toISODate()!)
            })
            .orWhere('status', OrderStatus.COURIER_EN_ROUTE)
        })
      ),
      this.#count(
        Order.query().whereIn('status', [OrderStatus.READY_FOR_DELIVERY, OrderStatus.IN_DELIVERY])
      ),
      this.#count(
        Order.query()
          .whereIn('status', WORKSHOP_STATUSES)
          .whereNot((query) => {
            query.where('status', OrderStatus.AWAITING_PAYMENT).where('source', OrderSource.ONLINE)
          })
      ),
    ])
    return { jemput, antar, proses }
  }

  async staffHistory(user: User, days = 7) {
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
        ref: log.order.number(),
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

  async #skippedToday(kind: TripKind) {
    const rows = await ActivityLog.query()
      .where('action', TRIP[kind].skipAction)
      .where('created_at', '>=', startOfToday().toJSDate())
      .select('order_id')
    return new Set(rows.map((row) => row.orderId))
  }

  async #count(query: ModelQueryBuilderContract<typeof Order>) {
    const [row] = await query.count('* as total')
    return Number(row.$extras.total)
  }

  #assertActive(order: Order, kind: TripKind) {
    if (order.status !== TRIP[kind].active) {
      throw fieldError(
        'form',
        'Tugas ini tidak sedang berjalan. Buka lagi dari antrean.',
        'task.not_active'
      )
    }
  }
}
