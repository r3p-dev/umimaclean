import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PriceListService from '#services/price_list_service'
import ServiceTransformer from '#transformers/service_transformer'

@inject()
export default class HomeController {
  constructor(protected priceListService: PriceListService) {}

  async index({ inertia }: HttpContext) {
    const services = await this.priceListService.getActiveServices()
    return inertia.render('home', { services: ServiceTransformer.transform(services) })
  }
}
