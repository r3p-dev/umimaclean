import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { ItemKindLabel, OrderSource, OrderStatus } from '#enums/order_enum'
import { ServiceType } from '#enums/service_enum'
import Order from '#models/order'
import OrderPolicy from '#policies/order_policy'
import BillingService from '#services/billing_service'
import TaskService from '#services/task_service'
import InspectionTransformer from '#transformers/inspection_transformer'
import ProcessRowTransformer from '#transformers/process_row_transformer'
import { shortName } from '#transformers/task_transformer'
import WashTransformer from '#transformers/wash_transformer'
import { saveInspectionValidator, washValidator } from '#validators/staff/process'

@inject()
export default class ProcessController {
  constructor(
    protected tasks: TaskService,
    protected billing: BillingService
  ) {}

  async queue({ bouncer, inertia }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const orders = await this.tasks.workshopQueue()
    const waiting = orders.filter(
      (order) =>
        order.status === OrderStatus.AWAITING_PAYMENT && order.source === OrderSource.ONLINE
    )
    const rows = orders
      .filter((order) => !waiting.includes(order))
      .map((order) => new ProcessRowTransformer(order).toObject())

    return inertia.render('staff/process/queue', {
      periksa: rows.filter((row) => ['inspect', 'continue', 'collect'].includes(row.action)),
      cuci: rows.filter((row) => ['open', 'handover'].includes(row.action)),
      waiting: waiting.map((order) => shortName(order.customerName)),
    })
  }

  async inspection({ bouncer, inertia, params }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.tasks.findForWorkshop(params.id)
    const services = await this.billing.activePriceList()
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
      id: Number(params.id),
      number: Order.numberOf(params.id),
      order: order ? new InspectionTransformer(order).toObject() : null,
      catalog,
    })
  }

  async startInspection({ auth, bouncer, params, response }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const id = Number(params.id)
    await this.tasks.startInspection(auth.getUserOrFail(), id)
    return response.redirect().toRoute('staff.inspection', { id })
  }

  async saveInspection({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const id = Number(params.id)
    const payload = await request.validateUsing(saveInspectionValidator)
    const result = await this.billing.createFromInspection(auth.getUserOrFail(), id, payload.items)

    if (result.order.source === OrderSource.STORE) {
      session.flash('success', 'Pemeriksaan disimpan. Lanjutkan pembayaran di kasir.')
      return response.redirect().toRoute('staff.store_payment', { id })
    }
    session.flash('success', 'Tagihan dibuat.')
    return response.redirect().toRoute('staff.inspection', { id })
  }

  async washing({ bouncer, inertia, params }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const order = await this.tasks.findForWorkshop(params.id)
    return inertia.render('staff/process/washing', {
      id: Number(params.id),
      number: Order.numberOf(params.id),
      order: order ? new WashTransformer(order).toObject() : null,
    })
  }

  async completeWash({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const id = Number(params.id)
    const { photo } = await request.validateUsing(washValidator)
    const order = await this.tasks.completeWash(auth.getUserOrFail(), id, photo)
    session.flash(
      'success',
      order.status === OrderStatus.READY_FOR_COLLECTION
        ? 'Pencucian selesai. Pesanan siap diambil di toko.'
        : 'Pencucian selesai. Pesanan masuk antrean Antar.'
    )
    return response.redirect().toRoute('staff.washing', { id })
  }

  async collect({ auth, bouncer, params, response, session }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const id = Number(params.id)
    const order = await this.tasks.collect(auth.getUserOrFail(), id)
    session.flash('success', `Pesanan ${order.number()} sudah diambil pelanggan.`)
    return response.redirect().toRoute('staff.process')
  }
}
