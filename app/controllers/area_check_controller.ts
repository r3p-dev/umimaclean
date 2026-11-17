import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AreaService from '#services/area_service'
import { checkCoverageValidator } from '#validators/area_validator'

// A JSON endpoint, not an Inertia visit: the landing map asks it each time the pin stops (D94).
@inject()
export default class AreaCheckController {
  constructor(protected areaService: AreaService) {}

  async show({ request }: HttpContext) {
    const { lat, lng } = await request.validateUsing(checkCoverageValidator)
    const { isCovered, district } = await this.areaService.checkCoverage(lat, lng)

    return {
      isCovered,
      district: district ? { name: district.name, city: district.city } : null,
    }
  }
}
