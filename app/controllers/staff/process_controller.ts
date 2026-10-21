import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { ItemKindLabel, OrderSource, OrderStatus } from '#enums/order_enum'
import { ServiceType } from '#enums/service_enum'
import OrderPolicy from '#policies/order_policy'
import CatalogService from '#services/catalog_service'
import { deliveryNote } from '#services/notification_service'
import { normalizePublicCode } from '#services/order/public_code_service'
import WorkshopService from '#services/order/workshop_service'
import InspectionTransformer from '#transformers/inspection_transformer'
import ProcessRowTransformer from '#transformers/process_row_transformer'
import { shortName } from '#transformers/task_transformer'
import WashTransformer from '#transformers/wash_transformer'
import { saveInspectionValidator, washValidator } from '#validators/staff/process'
import { fieldError } from '#validators/shared/field_error'

@inject()
export default class ProcessController {
  constructor(
    protected workshop: WorkshopService,
    protected catalog: CatalogService
  ) {}

  async queue({ auth, bouncer, inertia }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const user = auth.getUserOrFail()
    const orders = await this.workshop.queue()
    const waiting = orders.filter(
      (order) =>
        order.status === OrderStatus.AWAITING_PAYMENT && order.source === OrderSource.ONLINE
    )
    const rows = orders
      .filter((order) => !waiting.includes(order))
      .map((order) => new ProcessRowTransformer(order, user).toObject())

    return inertia.render('staff/process/queue', {
      periksa: rows.filter((row) =>
        ['inspect', 'continue', 'locked', 'collect'].includes(row.action)
      ),
      cuci: rows.filter((row) => ['open', 'handover'].includes(row.action)),
      waiting: waiting.map((order) => shortName(order.customerName)),
    })
  }

  async inspection({ auth, bouncer, inertia, params }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.#find(params.number)
    const services = await this.catalog.active()
    const catalog = Object.fromEntries(
      Object.entries(ItemKindLabel).map(([kind, label]) => {
        const matching = services.filter((service) =>
          service.categories.includes(kind as keyof typeof ItemKindLabel)
        )
        const option = (type: ServiceType) =>
          matching
            .filter((service) => service.type === type)
            .map((service) => ({ id: service.id, name: service.name, price: service.price }))
        return [label, { base: option(ServiceType.MAIN), adds: option(ServiceType.ADDON) }]
      })
    )

    return inertia.render('staff/process/inspection', {
      number: String(params.number),
      order: order ? new InspectionTransformer(order, auth.getUserOrFail()).toObject() : null,
      catalog,
    })
  }

  async startInspection({ auth, bouncer, params, response }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const code = this.#code(params.number)
    await this.workshop.startInspection(auth.getUserOrFail(), code)
    return response.redirect().toRoute('staff.inspection', { number: code })
  }

  async saveInspection({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const code = this.#code(params.number)
    const payload = await request.validateUsing(saveInspectionValidator)
    const result = await this.workshop.saveInspection(auth.getUserOrFail(), code, payload.items)

    if (result.order.source === OrderSource.STORE) {
      session.flash('success', 'Pemeriksaan disimpan. Lanjutkan pembayaran di kasir.')
      return response.redirect().toRoute('staff.store_payment', { number: code })
    }
    session.flash('success', `Tagihan dibuat. ${deliveryNote(result.notice!)}`)
    return response.redirect().toRoute('staff.inspection', { number: code })
  }

  async washing({ bouncer, inertia, params }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.#find(params.number)
    return inertia.render('staff/process/washing', {
      number: String(params.number),
      order: order ? new WashTransformer(order).toObject() : null,
    })
  }

  async completeWash({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const code = this.#code(params.number)
    const { photo } = await request.validateUsing(washValidator)
    const result = await this.workshop.completeWash(auth.getUserOrFail(), code, photo)
    session.flash(
      'success',
      result.notice
        ? `Pencucian selesai. ${deliveryNote(result.notice)}`
        : 'Pencucian selesai. Pesanan masuk antrean Antar.'
    )
    return response.redirect().toRoute('staff.washing', { number: code })
  }

  async collect({ auth, bouncer, params, response, session }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const code = this.#code(params.number)
    await this.workshop.collect(auth.getUserOrFail(), code)
    session.flash('success', `Pesanan ${code} sudah diambil pelanggan.`)
    return response.redirect().toRoute('staff.process')
  }

  async #find(number: unknown) {
    const code = normalizePublicCode(String(number))
    return code ? this.workshop.find(code) : null
  }

  #code(number: unknown) {
    const code = normalizePublicCode(String(number))
    if (!code) {
      throw fieldError('form', 'Pesanan tidak ditemukan.', 'order.missing')
    }
    return code
  }
}
