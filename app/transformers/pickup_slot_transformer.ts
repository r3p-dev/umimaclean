import { BaseTransformer } from '@adonisjs/core/transformers'
import type { PickupSlotSetting } from '#services/setting_service'

export default class PickupSlotTransformer extends BaseTransformer<PickupSlotSetting> {
  toObject() {
    return {
      id: this.resource.id,
      label: this.resource.label,
      capacity: this.resource.capacity,
      isActive: this.resource.isActive,
    }
  }
}
