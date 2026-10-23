import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { ItemKindLabel } from '#enums/order_enum'
import { ServiceType } from '#enums/service_enum'
import BillingService from '#services/billing_service'
import ServiceAreaService from '#services/service_area_service'

@inject()
export default class HomeController {
  constructor(
    protected billing: BillingService,
    protected area: ServiceAreaService
  ) {}

  async show({ inertia }: HttpContext) {
    const services = await this.billing.activePriceList()
    const prices = Object.entries(ItemKindLabel).map(([kind, label]) => {
      const matching = services.filter((service) =>
        service.categories.includes(kind as keyof typeof ItemKindLabel)
      )
      const entry = (type: ServiceType) =>
        matching
          .filter((service) => service.type === type)
          .map((service) => ({
            name: service.name,
            price: service.price,
            isStartingPrice: service.isStartingPrice,
            description: service.description,
          }))
      return { label, main: entry(ServiceType.MAIN), addons: entry(ServiceType.ADDON) }
    })

    return inertia.render('home', { prices, coverage: await this.area.coverage() })
  }
}
