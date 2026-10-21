import { BaseTransformer } from '@adonisjs/core/transformers'
import { ItemKindLabel } from '#enums/order_enum'
import { ServiceType } from '#enums/service_enum'
import type Service from '#models/service'

export default class ServiceTransformer extends BaseTransformer<Service> {
  toObject() {
    const service = this.resource
    return {
      id: String(service.id),
      label: service.name,
      name: service.name,
      type: service.type === ServiceType.MAIN ? ('utama' as const) : ('tambahan' as const),
      categories: service.categories.map((kind) => ItemKindLabel[kind]),
      price: service.price,
      isStartingPrice: service.isStartingPrice,
      days: service.days,
      description: service.description || '—',
      active: service.isActive,
    }
  }
}
