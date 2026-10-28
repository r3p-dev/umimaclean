import { BaseTransformer } from '@adonisjs/core/transformers'
import { nationalNumber } from '#helpers/phone'
import type CustomerAddress from '#models/customer_address'

export default class AddressTransformer extends BaseTransformer<CustomerAddress> {
  toObject() {
    return {
      id: this.resource.id,
      label: this.resource.label,
      recipientName: this.resource.recipientName,
      recipientPhone: nationalNumber(this.resource.recipientPhone),
      addressText: this.resource.addressText,
      landmark: this.resource.landmark ?? '',
      point: { lat: this.resource.lat, lng: this.resource.lng },
      isPrimary: this.resource.isPrimary,
    }
  }
}
