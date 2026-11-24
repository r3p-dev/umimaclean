import { scope } from '@adonisjs/lucid/orm'
import { CustomerAddressSchema } from '#database/schema'

export const MAX_ADDRESSES = 3

export default class CustomerAddress extends CustomerAddressSchema {
  static primaryFirst = scope((query) => {
    query.orderBy('is_primary', 'desc').orderBy('id', 'desc')
  })

  // Whether the pin lies in an active district today: a district turned off after the address was
  // saved leaves it outside (D82). Read it from `$extras.is_covered`.
  static withCoverage = scope((query) => {
    query.select('customer_addresses.*').select(
      query.client.raw(
        `EXISTS (SELECT 1 FROM service_areas WHERE is_active
             AND ST_Intersects(boundary, ST_SetSRID(ST_MakePoint(customer_addresses.lng, customer_addresses.lat), 4326))
           ) AS is_covered`
      )
    )
  })
}
