/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

export type { Route, Path } from './schema.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [[0,"/"]],
    types: placeholder as Registry['home']['types'],
  },
  'legal.terms': {
    methods: ["GET","HEAD"],
    pattern: '/syarat',
    tokens: [[0,"syarat"]],
    types: placeholder as Registry['legal.terms']['types'],
  },
  'legal.privacy': {
    methods: ["GET","HEAD"],
    pattern: '/privasi',
    tokens: [[0,"privasi"]],
    types: placeholder as Registry['legal.privacy']['types'],
  },
  'seo.robots': {
    methods: ["GET","HEAD"],
    pattern: '/robots.txt',
    tokens: [[0,"robots.txt"]],
    types: placeholder as Registry['seo.robots']['types'],
  },
  'seo.sitemap': {
    methods: ["GET","HEAD"],
    pattern: '/sitemap.xml',
    tokens: [[0,"sitemap.xml"]],
    types: placeholder as Registry['seo.sitemap']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/masuk',
    tokens: [[0,"masuk"]],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/masuk',
    tokens: [[0,"masuk"]],
    types: placeholder as Registry['session.store']['types'],
  },
  'session.createStaff': {
    methods: ["GET","HEAD"],
    pattern: '/staf/masuk',
    tokens: [[0,"staf"],[0,"masuk"]],
    types: placeholder as Registry['session.createStaff']['types'],
  },
  'session.storeStaff': {
    methods: ["POST"],
    pattern: '/staf/masuk',
    tokens: [[0,"staf"],[0,"masuk"]],
    types: placeholder as Registry['session.storeStaff']['types'],
  },
  'register.create': {
    methods: ["GET","HEAD"],
    pattern: '/daftar',
    tokens: [[0,"daftar"]],
    types: placeholder as Registry['register.create']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/keluar',
    tokens: [[0,"keluar"]],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'customer.home': {
    methods: ["GET","HEAD"],
    pattern: '/beranda',
    tokens: [[0,"beranda"]],
    types: placeholder as Registry['customer.home']['types'],
  },
  'staff.home': {
    methods: ["GET","HEAD"],
    pattern: '/staf',
    tokens: [[0,"staf"]],
    types: placeholder as Registry['staff.home']['types'],
  },
  'admin.home': {
    methods: ["GET","HEAD"],
    pattern: '/admin',
    tokens: [[0,"admin"]],
    types: placeholder as Registry['admin.home']['types'],
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
