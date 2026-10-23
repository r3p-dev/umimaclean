import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AddressService from '#services/address_service'
import OrderService from '#services/order_service'
import AddressTransformer from '#transformers/address_transformer'
import OrderTransformer from '#transformers/order_transformer'
import UserTransformer from '#transformers/user_transformer'

@inject()
export default class HomeController {
  constructor(
    protected orders: OrderService,
    protected addresses: AddressService
  ) {}

  async show({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const [hasOrders, addresses] = await Promise.all([
      this.orders.hasOrders(user),
      this.addresses.list(user),
    ])
    const profile = new UserTransformer(user).toObject()
    const primary = addresses.find((address) => address.isPrimary) ?? addresses[0]
    const primaryAddress = primary ? new AddressTransformer(primary).toObject() : null

    if (!hasOrders) {
      return inertia.render('customer/home/welcome', { user: profile, primaryAddress })
    }

    const [active, completed] = await Promise.all([
      this.orders.latestActive(user),
      this.orders.recentCompleted(user),
    ])
    return inertia.render('customer/home/index', {
      user: profile,
      primaryAddress,
      addressLabels: addresses.map((address) => address.label),
      activeOrder: active ? new OrderTransformer(active).toObject() : null,
      recentOrders: completed.map((order) => new OrderTransformer(order).toObject()),
    })
  }
}
