import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { ActivityAction } from '#enums/activity_enum'
import { MessagePurpose, type MessageStatus } from '#enums/message_enum'
import {
  FINISHED_STATUSES,
  OrderStatus,
  OrderStatusLabel,
  OrderStatusTone,
  type OrderTone,
} from '#enums/order_enum'
import {
  PaymentChannel,
  PaymentMethod,
  PaymentMethodLabel,
  PaymentStatus,
} from '#enums/payment_enum'
import Order from '#models/order'
import Payment from '#models/payment'
import type User from '#models/user'
import ActivityService from '#services/activity_service'
import NotificationService, { formatRupiah } from '#services/notification_service'
import OrderStatusService, { ORDER_TRANSITIONS } from '#services/order/order_status_service'
import OrderTaskService from '#services/order/order_task_service'
import { fieldError } from '#validators/shared/field_error'

export type PaymentCorrection = {
  method: PaymentMethod
  channel: PaymentChannel
  amount: number
  reason: string
}

export function ownerTargets(status: OrderStatus): OrderTone[] {
  const targets = ORDER_TRANSITIONS[status]
    .filter((next) => next !== OrderStatus.IN_CLEANING && next !== OrderStatus.CANCELLED)
    .map((next) => OrderStatusTone[next])
  return [...new Set(targets)]
}

@inject()
export default class OrderCorrectionService {
  constructor(
    protected statuses: OrderStatusService,
    protected tasks: OrderTaskService,
    protected activity: ActivityService,
    protected notifications: NotificationService
  ) {}

  async moveTo(owner: User, codes: string[], tone: OrderTone) {
    let changed = 0
    for (const code of codes) {
      const isChanged = await db.transaction(async (transaction) => {
        const order = await Order.query({ client: transaction })
          .where('public_code', code)
          .forUpdate()
          .first()
        const next = order
          ? ORDER_TRANSITIONS[order.status].find(
              (status) =>
                OrderStatusTone[status] === tone &&
                status !== OrderStatus.IN_CLEANING &&
                status !== OrderStatus.CANCELLED
            )
          : undefined
        if (!order || !next) {
          return false
        }
        await this.statuses.transition(
          order,
          next,
          { actor: owner, note: 'Diubah owner', isSensitive: true },
          transaction
        )
        await this.tasks.clear(order, transaction)
        return true
      })
      changed += isChanged ? 1 : 0
    }
    return { changed, skipped: codes.length - changed }
  }

  async cancel(owner: User, codes: string[], reason: string) {
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
        await this.statuses.transition(
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
        await this.tasks.clear(locked, transaction)
        return locked
      })
      if (order) {
        cancelled.push(order)
      }
    }

    const notices: MessageStatus[] = []
    for (const order of cancelled) {
      notices.push(
        await this.notifications.toCustomer(order, MessagePurpose.ORDER_CANCELLED, reason)
      )
    }
    return { cancelled: cancelled.length, skipped: codes.length - cancelled.length, notices }
  }

  async correctPayment(owner: User, code: string, correction: PaymentCorrection) {
    return db.transaction(async (transaction) => {
      const order = await Order.query({ client: transaction })
        .where('public_code', code)
        .forUpdate()
        .first()
      if (!order) {
        throw fieldError('form', 'Pesanan tidak ditemukan.', 'order.missing')
      }
      const paid = await Payment.query({ client: transaction })
        .where('order_id', order.id)
        .where('status', PaymentStatus.PAID)
        .first()
      const label = `${PaymentMethodLabel[correction.method]} ${formatRupiah(correction.amount)}`

      if (paid) {
        const before = `${PaymentMethodLabel[paid.method]} ${formatRupiah(paid.amount)}`
        paid.useTransaction(transaction)
        paid.merge({
          method: correction.method,
          channel: correction.channel,
          amount: correction.amount,
          note: `Koreksi owner: ${correction.reason}`,
        })
        await paid.save()
        await this.activity.record(
          {
            actor: owner,
            order,
            action: ActivityAction.PAYMENT_CORRECTED,
            detail: `${before} → ${label} · alasan: ${correction.reason}`,
            isSensitive: true,
          },
          transaction
        )
        return order
      }

      if (order.status !== OrderStatus.AWAITING_PAYMENT) {
        throw fieldError(
          'form',
          'Pesanan ini belum punya tagihan atau sudah dibatalkan.',
          'payment.not_payable'
        )
      }
      await Payment.query({ client: transaction })
        .where('order_id', order.id)
        .where('status', PaymentStatus.PENDING)
        .update({ status: PaymentStatus.CANCELLED })
      await Payment.create(
        {
          orderId: order.id,
          channel: correction.channel,
          method: correction.method,
          status: PaymentStatus.PAID,
          amount: correction.amount,
          paidAt: DateTime.now(),
          recordedBy: owner.id,
          note: `Dicatat owner: ${correction.reason}`,
        },
        { client: transaction }
      )
      await this.statuses.transition(
        order,
        OrderStatus.IN_CLEANING,
        {
          actor: owner,
          note: `Lunas · ${PaymentMethodLabel[correction.method]} (dicatat owner)`,
          action: ActivityAction.PAYMENT_CORRECTED,
          detail: `Belum dibayar → ${label} · alasan: ${correction.reason}`,
          isSensitive: true,
        },
        transaction
      )
      return order
    })
  }
}
