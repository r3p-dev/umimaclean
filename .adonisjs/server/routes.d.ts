import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'area.check': { paramsTuple?: []; params?: {} }
    'legal.terms': { paramsTuple?: []; params?: {} }
    'legal.privacy': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.createStaff': { paramsTuple?: []; params?: {} }
    'session.storeStaff': { paramsTuple?: []; params?: {} }
    'register.create': { paramsTuple?: []; params?: {} }
    'register.store': { paramsTuple?: []; params?: {} }
    'password_reset.create': { paramsTuple?: []; params?: {} }
    'password_reset.store': { paramsTuple?: []; params?: {} }
    'password_reset.edit': { paramsTuple?: []; params?: {} }
    'password_reset.update': { paramsTuple?: []; params?: {} }
    'otp.show': { paramsTuple?: []; params?: {} }
    'otp.verify': { paramsTuple?: []; params?: {} }
    'otp.resend': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'account_security.update_password': { paramsTuple?: []; params?: {} }
    'area.check_point': { paramsTuple?: []; params?: {} }
    'places.index': { paramsTuple?: []; params?: {} }
    'customer.home': { paramsTuple?: []; params?: {} }
    'customer.orders.create': { paramsTuple?: []; params?: {} }
    'customer.orders.draft': { paramsTuple?: []; params?: {} }
    'customer.orders.confirm': { paramsTuple?: []; params?: {} }
    'customer.orders.store': { paramsTuple?: []; params?: {} }
    'customer.profile.show': { paramsTuple?: []; params?: {} }
    'customer.profile.edit': { paramsTuple?: []; params?: {} }
    'customer.profile.update': { paramsTuple?: []; params?: {} }
    'customer.phone.edit': { paramsTuple?: []; params?: {} }
    'customer.phone.store': { paramsTuple?: []; params?: {} }
    'customer.addresses.index': { paramsTuple?: []; params?: {} }
    'customer.addresses.create': { paramsTuple?: []; params?: {} }
    'customer.addresses.store': { paramsTuple?: []; params?: {} }
    'customer.addresses.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customer.addresses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customer.addresses.primary': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customer.addresses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'staff.home': { paramsTuple?: []; params?: {} }
    'staff.profile': { paramsTuple?: []; params?: {} }
    'staff.profile.edit': { paramsTuple?: []; params?: {} }
    'staff.profile.update': { paramsTuple?: []; params?: {} }
    'staff.phone.edit': { paramsTuple?: []; params?: {} }
    'staff.phone.store': { paramsTuple?: []; params?: {} }
    'admin.home': { paramsTuple?: []; params?: {} }
    'admin.profile': { paramsTuple?: []; params?: {} }
    'admin.profile.edit': { paramsTuple?: []; params?: {} }
    'admin.profile.update': { paramsTuple?: []; params?: {} }
    'admin.phone.edit': { paramsTuple?: []; params?: {} }
    'admin.phone.store': { paramsTuple?: []; params?: {} }
    'admin.services.index': { paramsTuple?: []; params?: {} }
    'admin.services.store': { paramsTuple?: []; params?: {} }
    'admin.services.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.services.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.services.bulk_toggle': { paramsTuple?: []; params?: {} }
    'admin.services.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.index': { paramsTuple?: []; params?: {} }
    'admin.settings.store': { paramsTuple?: []; params?: {} }
    'admin.settings.store.update': { paramsTuple?: []; params?: {} }
    'admin.settings.slots': { paramsTuple?: []; params?: {} }
    'admin.settings.slots.update': { paramsTuple: [ParamValue]; params: {'weekday': ParamValue} }
    'admin.settings.slots.copy': { paramsTuple: [ParamValue]; params: {'weekday': ParamValue} }
    'admin.settings.hours.update': { paramsTuple?: []; params?: {} }
    'admin.areas.index': { paramsTuple?: []; params?: {} }
    'admin.areas.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'area.check': { paramsTuple?: []; params?: {} }
    'legal.terms': { paramsTuple?: []; params?: {} }
    'legal.privacy': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.createStaff': { paramsTuple?: []; params?: {} }
    'register.create': { paramsTuple?: []; params?: {} }
    'password_reset.create': { paramsTuple?: []; params?: {} }
    'password_reset.edit': { paramsTuple?: []; params?: {} }
    'otp.show': { paramsTuple?: []; params?: {} }
    'area.check_point': { paramsTuple?: []; params?: {} }
    'places.index': { paramsTuple?: []; params?: {} }
    'customer.home': { paramsTuple?: []; params?: {} }
    'customer.orders.create': { paramsTuple?: []; params?: {} }
    'customer.orders.confirm': { paramsTuple?: []; params?: {} }
    'customer.profile.show': { paramsTuple?: []; params?: {} }
    'customer.profile.edit': { paramsTuple?: []; params?: {} }
    'customer.phone.edit': { paramsTuple?: []; params?: {} }
    'customer.addresses.index': { paramsTuple?: []; params?: {} }
    'customer.addresses.create': { paramsTuple?: []; params?: {} }
    'customer.addresses.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'staff.home': { paramsTuple?: []; params?: {} }
    'staff.profile': { paramsTuple?: []; params?: {} }
    'staff.profile.edit': { paramsTuple?: []; params?: {} }
    'staff.phone.edit': { paramsTuple?: []; params?: {} }
    'admin.home': { paramsTuple?: []; params?: {} }
    'admin.profile': { paramsTuple?: []; params?: {} }
    'admin.profile.edit': { paramsTuple?: []; params?: {} }
    'admin.phone.edit': { paramsTuple?: []; params?: {} }
    'admin.services.index': { paramsTuple?: []; params?: {} }
    'admin.settings.index': { paramsTuple?: []; params?: {} }
    'admin.settings.store': { paramsTuple?: []; params?: {} }
    'admin.settings.slots': { paramsTuple?: []; params?: {} }
    'admin.areas.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'area.check': { paramsTuple?: []; params?: {} }
    'legal.terms': { paramsTuple?: []; params?: {} }
    'legal.privacy': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.createStaff': { paramsTuple?: []; params?: {} }
    'register.create': { paramsTuple?: []; params?: {} }
    'password_reset.create': { paramsTuple?: []; params?: {} }
    'password_reset.edit': { paramsTuple?: []; params?: {} }
    'otp.show': { paramsTuple?: []; params?: {} }
    'area.check_point': { paramsTuple?: []; params?: {} }
    'places.index': { paramsTuple?: []; params?: {} }
    'customer.home': { paramsTuple?: []; params?: {} }
    'customer.orders.create': { paramsTuple?: []; params?: {} }
    'customer.orders.confirm': { paramsTuple?: []; params?: {} }
    'customer.profile.show': { paramsTuple?: []; params?: {} }
    'customer.profile.edit': { paramsTuple?: []; params?: {} }
    'customer.phone.edit': { paramsTuple?: []; params?: {} }
    'customer.addresses.index': { paramsTuple?: []; params?: {} }
    'customer.addresses.create': { paramsTuple?: []; params?: {} }
    'customer.addresses.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'staff.home': { paramsTuple?: []; params?: {} }
    'staff.profile': { paramsTuple?: []; params?: {} }
    'staff.profile.edit': { paramsTuple?: []; params?: {} }
    'staff.phone.edit': { paramsTuple?: []; params?: {} }
    'admin.home': { paramsTuple?: []; params?: {} }
    'admin.profile': { paramsTuple?: []; params?: {} }
    'admin.profile.edit': { paramsTuple?: []; params?: {} }
    'admin.phone.edit': { paramsTuple?: []; params?: {} }
    'admin.services.index': { paramsTuple?: []; params?: {} }
    'admin.settings.index': { paramsTuple?: []; params?: {} }
    'admin.settings.store': { paramsTuple?: []; params?: {} }
    'admin.settings.slots': { paramsTuple?: []; params?: {} }
    'admin.areas.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'session.store': { paramsTuple?: []; params?: {} }
    'session.storeStaff': { paramsTuple?: []; params?: {} }
    'register.store': { paramsTuple?: []; params?: {} }
    'password_reset.store': { paramsTuple?: []; params?: {} }
    'password_reset.update': { paramsTuple?: []; params?: {} }
    'otp.verify': { paramsTuple?: []; params?: {} }
    'otp.resend': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'customer.orders.draft': { paramsTuple?: []; params?: {} }
    'customer.orders.store': { paramsTuple?: []; params?: {} }
    'customer.phone.store': { paramsTuple?: []; params?: {} }
    'customer.addresses.store': { paramsTuple?: []; params?: {} }
    'customer.addresses.primary': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'staff.phone.store': { paramsTuple?: []; params?: {} }
    'admin.phone.store': { paramsTuple?: []; params?: {} }
    'admin.services.store': { paramsTuple?: []; params?: {} }
    'admin.services.bulk_toggle': { paramsTuple?: []; params?: {} }
    'admin.settings.slots.copy': { paramsTuple: [ParamValue]; params: {'weekday': ParamValue} }
  }
  PUT: {
    'account_security.update_password': { paramsTuple?: []; params?: {} }
    'customer.profile.update': { paramsTuple?: []; params?: {} }
    'customer.addresses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'staff.profile.update': { paramsTuple?: []; params?: {} }
    'admin.profile.update': { paramsTuple?: []; params?: {} }
    'admin.services.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.store.update': { paramsTuple?: []; params?: {} }
    'admin.settings.slots.update': { paramsTuple: [ParamValue]; params: {'weekday': ParamValue} }
    'admin.settings.hours.update': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'customer.addresses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.services.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'admin.services.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.areas.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}