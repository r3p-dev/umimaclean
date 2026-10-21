import { inject } from '@adonisjs/core'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { ActivityAction } from '#enums/activity_enum'
import { FINISHED_STATUSES, OrderStatus, OrderStatusLabel } from '#enums/order_enum'
import Order from '#models/order'
import OrderEvent from '#models/order_event'
import type User from '#models/user'
import ActivityService from '#services/activity_service'
import { afterCommit } from '#services/database_service'
import LiveUpdateService from '#services/live_update_service'
import { fieldError } from '#validators/shared/field_error'

export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [OrderStatus.AWAITING_PICKUP]: [OrderStatus.COURIER_EN_ROUTE, OrderStatus.CANCELLED],
  [OrderStatus.COURIER_EN_ROUTE]: [OrderStatus.PICKED_UP, OrderStatus.AWAITING_PICKUP],
  [OrderStatus.PICKED_UP]: [OrderStatus.IN_INSPECTION],
  [OrderStatus.IN_INSPECTION]: [OrderStatus.AWAITING_PAYMENT],
  [OrderStatus.AWAITING_PAYMENT]: [OrderStatus.IN_CLEANING],
  [OrderStatus.IN_CLEANING]: [OrderStatus.READY_FOR_DELIVERY, OrderStatus.READY_FOR_COLLECTION],
  [OrderStatus.READY_FOR_DELIVERY]: [OrderStatus.IN_DELIVERY],
  [OrderStatus.IN_DELIVERY]: [OrderStatus.COMPLETED, OrderStatus.READY_FOR_DELIVERY],
  [OrderStatus.READY_FOR_COLLECTION]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
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
export default class OrderStatusService {
  constructor(
    protected activity: ActivityService,
    protected live: LiveUpdateService
  ) {}

  canTransition(order: Order, to: OrderStatus, isOwnerOverride = false) {
    if (isOwnerOverride && to === OrderStatus.CANCELLED) {
      return !FINISHED_STATUSES.includes(order.status)
    }
    return ORDER_TRANSITIONS[order.status].includes(to)
  }

  async lock(transaction: TransactionClientContract, orderId: number) {
    return Order.query({ client: transaction }).where('id', orderId).forUpdate().firstOrFail()
  }

  async transition(
    order: Order,
    to: OrderStatus,
    options: TransitionOptions,
    transaction: TransactionClientContract
  ) {
    if (!this.canTransition(order, to, options.isOwnerOverride)) {
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

    await this.record(order, to, options, transaction)
    await this.activity.record(
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

  async record(
    order: Order,
    status: OrderStatus,
    options: { actor: User | null; note?: string | null },
    transaction: TransactionClientContract
  ) {
    await OrderEvent.create(
      { orderId: order.id, status, actorId: options.actor?.id ?? null, note: options.note ?? null },
      { client: transaction }
    )
    afterCommit(transaction, () => this.live.orderChanged(order))
  }
}
