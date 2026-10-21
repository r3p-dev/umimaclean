import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { OrderStatus } from '#enums/order_enum'
import { STAFF_ROLES } from '#enums/role_enum'
import type Order from '#models/order'
import type User from '#models/user'

export default class OrderPolicy extends BasePolicy {
  view(user: User, order: Order): AuthorizerResponse {
    return user.isCustomer() && order.userId === user.id
  }

  work(user: User): AuthorizerResponse {
    return STAFF_ROLES.includes(user.role) && user.isActive
  }

  manage(user: User): AuthorizerResponse {
    return user.isOwner() && user.isActive
  }

  cancel(user: User, order: Order): AuthorizerResponse {
    return this.view(user, order) && order.status === OrderStatus.AWAITING_PICKUP
  }

  pay(user: User, order: Order): AuthorizerResponse {
    return this.view(user, order) && order.status === OrderStatus.AWAITING_PAYMENT
  }

  follow(user: User, order: Order): AuthorizerResponse {
    return this.view(user, order) || this.work(user)
  }
}
