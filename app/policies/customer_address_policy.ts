import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import type CustomerAddress from '#models/customer_address'
import type User from '#models/user'

export default class CustomerAddressPolicy extends BasePolicy {
  manage(user: User, address: CustomerAddress): AuthorizerResponse {
    return user.isCustomer() && address.userId === user.id && address.deletedAt === null
  }
}
