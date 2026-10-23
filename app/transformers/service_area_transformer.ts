import { BaseTransformer } from '@adonisjs/core/transformers'
import type ServiceArea from '#models/service_area'

export default class ServiceAreaTransformer extends BaseTransformer<ServiceArea> {
  toObject() {
    const area = this.resource
    return { id: area.id, city: area.city, name: area.name, isActive: area.isActive }
  }
}
