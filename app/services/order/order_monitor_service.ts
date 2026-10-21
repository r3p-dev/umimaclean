import ActivityLog from '#models/activity_log'
import Order from '#models/order'

export default class OrderMonitorService {
  list() {
    return Order.query()
      .preload('pickupAddress')
      .preload('deliveryAddress')
      .preload('bill')
      .preload('payments')
      .preload('events', (events) => events.preload('actor').orderBy('id', 'asc'))
      .orderBy('created_at', 'desc')
  }

  detail(code: string) {
    return Order.query()
      .where('public_code', code)
      .preload('pickupAddress')
      .preload('deliveryAddress')
      .preload('items', (items) => items.orderBy('position', 'asc'))
      .preload('bill', (bill) => bill.preload('lines').preload('decider'))
      .preload('payments', (payments) => payments.preload('recorder').orderBy('id', 'asc'))
      .preload('photos', (photos) => photos.preload('taker').orderBy('id', 'asc'))
      .preload('events', (events) => events.preload('actor').orderBy('id', 'asc'))
      .first()
  }

  activity(order: Order) {
    return ActivityLog.query().where('order_id', order.id).preload('actor').orderBy('id', 'desc')
  }

  history(order: Order) {
    return this.list()
      .where((query) => {
        query.where('customer_phone', order.customerPhone)
        if (order.userId) {
          query.orWhere('user_id', order.userId)
        }
      })
      .limit(20)
  }
}
