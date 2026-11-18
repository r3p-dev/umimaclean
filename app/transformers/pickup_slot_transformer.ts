import { BaseTransformer } from '@adonisjs/core/transformers'
import type PickupSlot from '#models/pickup_slot'

export default class PickupSlotTransformer extends BaseTransformer<PickupSlot> {
  toObject() {
    return {
      id: this.resource.id,
      weekday: this.resource.weekday,
      startsAt: this.resource.startsAt,
      endsAt: this.resource.endsAt,
      capacity: this.resource.capacity,
      isActive: this.resource.isActive,
    }
  }
}
