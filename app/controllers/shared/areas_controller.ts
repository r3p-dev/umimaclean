import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AreaService from '#services/area_service'
import { checkAreaValidator } from '#validators/shared/area'

@inject()
export default class AreasController {
  constructor(protected area: AreaService) {}

  async show({ request }: HttpContext) {
    const point = await request.validateUsing(checkAreaValidator, { data: request.qs() })
    return this.area.checkAreaCoverage(point)
  }
}
