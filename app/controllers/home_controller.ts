import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PriceListService from '#services/price_list_service'
import AreaService from '#services/area_service'
import ServiceAreaShapeTransformer from '#transformers/service_area_shape_transformer'
import { mapTilesUrl } from '#helpers/map'
import ServiceTransformer from '#transformers/service_transformer'

@inject()
export default class HomeController {
  constructor(
    protected priceListService: PriceListService,
    protected areaService: AreaService
  ) {}

  async index({ inertia }: HttpContext) {
    const services = await this.priceListService.getActiveServices()
    return inertia.render('home', {
      services: ServiceTransformer.transform(services),
      // Loaded by the coverage map only when its section comes near the screen (NFR-3, D95).
      areaShapes: inertia.optional(async () =>
        ServiceAreaShapeTransformer.transform(await this.areaService.getAreaShapes())
      ),
      tilesUrl: mapTilesUrl(),
    })
  }
}
