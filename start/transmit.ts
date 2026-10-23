import transmit from '@adonisjs/transmit/services/main'
import { enterAdminArea, enterStaffArea } from '#abilities/main'
import Order from '#models/order'
import OrderPolicy from '#policies/order_policy'
import { ADMIN_ORDERS_CHANNEL, STAFF_QUEUES_CHANNEL } from '#services/order_service'

transmit.registerRoutes()

transmit.authorize<{ code: string }>('orders/:code', async ({ bouncer }, { code }) => {
  const order = await Order.findBy('public_code', code)
  return !!order && (await bouncer.with(OrderPolicy).allows('follow', order))
})

transmit.authorize(STAFF_QUEUES_CHANNEL, ({ bouncer }) => bouncer.allows(enterStaffArea))

transmit.authorize(ADMIN_ORDERS_CHANNEL, ({ bouncer }) => bouncer.allows(enterAdminArea))
