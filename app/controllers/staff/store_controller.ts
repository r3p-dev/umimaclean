import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { OrderSource } from '#enums/order_enum'
import { PaymentChannel, PaymentStatus } from '#enums/payment_enum'
import Order from '#models/order'
import User from '#models/user'
import Setting from '#models/setting'
import OrderPolicy from '#policies/order_policy'
import AddressService from '#services/address_service'
import OrderService from '#services/order_service'
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
    protected addresses: AddressService
  ) {}

  async walkIn({ bouncer, inertia, request }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const phone = normalizePhone(String(request.qs().nomor ?? ''))
    const customer = phone ? await User.findCustomerByPhone(phone) : null
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
    return inertia.render('staff/store/walk_in', { lookup: phone ? { phone, match } : null })
  }

  async store({ auth, bouncer, request, response }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const payload = await request.validateUsing(walkInValidator)
    const order = await this.orders.createWalkIn(auth.getUserOrFail(), payload.phone, payload)
    return response.redirect().withQs({ untuk: 'intake', pesanan: order.id }).toRoute('staff.photo')
  }

  async photo({ bouncer, inertia, request }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    return inertia.render('staff/store/photo', {
      kind: String(request.qs().untuk ?? 'intake'),
      id: Number(request.qs().pesanan) || null,
      number: Number(request.qs().pesanan) ? Order.numberOf(Number(request.qs().pesanan)) : '',
    })
  }

  async storePhotos({ auth, bouncer, params, request, response }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.#order(params.id)
    const { photos } = await request.validateUsing(intakePhotosValidator)
    await this.orders.addIntakePhotos(auth.getUserOrFail(), order, photos)
    return response.redirect().toRoute('staff.inspection', { id: order.id })
  }

  async payment({ bouncer, inertia, params }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.#load(params.id)
    const methods = await Setting.get('payment_methods')
    const pending = order ? await this.payments.currentQris(order) : null

    return inertia.render('staff/store/payment', {
      id: Number(params.id),
      number: Order.numberOf(params.id),
      order:
        order && order.source === OrderSource.STORE
          ? {
              ...new ReceiptTransformer(order).toObject(),
              isSaved: !!order.bill,
              isPaid: order.payments.some((payment) => payment.status === PaymentStatus.PAID),
            }
          : null,
      methods,
      isQrisAvailable: this.payments.isQrisAvailable(),
      qris: pending ? qrisOf(pending) : null,
    })
  }

  async recordPayment({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.#order(params.id)
    const payload = await request.validateUsing(counterPaymentValidator)
    if (payload.method === 'card' && !payload.reference) {
      throw fieldError('reference', 'Isi nomor referensi dari struk EDC.', 'reference.required')
    }
    await this.payments.recordCounter(auth.getUserOrFail(), order, payload)
    session.flash('success', 'Pembayaran dicatat. Pesanan masuk Dalam Pencucian.')
    return response.redirect().toRoute('staff.store_payment', { id: order.id })
  }

  async startQris({ bouncer, params, response }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.#order(params.id)
    await this.payments.startQris(order, PaymentChannel.COUNTER)
    return response.redirect().toRoute('staff.store_payment', { id: order.id })
  }

  async checkQris({ bouncer, params, response }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.#order(params.id)
    const pending = await this.payments.currentQris(order)
    if (pending) {
      await this.payments.refresh(pending)
    }
    return response.redirect().toRoute('staff.store_payment', { id: order.id })
  }

  async #order(id: number) {
    const order = await Order.find(id)
    if (!order) {
      throw fieldError('form', 'Pesanan tidak ditemukan.', 'order.missing')
    }
    return order
  }

  #load(id: number) {
    return Order.query()
      .where('id', id)
      .preload('items', (items) => items.orderBy('position', 'asc'))
      .preload('bill', (bill) => bill.preload('lines'))
      .preload('payments')
      .first()
  }
}
