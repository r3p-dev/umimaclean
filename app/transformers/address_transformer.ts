import { BaseTransformer } from '@adonisjs/core/transformers'
import type CustomerAddress from '#models/customer_address'

export default class AddressTransformer extends BaseTransformer<CustomerAddress> {
  toObject() {
    // Only queries with the `withCoverage` scope know it; elsewhere it is null (D82).
    const isCovered: boolean | undefined = this.resource.$extras.is_covered
    return {
      ...this.pick(this.resource, [
        'id',
        'label',
        'recipientName',
        'recipientPhone',
        'addressText',
        'details',
        'lat',
        'lng',
        'street',
        'kelurahan',
        'kecamatan',
        'city',
        'isPrimary',
      ]),
      isCovered: isCovered ?? null,
    }
  }
}
