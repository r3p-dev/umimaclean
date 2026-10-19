import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'order.details': { paramsTuple?: []; params?: {} }
    'order.items': { paramsTuple?: []; params?: {} }
    'order.confirm': { paramsTuple?: []; params?: {} }
    'order.created': { paramsTuple?: []; params?: {} }
    'tracking.sign_in': { paramsTuple?: []; params?: {} }
    'tracking.orders': { paramsTuple?: []; params?: {} }
    'tracking.status': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'payment.bill': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'payment.qris': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'staff.home': { paramsTuple?: []; params?: {} }
    'staff.pickups': { paramsTuple?: []; params?: {} }
    'staff.pickup_task': { paramsTuple?: []; params?: {} }
    'staff.deliveries': { paramsTuple?: []; params?: {} }
    'staff.delivery_task': { paramsTuple?: []; params?: {} }
    'staff.process': { paramsTuple?: []; params?: {} }
    'staff.inspection': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'staff.washing': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'staff.more': { paramsTuple?: []; params?: {} }
    'staff.walk_in': { paramsTuple?: []; params?: {} }
    'staff.store_payment': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'staff.photo': { paramsTuple?: []; params?: {} }
    'staff.history': { paramsTuple?: []; params?: {} }
    'staff.profile': { paramsTuple?: []; params?: {} }
    'admin.summary': { paramsTuple?: []; params?: {} }
    'admin.customers': { paramsTuple?: []; params?: {} }
    'admin.activity': { paramsTuple?: []; params?: {} }
    'admin.orders': { paramsTuple?: []; params?: {} }
    'admin.order': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'admin.services': { paramsTuple?: []; params?: {} }
    'admin.reports': { paramsTuple?: []; params?: {} }
    'admin.staff': { paramsTuple?: []; params?: {} }
    'admin.store': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'order.details': { paramsTuple?: []; params?: {} }
    'order.items': { paramsTuple?: []; params?: {} }
    'order.confirm': { paramsTuple?: []; params?: {} }
    'order.created': { paramsTuple?: []; params?: {} }
    'tracking.sign_in': { paramsTuple?: []; params?: {} }
    'tracking.orders': { paramsTuple?: []; params?: {} }
    'tracking.status': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'payment.bill': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'payment.qris': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'staff.home': { paramsTuple?: []; params?: {} }
    'staff.pickups': { paramsTuple?: []; params?: {} }
    'staff.pickup_task': { paramsTuple?: []; params?: {} }
    'staff.deliveries': { paramsTuple?: []; params?: {} }
    'staff.delivery_task': { paramsTuple?: []; params?: {} }
    'staff.process': { paramsTuple?: []; params?: {} }
    'staff.inspection': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'staff.washing': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'staff.more': { paramsTuple?: []; params?: {} }
    'staff.walk_in': { paramsTuple?: []; params?: {} }
    'staff.store_payment': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'staff.photo': { paramsTuple?: []; params?: {} }
    'staff.history': { paramsTuple?: []; params?: {} }
    'staff.profile': { paramsTuple?: []; params?: {} }
    'admin.summary': { paramsTuple?: []; params?: {} }
    'admin.customers': { paramsTuple?: []; params?: {} }
    'admin.activity': { paramsTuple?: []; params?: {} }
    'admin.orders': { paramsTuple?: []; params?: {} }
    'admin.order': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'admin.services': { paramsTuple?: []; params?: {} }
    'admin.reports': { paramsTuple?: []; params?: {} }
    'admin.staff': { paramsTuple?: []; params?: {} }
    'admin.store': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'order.details': { paramsTuple?: []; params?: {} }
    'order.items': { paramsTuple?: []; params?: {} }
    'order.confirm': { paramsTuple?: []; params?: {} }
    'order.created': { paramsTuple?: []; params?: {} }
    'tracking.sign_in': { paramsTuple?: []; params?: {} }
    'tracking.orders': { paramsTuple?: []; params?: {} }
    'tracking.status': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'payment.bill': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'payment.qris': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'staff.home': { paramsTuple?: []; params?: {} }
    'staff.pickups': { paramsTuple?: []; params?: {} }
    'staff.pickup_task': { paramsTuple?: []; params?: {} }
    'staff.deliveries': { paramsTuple?: []; params?: {} }
    'staff.delivery_task': { paramsTuple?: []; params?: {} }
    'staff.process': { paramsTuple?: []; params?: {} }
    'staff.inspection': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'staff.washing': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'staff.more': { paramsTuple?: []; params?: {} }
    'staff.walk_in': { paramsTuple?: []; params?: {} }
    'staff.store_payment': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'staff.photo': { paramsTuple?: []; params?: {} }
    'staff.history': { paramsTuple?: []; params?: {} }
    'staff.profile': { paramsTuple?: []; params?: {} }
    'admin.summary': { paramsTuple?: []; params?: {} }
    'admin.customers': { paramsTuple?: []; params?: {} }
    'admin.activity': { paramsTuple?: []; params?: {} }
    'admin.orders': { paramsTuple?: []; params?: {} }
    'admin.order': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'admin.services': { paramsTuple?: []; params?: {} }
    'admin.reports': { paramsTuple?: []; params?: {} }
    'admin.staff': { paramsTuple?: []; params?: {} }
    'admin.store': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}