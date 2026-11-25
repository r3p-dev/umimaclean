import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '#enums/role_enum'
import PriceListService from '#services/price_list_service'
import ServiceTransformer from '#transformers/service_transformer'

const HOME_BY_ROLE = {
  [Role.CUSTOMER]: 'customer.home',
  [Role.STAFF]: 'staff.home',
  [Role.ADMIN]: 'admin.home',
} as const satisfies Record<Role, 'customer.home' | 'staff.home' | 'admin.home'>

@inject()
export default class HomeController {
  constructor(protected priceListService: PriceListService) {}

  async index({ auth, inertia, response }: HttpContext) {
    if (auth.user) {
      return response.redirect().toRoute(HOME_BY_ROLE[auth.user.role])
    }

    const services = await this.priceListService.getActiveServices()
    return inertia.render('home', { services: ServiceTransformer.transform(services) })
  }
}
