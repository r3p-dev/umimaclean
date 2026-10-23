import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { MessageStatus } from '#enums/message_enum'
import { PaymentChannel, PaymentMethod } from '#enums/payment_enum'
import OrderPolicy from '#policies/order_policy'
import OrderService, { deliveryNote, normalizePublicCode } from '#services/order_service'
import PaymentService from '#services/payment_service'
import AdminOrderDetailTransformer from '#transformers/admin_order_detail_transformer'
import AdminOrderTransformer from '#transformers/admin_order_transformer'
import {
  cancelOrdersValidator,
  correctPaymentValidator,
  moveOrdersValidator,
} from '#validators/admin/order'

const FIX_METHOD = {
  qris_counter: { method: PaymentMethod.QRIS, channel: PaymentChannel.COUNTER },
  cash: { method: PaymentMethod.CASH, channel: PaymentChannel.COUNTER },
  card: { method: PaymentMethod.CARD, channel: PaymentChannel.COUNTER },
  qris_online: { method: PaymentMethod.QRIS, channel: PaymentChannel.ONLINE },
} as const

function noticeSummary(notices: MessageStatus[]) {
  if (!notices.length) {
    return ''
  }
  const sent = notices.filter((status) => status === MessageStatus.SENT).length
  if (sent === notices.length) {
    return ' Pelanggan diberi tahu via WhatsApp.'
  }
  if (notices.every((status) => status === MessageStatus.LOGGED)) {
    return ` ${deliveryNote(MessageStatus.LOGGED)}`
  }
  return ` WhatsApp terkirim ke ${sent} dari ${notices.length} pelanggan.`
}

@inject()
export default class OrdersController {
  constructor(
    protected orders: OrderService,
    protected payments: PaymentService
  ) {}

  async index({ bouncer, inertia }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('manage')
    // shortcut: loads every order for client-side filtering; page on the server past a few thousand orders
    const orders = await this.orders.listForOwner()
    return inertia.render('admin/orders/list', {
      orders: orders.map((order) => new AdminOrderTransformer(order).toObject()),
    })
  }

  async show({ bouncer, inertia, params }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('manage')
    const code = normalizePublicCode(String(params.number))
    const order = code ? await this.orders.detailForOwner(code) : null
    if (!order) {
      return inertia.render('admin/orders/detail', { number: String(params.number), order: null })
    }
    const [logs, history] = await Promise.all([
      this.orders.activityOf(order),
      this.orders.historyOf(order),
    ])
    return inertia.render('admin/orders/detail', {
      number: order.publicCode,
      order: {
        ...new AdminOrderTransformer(order).toObject(),
        detail: new AdminOrderDetailTransformer(order, logs).toObject(),
        history: history.map((entry) => new AdminOrderTransformer(entry).toObject()),
      },
    })
  }

  async move({ auth, bouncer, request, response, session }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('manage')
    const payload = await request.validateUsing(moveOrdersValidator)
    const result = await this.orders.moveToStage(auth.getUserOrFail(), payload.codes, payload.stage)
    session.flash(
      result.changed ? 'success' : 'error',
      `${result.changed} pesanan diubah${result.skipped ? `, ${result.skipped} dilewati karena tidak bisa ke status ini` : ''}. Tercatat di Aktivitas Staf.`
    )
    return response.redirect().back()
  }

  async cancel({ auth, bouncer, request, response, session }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('manage')
    const payload = await request.validateUsing(cancelOrdersValidator)
    const result = await this.orders.cancelByOwner(
      auth.getUserOrFail(),
      payload.codes,
      payload.reason
    )
    session.flash(
      result.cancelled ? 'success' : 'error',
      `${result.cancelled} pesanan dibatalkan${result.skipped ? `, ${result.skipped} dilewati` : ''}.${noticeSummary(result.notices)}`
    )
    return response.redirect().back()
  }

  async correctPayment({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('manage')
    const code = normalizePublicCode(String(params.number)) ?? ''
    const payload = await request.validateUsing(correctPaymentValidator)
    await this.payments.correct(auth.getUserOrFail(), code, {
      ...FIX_METHOD[payload.method],
      amount: payload.amount,
      reason: payload.correctionReason,
    })
    session.flash('success', 'Koreksi pembayaran disimpan dan tercatat di log aktivitas.')
    return response.redirect().back()
  }
}
