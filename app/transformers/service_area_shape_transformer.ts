import type ServiceArea from '#models/service_area'
import { BaseTransformer } from '@adonisjs/core/transformers'
import type { ServiceAreaCity } from '#transformers/service_area_transformer'

export type ServiceAreaShape = { type: 'MultiPolygon'; coordinates: number[][][][] }

// A district with its display geometry from AreaService.getAreaShapes (D95), for maps only.
export default class ServiceAreaShapeTransformer extends BaseTransformer<ServiceArea> {
  toObject() {
    const shape: ServiceAreaShape = JSON.parse(this.resource.$extras.shape)
    return {
      id: this.resource.id,
      city: this.resource.city as ServiceAreaCity,
      name: this.resource.name,
      isActive: this.resource.isActive,
      shape,
    }
  }
}
