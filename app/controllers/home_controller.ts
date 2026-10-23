import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { ItemKindLabel } from '#enums/order_enum'
import { ServiceType } from '#enums/service_enum'
import ServiceArea from '#models/service_area'
import BillingService from '#services/billing_service'
import ServiceAreaTransformer from '#transformers/service_area_transformer'

@inject()
export default class HomeController {
  constructor(protected billing: BillingService) {}

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

    const areas = await ServiceArea.summary()
    return inertia.render('home', {
      prices,
      areas: areas.map((area) => new ServiceAreaTransformer(area).toObject()),
    })
  }
}
