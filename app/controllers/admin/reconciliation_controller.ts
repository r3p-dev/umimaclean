import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { enterAdminArea } from '#abilities/main'
import { OrderStatus, OrderStatusLabel } from '#enums/order_enum'
import { PaymentChannelLabel, PaymentStatus, PaymentStatusLabel } from '#enums/payment_enum'
import Payment from '#models/payment'
import PaymentService from '#services/payment/payment_service'
import { formatEvent } from '#transformers/order_transformer'

type Flag = 'ok' | 'paid_not_advanced' | 'expired_pending' | 'amount_mismatch' | 'waiting'

@inject()
export default class ReconciliationController {
  constructor(protected payments: PaymentService) {}

  async index({ inertia }: HttpContext) {
    // shortcut: shows the latest 300 QRIS charges; add date paging when volume grows
    const rows = await Payment.query()
      .whereNotNull('provider_order_id')
      .preload('order', (order) => order.preload('bill'))
      .orderBy('id', 'desc')
      .limit(300)
    const now = DateTime.now()

    return inertia.render('admin/reconciliation', {
      isAvailable: this.payments.isQrisAvailable(),
      rows: rows.map((payment) => {
        const order = payment.order
        const billTotal = order.bill?.total ?? null
        let flag: Flag = 'ok'
        if (
          payment.status === PaymentStatus.PAID &&
          order.status === OrderStatus.AWAITING_PAYMENT
        ) {
          flag = 'paid_not_advanced'
        } else if (
          (billTotal !== null && payment.amount !== billTotal) ||
          (payment.note ?? '').includes('tidak cocok')
        ) {
          flag = 'amount_mismatch'
        } else if (payment.status === PaymentStatus.PENDING) {
          flag = payment.expiresAt && payment.expiresAt < now ? 'expired_pending' : 'waiting'
        }
        return {
          id: payment.id,
          providerOrderId: payment.providerOrderId!,
          transactionId: payment.providerTransactionId,
          code: order.publicCode,
          customer: order.customerName,
          channel: PaymentChannelLabel[payment.channel],
          amount: payment.amount,
          billTotal,
          status: PaymentStatusLabel[payment.status],
          orderStatus: OrderStatusLabel[order.status],
          createdAt: formatEvent(payment.createdAt),
          paidAt: payment.paidAt ? formatEvent(payment.paidAt) : null,
          note: payment.note,
          flag,
        }
      }),
    })
  }

  async refresh({ bouncer, params, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const payment = await Payment.findOrFail(params.id)
    if (!this.payments.isQrisAvailable()) {
      session.flash('error', 'Midtrans belum dikonfigurasi, status tidak bisa dicek.')
      return response.redirect().toRoute('admin.reconciliation')
    }
    const updated = await this.payments.refresh(payment)
    session.flash(
      'success',
      `Status ${updated.providerOrderId}: ${PaymentStatusLabel[updated.status]}.`
    )
    return response.redirect().toRoute('admin.reconciliation')
  }
}
