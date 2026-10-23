import app from '@adonisjs/core/services/app'
import transmit from '@adonisjs/transmit/services/main'
import { enterAdminArea, enterStaffArea } from '#abilities/main'
import Order from '#models/order'
import OrderPolicy from '#policies/order_policy'
import OrderService, { ADMIN_ORDERS_CHANNEL, STAFF_QUEUES_CHANNEL } from '#services/order_service'

transmit.registerRoutes()

transmit.authorize<{ id: string }>('orders/:id', async ({ bouncer, session }, { id }) => {
  const order = await Order.find(Number(id) || 0)
  const orders = await app.container.make(OrderService)
  return (
    !!order &&
    (await bouncer
      .with(OrderPolicy)
      .allows('follow', order, orders.isTrackingUnlocked(session, order)))
  )
})

transmit.authorize(STAFF_QUEUES_CHANNEL, ({ bouncer }) => bouncer.allows(enterStaffArea))

transmit.authorize(ADMIN_ORDERS_CHANNEL, ({ bouncer }) => bouncer.allows(enterAdminArea))
