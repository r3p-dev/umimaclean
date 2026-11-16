import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PriceListService from '#services/price_list_service'
import ServiceTransformer from '#transformers/service_transformer'
import {
  bulkToggleServiceValidator,
  createServiceValidator,
  toggleServiceValidator,
  updateServiceValidator,
} from '#validators/service_validator'

@inject()
export default class ServicesController {
  constructor(protected priceListService: PriceListService) {}

  async index({ inertia }: HttpContext) {
    const services = await this.priceListService.getOwnerServices()
    return inertia.render('admin/services', { services: ServiceTransformer.transform(services) })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(createServiceValidator)
    await this.priceListService.createService(payload, auth.getUserOrFail())

    session.flash('success', 'Layanan berhasil ditambahkan.')
    return response.redirect().toRoute('admin.services.index')
  }

  async update({ auth, params, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(updateServiceValidator)
    const id = Number(params.id)
    await this.priceListService.updateService(id, payload, auth.getUserOrFail())

    session.flash('success', 'Layanan berhasil diperbarui.')
    return response.redirect().toRoute('admin.services.index')
  }

  async toggleActive({ auth, params, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(toggleServiceValidator)
    const id = Number(params.id)
    await this.priceListService.toggleServiceActive(id, payload.isActive, auth.getUserOrFail())

    session.flash(
      'success',
      payload.isActive ? 'Layanan berhasil diaktifkan.' : 'Layanan berhasil dinonaktifkan.'
    )
    return response.redirect().toRoute('admin.services.index')
  }

  async bulkToggleActive({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(bulkToggleServiceValidator)
    await this.priceListService.bulkToggleServices(
      payload.ids,
      payload.isActive,
      auth.getUserOrFail()
    )

    session.flash(
      'success',
      `${payload.ids.length} layanan berhasil ${payload.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`
    )
    return response.redirect().toRoute('admin.services.index')
  }

  async destroy({ auth, params, response, session }: HttpContext) {
    const id = Number(params.id)
    await this.priceListService.softDeleteService(id, auth.getUserOrFail())

    session.flash('success', 'Layanan berhasil dihapus.')
    return response.redirect().toRoute('admin.services.index')
  }
}
