import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import OrderPolicy from '#policies/order_policy'
import Setting from '#models/setting'
import OrderService, {
  normalizePublicCode,
  orderFilterOf,
  orderSearchTerm,
} from '#services/order_service'
import OrderTransformer, { qrisOf } from '#transformers/order_transformer'
import PaymentService from '#services/payment_service'
import ReceiptTransformer from '#transformers/receipt_transformer'
import { cancelOrderValidator } from '#validators/customer/cancel'
import { OrderStatus } from '#enums/order_enum'
import { PaymentChannel } from '#enums/payment_enum'

@inject()
export default class OrdersController {
  constructor(
    protected orders: OrderService,
    protected payments: PaymentService
  ) {}

  async index({ inertia, auth, request }: HttpContext) {
    const { status, q: query, page } = request.qs()
    const filter = orderFilterOf(status)
    const search = orderSearchTerm(query)

    const result = await this.orders.listForCustomer(auth.getUserOrFail(), {
      filter,
      search,
      page: Math.max(1, Number(page) || 1),
    })

    return inertia.render('customer/orders/index', {
      orders: result.orders.map((order) => new OrderTransformer(order).toObject()),
      meta: result.meta,
      filter,
      search,
      counts: result.counts,
    })
  }

  async show({ bouncer, inertia, params }: HttpContext) {
    const order = await this.#owned(bouncer, params.code)

    return inertia.render('customer/orders/show', {
      order: new OrderTransformer(order).toObject(),
    })
  }

  async bill({ bouncer, inertia, params }: HttpContext) {
    const order = await this.#owned(bouncer, params.code)

    return inertia.render('customer/payment/bill', {
      number: order.publicCode,
      order: new OrderTransformer(order).toObject(),
    })
  }

  async pay({ bouncer, inertia, params }: HttpContext) {
    const order = await this.#owned(bouncer, params.code)
    const payment = await this.payments.currentQris(order)

    return inertia.render('customer/payment/qris', {
      number: order.publicCode,
      order: new OrderTransformer(order).toObject(),
      qris: payment ? qrisOf(payment) : null,
      isAvailable: this.payments.isQrisAvailable(),
    })
  }

  async cancel({ auth, bouncer, params, request, response, session }: HttpContext) {
    const order = await this.#owned(bouncer, params.code)
    await bouncer.with(OrderPolicy).authorize('cancel', order)
    const { reason } = await request.validateUsing(cancelOrderValidator)
    await this.orders.cancelByCustomer(auth.getUserOrFail(), order, reason)
    session.flash('success', 'Pesanan dibatalkan. Toko sudah diberi tahu.')
    return response.redirect().toRoute('customer.orders.show', { code: order.publicCode })
  }

  async receipt({ bouncer, inertia, params, response }: HttpContext) {
    const order = await this.#owned(bouncer, params.code)
    if (order.status !== OrderStatus.COMPLETED) {
      return response.redirect().toRoute('customer.orders.show', { code: order.publicCode })
    }
    return inertia.render('customer/orders/receipt', {
      receipt: new ReceiptTransformer(order).toObject(),
      store: await Setting.get('store'),
    })
  }

  async startPayment({ bouncer, params, response }: HttpContext) {
    const order = await this.#owned(bouncer, params.code)
    await bouncer.with(OrderPolicy).authorize('pay', order)
    await this.payments.startQris(order, PaymentChannel.ONLINE)
    return response.redirect().toRoute('customer.orders.pay', { code: order.publicCode })
  }

  async checkPayment({ bouncer, params, response }: HttpContext) {
    const order = await this.#owned(bouncer, params.code)
    const payment = await this.payments.currentQris(order)
    if (payment) {
      await this.payments.refresh(payment)
    }
    return response.redirect().toRoute('customer.orders.pay', { code: order.publicCode })
  }

  async #owned(bouncer: HttpContext['bouncer'], code: unknown) {
    const publicCode = normalizePublicCode(String(code))

    const order = publicCode ? await this.orders.findByCode(publicCode) : null
    if (!order || !(await bouncer.with(OrderPolicy).allows('view', order))) {
      throw new Exception('Pesanan tidak ditemukan', { status: 404 })
    }

    return order
  }
}
