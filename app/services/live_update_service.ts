import transmit from '@adonisjs/transmit/services/main'
import type Order from '#models/order'

export const STAFF_QUEUES_CHANNEL = 'staff/queues'
export const ADMIN_ORDERS_CHANNEL = 'admin/orders'

export function orderChannel(publicCode: string) {
  return `orders/${publicCode}`
}

export default class LiveUpdateService {
  orderChanged(order: Order) {
    const payload = { code: order.publicCode, status: order.status }
    transmit.broadcast(orderChannel(order.publicCode), payload)
    transmit.broadcast(STAFF_QUEUES_CHANNEL, payload)
    transmit.broadcast(ADMIN_ORDERS_CHANNEL, payload)
  }
}
