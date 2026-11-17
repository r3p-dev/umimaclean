import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AreaService from '#services/area_service'
import ServiceAreaTransformer from '#transformers/service_area_transformer'
import ServiceAreaShapeTransformer from '#transformers/service_area_shape_transformer'
import { mapTiles } from '#helpers/map'

@inject()
export default class ServiceAreasController {
  constructor(protected areaService: AreaService) {}

  async index({ inertia }: HttpContext) {
    const areas = await this.areaService.getAllAreas()
    const transformed = ServiceAreaTransformer.transform(areas)

    return inertia.render('admin/settings/areas', {
      areas: transformed,
      shapes: ServiceAreaShapeTransformer.transform(await this.areaService.getAreaShapes()),
      ...mapTiles(),
    })
  }

  async toggleActive({ params, request, response, auth, session }: HttpContext) {
    const actor = auth.user!
    const updated = await this.areaService.toggleArea(
      Number(params.id),
      actor,
      request.input('isActive')
    )

    session.flash(
      'success',
      `Area "${updated.name}" (${updated.city}) berhasil ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`
    )

    return response.redirect().back()
  }
}
