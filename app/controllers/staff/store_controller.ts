import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { OrderSource } from '#enums/order_enum'
import { PaymentChannel, PaymentStatus } from '#enums/payment_enum'
import Order from '#models/order'
import Setting from '#models/setting'
import OrderPolicy from '#policies/order_policy'
import AddressService from '#services/address_service'
import AreaService from '#services/area_service'
import OrderService, { deliveryNote, normalizePublicCode } from '#services/order_service'
import PaymentService from '#services/payment_service'
import { maskPhone, normalizePhone } from '#helpers/phone'
import { qrisOf } from '#transformers/order_transformer'
import ReceiptTransformer from '#transformers/receipt_transformer'
import {
  counterPaymentValidator,
  intakePhotosValidator,
  walkInValidator,
} from '#validators/staff/store'
import { fieldError } from '#validators/shared/field_error'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

@inject()
export default class StoreController {
  constructor(
    protected orders: OrderService,
    protected payments: PaymentService,
    protected addresses: AddressService,
    protected area: AreaService
  ) {}

  async walkIn({ bouncer, inertia, request }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const phone = normalizePhone(String(request.qs().nomor ?? ''))
    const customer = phone ? await this.orders.customerByPhone(phone) : null
    let match = null
    if (customer) {
      const [address, orders] = await Promise.all([
        this.addresses.primary(customer),
        Order.query().where('user_id', customer.id).orderBy('created_at', 'desc'),
      ])
      const last = orders[0]?.createdAt.setZone(SERVICE_ZONE).setLocale('id').toFormat('d LLL')
      match = {
        phone: phone!,
        name: customer.name,
        initial: customer.name[0] ?? '',
        masked: maskPhone(customer.phone),
        history: orders.length
          ? `${orders.length} pesanan · terakhir ${last}`
          : 'Belum ada pesanan',
        area: address
          ? `sekitar ${address.addressText.split(',').slice(-3, -1).join(',').trim()}`
          : null,
        address: address?.addressText ?? null,
        point: address ? { lat: address.lat, lng: address.lng } : null,
      }
    }
    return inertia.render('staff/store/walk_in', {
      lookup: phone ? { phone, match } : null,
      coverage: await this.area.coverage(),
    })
  }

  async store({ auth, bouncer, request, response }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const payload = await request.validateUsing(walkInValidator)
    const order = await this.orders.createWalkIn(auth.getUserOrFail(), payload.phone, payload)
    return response
      .redirect()
      .withQs({ untuk: 'intake', pesanan: order.publicCode })
      .toRoute('staff.photo')
  }

  async photo({ bouncer, inertia, request }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    return inertia.render('staff/store/photo', {
      kind: String(request.qs().untuk ?? 'intake'),
      number: normalizePublicCode(String(request.qs().pesanan ?? '')) ?? '',
    })
  }

  async storePhotos({ auth, bouncer, params, request, response }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.#order(params.number)
    const { photos } = await request.validateUsing(intakePhotosValidator)
    await this.orders.addIntakePhotos(auth.getUserOrFail(), order, photos)
    return response.redirect().toRoute('staff.inspection', { number: order.publicCode })
  }

  async payment({ bouncer, inertia, params }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const code = normalizePublicCode(String(params.number))
    const order = code ? await this.#load(code) : null
    const methods = await Setting.get('payment_methods')
    const pending = order ? await this.payments.currentQris(order) : null

    return inertia.render('staff/store/payment', {
      number: String(params.number),
      order:
        order && order.source === OrderSource.STORE
          ? {
              ...new ReceiptTransformer(order).toObject(),
              isSaved: !!order.bill,
              isPaid: order.payments.some((payment) => payment.status === PaymentStatus.PAID),
              hasPhone: !!order.customerPhone,
            }
          : null,
      methods,
      isQrisAvailable: this.payments.isQrisAvailable(),
      qris: pending ? qrisOf(pending) : null,
    })
  }

  async recordPayment({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.#order(params.number)
    const payload = await request.validateUsing(counterPaymentValidator)
    if (payload.method === 'card' && !payload.reference) {
      throw fieldError('reference', 'Isi nomor referensi dari struk EDC.', 'reference.required')
    }
    await this.payments.recordCounter(auth.getUserOrFail(), order, payload)
    session.flash('success', 'Pembayaran dicatat. Pesanan masuk Dalam Pencucian.')
    return response.redirect().toRoute('staff.store_payment', { number: order.publicCode })
  }

  async startQris({ bouncer, params, response }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.#order(params.number)
    await this.payments.startQris(order, PaymentChannel.COUNTER)
    return response.redirect().toRoute('staff.store_payment', { number: order.publicCode })
  }

  async checkQris({ bouncer, params, response }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.#order(params.number)
    const pending = await this.payments.currentQris(order)
    if (pending) {
      await this.payments.refresh(pending)
    }
    return response.redirect().toRoute('staff.store_payment', { number: order.publicCode })
  }

  async sendReceipt({ auth, bouncer, params, response, session }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.#load(this.#code(params.number))
    if (!order) {
      throw fieldError('form', 'Pesanan tidak ditemukan.', 'order.missing')
    }
    const status = await this.orders.sendReceipt(
      auth.getUserOrFail(),
      order,
      new ReceiptTransformer(order).toText()
    )
    session.flash(status === 'failed' ? 'error' : 'success', deliveryNote(status))
    return response.redirect().toRoute('staff.store_payment', { number: order.publicCode })
  }

  #code(number: unknown) {
    const code = normalizePublicCode(String(number))
    if (!code) {
      throw fieldError('form', 'Pesanan tidak ditemukan.', 'order.missing')
    }
    return code
  }

  async #order(number: unknown) {
    const order = await Order.findBy('public_code', this.#code(number))
    if (!order) {
      throw fieldError('form', 'Pesanan tidak ditemukan.', 'order.missing')
    }
    return order
  }

  #load(code: string) {
    return Order.query()
      .where('public_code', code)
      .preload('items', (items) => items.orderBy('position', 'asc'))
      .preload('bill', (bill) => bill.preload('lines'))
      .preload('payments')
      .first()
  }
}
