import { inject } from '@adonisjs/core'
import { OrderSource, OrderStatus } from '#enums/order_enum'
import Order from '#models/order'
import type User from '#models/user'
import FieldTaskService from '#services/order/field_task_service'
import { WORKSHOP_STATUSES } from '#services/order/workshop_service'

export type StaffCounts = { jemput: number; proses: number; antar: number }

@inject()
export default class StaffSummaryService {
  constructor(protected trips: FieldTaskService) {}

  async counts(user: User): Promise<StaffCounts> {
    const [pickupActive, pickups, deliveryActive, deliveries, workshop] = await Promise.all([
      this.trips.active(user, 'pickup'),
      this.trips.queue(user, 'pickup'),
      this.trips.active(user, 'delivery'),
      this.trips.queue(user, 'delivery'),
      Order.query()
        .whereIn('status', WORKSHOP_STATUSES)
        .whereNot((query) => {
          query.where('status', OrderStatus.AWAITING_PAYMENT).where('source', OrderSource.ONLINE)
        })
        .count('* as total'),
    ])

    return {
      jemput: pickups.length + (pickupActive ? 1 : 0),
      antar: deliveries.length + (deliveryActive ? 1 : 0),
      proses: Number(workshop[0].$extras.total),
    }
  }
}
