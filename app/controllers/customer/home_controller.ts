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
    protected addresses: AddressService,
    protected orders: OrderService
  ) {}

  async show({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const [orders, addresses] = await Promise.all([
      this.orders.customerHomeOrders(user),
      this.addresses.listAddresses(user),
    ])
    const profile = new UserTransformer(user).toObject()
    const primary = addresses.find((address) => address.isPrimary) ?? addresses[0]
    const primaryAddress = primary ? new AddressTransformer(primary).toObject() : null

    if (!orders) {
      return inertia.render('customer/home/welcome', { user: profile, primaryAddress })
    }

    const { active, completed } = orders
    return inertia.render('customer/home/index', {
      user: profile,
      primaryAddress,
      addressLabels: addresses.map((address) => address.label),
      activeOrder: active ? new OrderTransformer(active).toObject() : null,
      recentOrders: completed.map((order) => new OrderTransformer(order).toObject()),
    })
  }
}
