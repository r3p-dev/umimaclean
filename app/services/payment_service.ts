import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { errors as limiterErrors } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import { ActivityAction } from '#enums/activity_enum'
import { OrderStatus } from '#enums/order_enum'
import {
  PaymentChannel,
  PaymentMethod,
  PaymentMethodLabel,
  PaymentStatus,
} from '#enums/payment_enum'
import Order from '#models/order'
import Payment from '#models/payment'
import type User from '#models/user'
import { formatRupiah } from '#helpers/money'
import ActivityLog from '#models/activity_log'
import Setting from '#models/setting'
import MidtransGateway, { type ProviderStatus } from '#services/midtrans_gateway'
import OrderService from '#services/order_service'
import { fieldError } from '#validators/shared/field_error'

const QR_LIFETIME_MINUTES = 15

const PAYMENT_UNAVAILABLE_MESSAGE =
  'Pembayaran QRIS belum tersedia. Bayar di toko atau hubungi kami via WhatsApp.'

const PROVIDER_STATUS: Record<string, PaymentStatus> = {
  capture: PaymentStatus.PAID,
  settlement: PaymentStatus.PAID,
  pending: PaymentStatus.PENDING,
  deny: PaymentStatus.FAILED,
  cancel: PaymentStatus.CANCELLED,
  expire: PaymentStatus.EXPIRED,
  failure: PaymentStatus.FAILED,
}

type PaymentCorrection = {
  method: PaymentMethod
  channel: PaymentChannel
  amount: number
  reason: string
}

type ReconciliationFlag =
  'ok' | 'paid_not_advanced' | 'expired_pending' | 'amount_mismatch' | 'waiting'

type CounterPayment = {
  method: PaymentMethod
  cashReceived?: number | null
  reference?: string | null
}

@inject()
export default class PaymentService {
  constructor(
    protected gateway: MidtransGateway,
    protected orders: OrderService
  ) {}

  async counterCheckout(id: number) {
    const order = await Order.query()
      .where('id', id)
      .preload('items', (items) => items.orderBy('position', 'asc'))
      .preload('bill', (bill) => bill.preload('lines'))
      .preload('payments')
      .first()
    const methods = await Setting.get('payment_methods')
    const pending = order ? await this.currentQris(order) : null
    return { order, methods, pending }
  }

  findPaymentById(id: number) {
    return Payment.findOrFail(id)
  }

  async listQrisReconciliation() {
    // shortcut: shows the latest 300 QRIS charges; add date paging when volume grows
    const payments = await Payment.query()
      .whereNotNull('provider_order_id')
      .preload('order', (order) => order.preload('bill'))
      .orderBy('id', 'desc')
      .limit(300)
    const now = DateTime.now()

    return payments.map((payment) => ({ payment, flag: this.#reconciliationFlag(payment, now) }))
  }

  #reconciliationFlag(payment: Payment, now: DateTime): ReconciliationFlag {
    const order = payment.order
    const billTotal = order.bill?.total ?? null
    if (payment.status === PaymentStatus.PAID && order.status === OrderStatus.AWAITING_PAYMENT) {
      return 'paid_not_advanced'
    }
    if (
      (billTotal !== null && payment.amount !== billTotal) ||
      (payment.note ?? '').includes('tidak cocok')
    ) {
      return 'amount_mismatch'
    }
    if (payment.status === PaymentStatus.PENDING) {
      return payment.expiresAt && payment.expiresAt < now ? 'expired_pending' : 'waiting'
    }
    return 'ok'
  }

  isQrisAvailable() {
    return this.gateway.isConfigured()
  }

  async currentQris(order: Order) {
    return Payment.query()
      .where('order_id', order.id)
      .where('method', PaymentMethod.QRIS)
      .where('status', PaymentStatus.PENDING)
      .where('expires_at', '>', DateTime.now().toJSDate())
      .orderBy('id', 'desc')
      .first()
  }

  async startQris(order: Order, channel: PaymentChannel) {
    await order.load('bill')
    this.#assertPayable(order)
    if (!this.isQrisAvailable()) {
      throw fieldError('form', PAYMENT_UNAVAILABLE_MESSAGE, 'payment.unavailable')
    }

    const current = await this.currentQris(order)
    if (current?.qrUrl) {
      return current
    }

    try {
      await limiter
        .use({ requests: 5, duration: '15 mins', blockDuration: '15 mins' })
        .consume(`qris_charge_${order.id}`)
    } catch (error) {
      if (!(error instanceof limiterErrors.E_TOO_MANY_REQUESTS)) {
        throw error
      }
      throw fieldError(
        'form',
        'Terlalu banyak permintaan kode QR untuk pesanan ini. Coba lagi dalam 15 menit.',
        'payment.throttled'
      )
    }

    const providerOrderId = `UMC-${order.id}-${Date.now()}`
    const amount = order.bill.total

    let charge
    try {
      charge = await this.gateway.chargeQris({
        orderId: providerOrderId,
        amount,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        expiryMinutes: QR_LIFETIME_MINUTES,
      })
    } catch (error) {
      logger.error({ err: error, order: order.id }, 'QRIS charge failed')
      throw fieldError(
        'form',
        'Layanan pembayaran sedang tidak tersedia. Coba lagi sebentar.',
        'payment.provider'
      )
    }

    return db.transaction(async (transaction) => {
      await Payment.query({ client: transaction })
        .where('order_id', order.id)
        .where('status', PaymentStatus.PENDING)
        .update({ status: PaymentStatus.EXPIRED })
      return Payment.create(
        {
          orderId: order.id,
          channel,
          method: PaymentMethod.QRIS,
          status: PaymentStatus.PENDING,
          amount,
          providerOrderId,
          providerTransactionId: charge.transactionId,
          qrUrl: charge.qrUrl,
          expiresAt: DateTime.now().plus({ minutes: QR_LIFETIME_MINUTES }),
        },
        { client: transaction }
      )
    })
  }

  async handlePaymentNotification(notification: ProviderStatus) {
    const payment = await Payment.findBy('provider_order_id', notification.orderId)
    if (!payment) {
      logger.warn({ orderId: notification.orderId }, 'Payment notification for an unknown order')
      return null
    }
    return this.#apply(payment, notification)
  }

  async refreshPayment(payment: Payment) {
    if (!payment.providerOrderId || !this.isQrisAvailable()) {
      return payment
    }
    const status = await this.gateway.fetchTransactionStatus(payment.providerOrderId)
    if (!status) {
      return payment
    }
    return (await this.#apply(payment, status)) ?? payment
  }

  async recordCounterPayment(user: User, order: Order, input: CounterPayment) {
    await order.load('bill')
    this.#assertPayable(order)
    const methods = await Setting.get('payment_methods')
    const isEnabled = input.method === PaymentMethod.CARD ? methods.edc : methods[input.method]
    if (!isEnabled) {
      throw fieldError('method', 'Metode ini sedang dinonaktifkan owner.', 'method.disabled')
    }
    const amount = order.bill.total
    if (input.method === PaymentMethod.CASH && (input.cashReceived ?? 0) < amount) {
      throw fieldError(
        'cashReceived',
        `Uang diterima kurang ${formatRupiah(amount - (input.cashReceived ?? 0))}.`,
        'cash.short'
      )
    }

    const payment = await db.transaction(async (transaction) => {
      const locked = await this.orders.lockOrder(transaction, order.id)
      if (locked.status !== OrderStatus.AWAITING_PAYMENT) {
        throw fieldError('form', 'Pesanan ini sudah dibayar.', 'payment.done')
      }
      await Payment.query({ client: transaction })
        .where('order_id', order.id)
        .where('status', PaymentStatus.PENDING)
        .update({ status: PaymentStatus.CANCELLED })
      const created = await Payment.create(
        {
          orderId: order.id,
          channel: PaymentChannel.COUNTER,
          method: input.method,
          status: PaymentStatus.PAID,
          amount,
          cashReceived: input.method === PaymentMethod.CASH ? (input.cashReceived ?? null) : null,
          reference: input.reference ?? null,
          paidAt: DateTime.now(),
          recordedBy: user.id,
        },
        { client: transaction }
      )
      await this.#settle(locked, created, user, transaction)
      return created
    })
    return payment
  }

  async correctPayment(owner: User, id: number, correction: PaymentCorrection) {
    return db.transaction(async (transaction) => {
      const order = await this.orders.lockOrder(transaction, id)
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
        await ActivityLog.record(
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
      await this.orders.transitionOrder(
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

  async #apply(payment: Payment, notification: ProviderStatus) {
    let status = PROVIDER_STATUS[notification.transactionStatus] ?? PaymentStatus.FAILED
    if (status === PaymentStatus.PAID && notification.fraudStatus === 'challenge') {
      status = PaymentStatus.PENDING
    }
    if (payment.status === PaymentStatus.PAID || payment.status === status) {
      return payment
    }
    if (status === PaymentStatus.PAID && Number(notification.grossAmount) !== payment.amount) {
      logger.error(
        { payment: payment.id, gross: notification.grossAmount, amount: payment.amount },
        'Paid amount does not match the bill'
      )
      payment.merge({ note: `Nominal dari penyedia ${notification.grossAmount} tidak cocok` })
      await payment.save()
      return payment
    }

    const updated = await db.transaction(async (transaction) => {
      payment.useTransaction(transaction)
      payment.merge({
        status,
        providerTransactionId: notification.transactionId ?? payment.providerTransactionId,
        paidAt: status === PaymentStatus.PAID ? DateTime.now() : payment.paidAt,
      })
      await payment.save()
      if (status === PaymentStatus.PAID) {
        const order = await this.orders.lockOrder(transaction, payment.orderId)
        if (order.status === OrderStatus.AWAITING_PAYMENT) {
          await this.#settle(order, payment, null, transaction)
        }
      }
      return payment
    })

    if (status !== PaymentStatus.PAID) {
      const order = await Order.findOrFail(payment.orderId)
      this.orders.broadcastOrder(order)
    }
    return updated
  }

  async #settle(
    order: Order,
    payment: Payment,
    user: User | null,
    transaction: TransactionClientContract
  ) {
    const label = PaymentMethodLabel[payment.method]
    await this.orders.transitionOrder(
      order,
      OrderStatus.IN_CLEANING,
      {
        actor: user,
        note: `Lunas · ${label}`,
        action: ActivityAction.PAYMENT_RECORDED,
        detail: `${label} · ${formatRupiah(payment.amount)}`,
      },
      transaction
    )
  }

  #assertPayable(order: Order) {
    if (order.status !== OrderStatus.AWAITING_PAYMENT || !order.bill) {
      throw fieldError(
        'form',
        order.status === OrderStatus.AWAITING_PAYMENT
          ? 'Tagihan pesanan ini belum dibuat.'
          : 'Pesanan ini tidak menunggu pembayaran.',
        'payment.not_payable'
      )
    }
  }
}
