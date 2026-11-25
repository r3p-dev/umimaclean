import { BasePolicy } from '@adonisjs/bouncer'
import type Order from '#models/order'
import type User from '#models/user'

export default class OrderPolicy extends BasePolicy {
  view(user: User, order: Order) {
    return order.userId === user.id
  }

  cancel(user: User, order: Order) {
    return order.userId === user.id
  }
}
