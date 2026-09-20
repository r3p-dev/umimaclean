import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'services.index': { paramsTuple?: []; params?: {} }
    'services.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'pricing': { paramsTuple?: []; params?: {} }
    'faq': { paramsTuple?: []; params?: {} }
    'about': { paramsTuple?: []; params?: {} }
    'contact': { paramsTuple?: []; params?: {} }
    'areas.index': { paramsTuple?: []; params?: {} }
    'areas.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'order.create': { paramsTuple?: []; params?: {} }
    'order.store': { paramsTuple?: []; params?: {} }
    'robots': { paramsTuple?: []; params?: {} }
    'sitemap': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'services.index': { paramsTuple?: []; params?: {} }
    'services.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'pricing': { paramsTuple?: []; params?: {} }
    'faq': { paramsTuple?: []; params?: {} }
    'about': { paramsTuple?: []; params?: {} }
    'contact': { paramsTuple?: []; params?: {} }
    'areas.index': { paramsTuple?: []; params?: {} }
    'areas.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'order.create': { paramsTuple?: []; params?: {} }
    'robots': { paramsTuple?: []; params?: {} }
    'sitemap': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'services.index': { paramsTuple?: []; params?: {} }
    'services.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'pricing': { paramsTuple?: []; params?: {} }
    'faq': { paramsTuple?: []; params?: {} }
    'about': { paramsTuple?: []; params?: {} }
    'contact': { paramsTuple?: []; params?: {} }
    'areas.index': { paramsTuple?: []; params?: {} }
    'areas.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'order.create': { paramsTuple?: []; params?: {} }
    'robots': { paramsTuple?: []; params?: {} }
    'sitemap': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'order.store': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}