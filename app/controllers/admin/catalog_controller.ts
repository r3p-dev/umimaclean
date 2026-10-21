import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { enterAdminArea } from '#abilities/main'
import CatalogService from '#services/catalog_service'
import ServiceTransformer from '#transformers/service_transformer'
import {
  deleteServicesValidator,
  saveServiceValidator,
  toggleServicesValidator,
} from '#validators/admin/service'

@inject()
export default class CatalogController {
  constructor(protected catalog: CatalogService) {}

  async index({ inertia }: HttpContext) {
    const services = await this.catalog.list()
    return inertia.render('admin/services', {
      services: services.map((service) => new ServiceTransformer(service).toObject()),
    })
  }

  async store({ auth, bouncer, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const payload = await request.validateUsing(saveServiceValidator)
    const service = await this.catalog.save(auth.getUserOrFail(), payload, null)
    session.flash('success', `${service.name} ditambahkan. Berlaku untuk pemeriksaan berikutnya.`)
    return response.redirect().toRoute('admin.services')
  }

  async update({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const payload = await request.validateUsing(saveServiceValidator)
    await this.catalog.save(auth.getUserOrFail(), payload, Number(params.id))
    session.flash('success', 'Perubahan disimpan. Berlaku untuk pemeriksaan berikutnya.')
    return response.redirect().toRoute('admin.services')
  }

  async toggle({ auth, bouncer, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const { ids, active } = await request.validateUsing(toggleServicesValidator)
    const count = await this.catalog.setActive(auth.getUserOrFail(), ids, active)
    session.flash(
      'success',
      `${count} layanan ${active ? 'diaktifkan' : 'dinonaktifkan. Tidak tampil di pilihan staf'}.`
    )
    return response.redirect().toRoute('admin.services')
  }

  async destroy({ auth, bouncer, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const { ids } = await request.validateUsing(deleteServicesValidator)
    const count = await this.catalog.remove(auth.getUserOrFail(), ids)
    session.flash('success', `${count} layanan dihapus. Tagihan lama tetap menyimpan namanya.`)
    return response.redirect().toRoute('admin.services')
  }
}
