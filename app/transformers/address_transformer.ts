import { BaseTransformer } from '@adonisjs/core/transformers'
import type CustomerAddress from '#models/customer_address'

export default class AddressTransformer extends BaseTransformer<CustomerAddress> {
  toObject() {
    return {
      id: this.resource.id,
      label: this.resource.label,
      recipientName: this.resource.recipientName,
      addressText: this.resource.addressText,
      landmark: this.resource.landmark ?? '',
      point: { lat: this.resource.lat, lng: this.resource.lng },
      isPrimary: this.resource.isPrimary,
    }
  }
}
