import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { OrderStatus } from '#enums/order_enum'
import { STAFF_ROLES } from '#enums/role_enum'
import type Order from '#models/order'
import type User from '#models/user'

export default class OrderPolicy extends BasePolicy {
  own(user: User, order: Order): AuthorizerResponse {
    return user.isCustomer() && order.userId === user.id
  }

  @allowGuest()
  view(user: User | null, order: Order, isUnlocked: boolean): AuthorizerResponse {
    return isUnlocked || (!!user && this.own(user, order))
  }

  work(user: User): AuthorizerResponse {
    return STAFF_ROLES.includes(user.role) && user.isActive
  }

  manage(user: User): AuthorizerResponse {
    return user.isOwner() && user.isActive
  }

  cancel(user: User, order: Order): AuthorizerResponse {
    return this.own(user, order) && order.status === OrderStatus.AWAITING_PICKUP
  }

  pay(user: User, order: Order): AuthorizerResponse {
    return this.own(user, order) && order.status === OrderStatus.AWAITING_PAYMENT
  }

  @allowGuest()
  follow(user: User | null, order: Order, isUnlocked: boolean): AuthorizerResponse {
    return this.view(user, order, isUnlocked) || (!!user && this.work(user))
  }
}
