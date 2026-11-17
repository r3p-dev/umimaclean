import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AreaService from '#services/area_service'
import { checkAreaNameValidator } from '#validators/area_validator'

// A JSON endpoint, not an Inertia visit: the landing check asks it without leaving the page (D94, D100).
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
}
