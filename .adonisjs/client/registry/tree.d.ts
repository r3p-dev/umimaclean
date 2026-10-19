/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  order: {
    details: typeof routes['order.details']
    items: typeof routes['order.items']
    confirm: typeof routes['order.confirm']
    created: typeof routes['order.created']
  }
  tracking: {
    signIn: typeof routes['tracking.sign_in']
    orders: typeof routes['tracking.orders']
    status: typeof routes['tracking.status']
  }
  payment: {
    bill: typeof routes['payment.bill']
    qris: typeof routes['payment.qris']
  }
  staff: {
    home: typeof routes['staff.home']
    pickups: typeof routes['staff.pickups']
    pickupTask: typeof routes['staff.pickup_task']
    deliveries: typeof routes['staff.deliveries']
    deliveryTask: typeof routes['staff.delivery_task']
    process: typeof routes['staff.process']
    inspection: typeof routes['staff.inspection']
    washing: typeof routes['staff.washing']
    more: typeof routes['staff.more']
    walkIn: typeof routes['staff.walk_in']
    storePayment: typeof routes['staff.store_payment']
    photo: typeof routes['staff.photo']
    history: typeof routes['staff.history']
    profile: typeof routes['staff.profile']
  }
  admin: {
    summary: typeof routes['admin.summary']
    customers: typeof routes['admin.customers']
    activity: typeof routes['admin.activity']
    orders: typeof routes['admin.orders']
    order: typeof routes['admin.order']
    services: typeof routes['admin.services']
    reports: typeof routes['admin.reports']
    staff: typeof routes['admin.staff']
    store: typeof routes['admin.store']
  }
}
