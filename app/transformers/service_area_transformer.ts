import type ServiceArea from '#models/service_area'
import { BaseTransformer } from '@adonisjs/core/transformers'

export type ServiceAreaCity = 'Kota Bandung' | 'Kota Cimahi' | 'Kabupaten Bandung'

export default class ServiceAreaTransformer extends BaseTransformer<ServiceArea> {
  toObject() {
    return {
      id: this.resource.id,
      city: this.resource.city as ServiceAreaCity,
      name: this.resource.name,
      code: this.resource.code,
      isActive: this.resource.isActive,
    }
  }
}
