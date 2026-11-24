import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AreaService from '#services/area_service'
import { checkPointValidator } from '#validators/address_validator'
import { checkAreaNameValidator } from '#validators/area_validator'

// JSON endpoints, not Inertia visits: the page asks them without leaving it (D94, D100, D109).
@inject()
export default class AreaCheckController {
  constructor(protected areaService: AreaService) {}

  async show({ request }: HttpContext) {
    const { q } = await request.validateUsing(checkAreaNameValidator)
    const area = await this.areaService.findAreaByName(q)

    return {
      area: area ? { name: area.name, city: area.city, isCovered: area.isActive } : null,
    }
  }

  // A map pin that stopped moving (AREA-4); saving checks it again.
  async showPoint({ request }: HttpContext) {
    const { lat, lng } = await request.validateUsing(checkPointValidator)
    const { isCovered, district } = await this.areaService.checkCoverage(lat, lng)

    return {
      isCovered,
      district: district ? { name: district.name, city: district.city } : null,
    }
  }
}
