import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
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
    'account_security.sign_out_other_devices': { paramsTuple?: []; params?: {} }
    'customer.home': { paramsTuple?: []; params?: {} }
    'customer.profile.show': { paramsTuple?: []; params?: {} }
    'customer.profile.edit': { paramsTuple?: []; params?: {} }
    'customer.profile.update': { paramsTuple?: []; params?: {} }
    'customer.phone.edit': { paramsTuple?: []; params?: {} }
    'customer.phone.store': { paramsTuple?: []; params?: {} }
    'staff.home': { paramsTuple?: []; params?: {} }
    'staff.profile': { paramsTuple?: []; params?: {} }
    'admin.home': { paramsTuple?: []; params?: {} }
    'admin.profile': { paramsTuple?: []; params?: {} }
    'admin.services.index': { paramsTuple?: []; params?: {} }
    'admin.services.store': { paramsTuple?: []; params?: {} }
    'admin.services.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.services.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.services.bulk_toggle': { paramsTuple?: []; params?: {} }
    'admin.services.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.index': { paramsTuple?: []; params?: {} }
    'admin.settings.store': { paramsTuple?: []; params?: {} }
    'admin.settings.store.update': { paramsTuple?: []; params?: {} }
    'admin.settings.slots.update': { paramsTuple?: []; params?: {} }
    'admin.areas.index': { paramsTuple?: []; params?: {} }
    'admin.areas.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
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
    'customer.home': { paramsTuple?: []; params?: {} }
    'customer.profile.show': { paramsTuple?: []; params?: {} }
    'customer.profile.edit': { paramsTuple?: []; params?: {} }
    'customer.phone.edit': { paramsTuple?: []; params?: {} }
    'staff.home': { paramsTuple?: []; params?: {} }
    'staff.profile': { paramsTuple?: []; params?: {} }
    'admin.home': { paramsTuple?: []; params?: {} }
    'admin.profile': { paramsTuple?: []; params?: {} }
    'admin.services.index': { paramsTuple?: []; params?: {} }
    'admin.settings.index': { paramsTuple?: []; params?: {} }
    'admin.settings.store': { paramsTuple?: []; params?: {} }
    'admin.areas.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
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
    'customer.home': { paramsTuple?: []; params?: {} }
    'customer.profile.show': { paramsTuple?: []; params?: {} }
    'customer.profile.edit': { paramsTuple?: []; params?: {} }
    'customer.phone.edit': { paramsTuple?: []; params?: {} }
    'staff.home': { paramsTuple?: []; params?: {} }
    'staff.profile': { paramsTuple?: []; params?: {} }
    'admin.home': { paramsTuple?: []; params?: {} }
    'admin.profile': { paramsTuple?: []; params?: {} }
    'admin.services.index': { paramsTuple?: []; params?: {} }
    'admin.settings.index': { paramsTuple?: []; params?: {} }
    'admin.settings.store': { paramsTuple?: []; params?: {} }
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
    'account_security.sign_out_other_devices': { paramsTuple?: []; params?: {} }
    'customer.phone.store': { paramsTuple?: []; params?: {} }
    'admin.services.store': { paramsTuple?: []; params?: {} }
    'admin.services.bulk_toggle': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'account_security.update_password': { paramsTuple?: []; params?: {} }
    'customer.profile.update': { paramsTuple?: []; params?: {} }
    'admin.services.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.store.update': { paramsTuple?: []; params?: {} }
    'admin.settings.slots.update': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'admin.services.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.areas.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'admin.services.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}