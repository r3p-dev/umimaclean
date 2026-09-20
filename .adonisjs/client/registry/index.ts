/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'services.index': {
    methods: ["GET","HEAD"],
    pattern: '/layanan',
    tokens: [{"old":"/layanan","type":0,"val":"layanan","end":""}],
    types: placeholder as Registry['services.index']['types'],
  },
  'services.show': {
    methods: ["GET","HEAD"],
    pattern: '/layanan/:slug',
    tokens: [{"old":"/layanan/:slug","type":0,"val":"layanan","end":""},{"old":"/layanan/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['services.show']['types'],
  },
  'pricing': {
    methods: ["GET","HEAD"],
    pattern: '/harga',
    tokens: [{"old":"/harga","type":0,"val":"harga","end":""}],
    types: placeholder as Registry['pricing']['types'],
  },
  'faq': {
    methods: ["GET","HEAD"],
    pattern: '/faq',
    tokens: [{"old":"/faq","type":0,"val":"faq","end":""}],
    types: placeholder as Registry['faq']['types'],
  },
  'about': {
    methods: ["GET","HEAD"],
    pattern: '/tentang',
    tokens: [{"old":"/tentang","type":0,"val":"tentang","end":""}],
    types: placeholder as Registry['about']['types'],
  },
  'contact': {
    methods: ["GET","HEAD"],
    pattern: '/kontak',
    tokens: [{"old":"/kontak","type":0,"val":"kontak","end":""}],
    types: placeholder as Registry['contact']['types'],
  },
  'areas.index': {
    methods: ["GET","HEAD"],
    pattern: '/area',
    tokens: [{"old":"/area","type":0,"val":"area","end":""}],
    types: placeholder as Registry['areas.index']['types'],
  },
  'areas.show': {
    methods: ["GET","HEAD"],
    pattern: '/area/:slug',
    tokens: [{"old":"/area/:slug","type":0,"val":"area","end":""},{"old":"/area/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['areas.show']['types'],
  },
  'order.create': {
    methods: ["GET","HEAD"],
    pattern: '/pesan',
    tokens: [{"old":"/pesan","type":0,"val":"pesan","end":""}],
    types: placeholder as Registry['order.create']['types'],
  },
  'order.store': {
    methods: ["POST"],
    pattern: '/pesan',
    tokens: [{"old":"/pesan","type":0,"val":"pesan","end":""}],
    types: placeholder as Registry['order.store']['types'],
  },
  'robots': {
    methods: ["GET","HEAD"],
    pattern: '/robots.txt',
    tokens: [{"old":"/robots.txt","type":0,"val":"robots.txt","end":""}],
    types: placeholder as Registry['robots']['types'],
  },
  'sitemap': {
    methods: ["GET","HEAD"],
    pattern: '/sitemap.xml',
    tokens: [{"old":"/sitemap.xml","type":0,"val":"sitemap.xml","end":""}],
    types: placeholder as Registry['sitemap']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
