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
  'area.check': {
    methods: ["GET","HEAD"],
    pattern: '/area/cek',
    tokens: [[0,"area"],[0,"cek"]],
    types: placeholder as Registry['area.check']['types'],
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
  'register.store': {
    methods: ["POST"],
    pattern: '/daftar',
    tokens: [[0,"daftar"]],
    types: placeholder as Registry['register.store']['types'],
  },
  'password_reset.create': {
    methods: ["GET","HEAD"],
    pattern: '/lupa-kata-sandi',
    tokens: [[0,"lupa-kata-sandi"]],
    types: placeholder as Registry['password_reset.create']['types'],
  },
  'password_reset.store': {
    methods: ["POST"],
    pattern: '/lupa-kata-sandi',
    tokens: [[0,"lupa-kata-sandi"]],
    types: placeholder as Registry['password_reset.store']['types'],
  },
  'password_reset.edit': {
    methods: ["GET","HEAD"],
    pattern: '/kata-sandi-baru',
    tokens: [[0,"kata-sandi-baru"]],
    types: placeholder as Registry['password_reset.edit']['types'],
  },
  'password_reset.update': {
    methods: ["POST"],
    pattern: '/kata-sandi-baru',
    tokens: [[0,"kata-sandi-baru"]],
    types: placeholder as Registry['password_reset.update']['types'],
  },
  'otp.show': {
    methods: ["GET","HEAD"],
    pattern: '/verifikasi',
    tokens: [[0,"verifikasi"]],
    types: placeholder as Registry['otp.show']['types'],
  },
  'otp.verify': {
    methods: ["POST"],
    pattern: '/verifikasi',
    tokens: [[0,"verifikasi"]],
    types: placeholder as Registry['otp.verify']['types'],
  },
  'otp.resend': {
    methods: ["POST"],
    pattern: '/verifikasi/kirim-ulang',
    tokens: [[0,"verifikasi"],[0,"kirim-ulang"]],
    types: placeholder as Registry['otp.resend']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/keluar',
    tokens: [[0,"keluar"]],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'account_security.update_password': {
    methods: ["PUT"],
    pattern: '/akun/kata-sandi',
    tokens: [[0,"akun"],[0,"kata-sandi"]],
    types: placeholder as Registry['account_security.update_password']['types'],
  },
  'area.check_point': {
    methods: ["GET","HEAD"],
    pattern: '/area/cek-titik',
    tokens: [[0,"area"],[0,"cek-titik"]],
    types: placeholder as Registry['area.check_point']['types'],
  },
  'places.index': {
    methods: ["GET","HEAD"],
    pattern: '/tempat',
    tokens: [[0,"tempat"]],
    types: placeholder as Registry['places.index']['types'],
  },
  'customer.home': {
    methods: ["GET","HEAD"],
    pattern: '/beranda',
    tokens: [[0,"beranda"]],
    types: placeholder as Registry['customer.home']['types'],
  },
  'customer.orders.create': {
    methods: ["GET","HEAD"],
    pattern: '/pesan',
    tokens: [[0,"pesan"]],
    types: placeholder as Registry['customer.orders.create']['types'],
  },
  'customer.orders.draft': {
    methods: ["POST"],
    pattern: '/pesan',
    tokens: [[0,"pesan"]],
    types: placeholder as Registry['customer.orders.draft']['types'],
  },
  'customer.orders.confirm': {
    methods: ["GET","HEAD"],
    pattern: '/pesan/konfirmasi',
    tokens: [[0,"pesan"],[0,"konfirmasi"]],
    types: placeholder as Registry['customer.orders.confirm']['types'],
  },
  'customer.orders.store': {
    methods: ["POST"],
    pattern: '/pesan/konfirmasi',
    tokens: [[0,"pesan"],[0,"konfirmasi"]],
    types: placeholder as Registry['customer.orders.store']['types'],
  },
  'customer.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/profil',
    tokens: [[0,"profil"]],
    types: placeholder as Registry['customer.profile.show']['types'],
  },
  'customer.profile.edit': {
    methods: ["GET","HEAD"],
    pattern: '/profil/ubah',
    tokens: [[0,"profil"],[0,"ubah"]],
    types: placeholder as Registry['customer.profile.edit']['types'],
  },
  'customer.profile.update': {
    methods: ["PUT"],
    pattern: '/profil',
    tokens: [[0,"profil"]],
    types: placeholder as Registry['customer.profile.update']['types'],
  },
  'customer.phone.edit': {
    methods: ["GET","HEAD"],
    pattern: '/profil/nomor',
    tokens: [[0,"profil"],[0,"nomor"]],
    types: placeholder as Registry['customer.phone.edit']['types'],
  },
  'customer.phone.store': {
    methods: ["POST"],
    pattern: '/profil/nomor',
    tokens: [[0,"profil"],[0,"nomor"]],
    types: placeholder as Registry['customer.phone.store']['types'],
  },
  'customer.addresses.index': {
    methods: ["GET","HEAD"],
    pattern: '/profil/alamat',
    tokens: [[0,"profil"],[0,"alamat"]],
    types: placeholder as Registry['customer.addresses.index']['types'],
  },
  'customer.addresses.create': {
    methods: ["GET","HEAD"],
    pattern: '/profil/alamat/baru',
    tokens: [[0,"profil"],[0,"alamat"],[0,"baru"]],
    types: placeholder as Registry['customer.addresses.create']['types'],
  },
  'customer.addresses.store': {
    methods: ["POST"],
    pattern: '/profil/alamat',
    tokens: [[0,"profil"],[0,"alamat"]],
    types: placeholder as Registry['customer.addresses.store']['types'],
  },
  'customer.addresses.edit': {
    methods: ["GET","HEAD"],
    pattern: '/profil/alamat/:id/ubah',
    tokens: [[0,"profil"],[0,"alamat"],[1,"id"],[0,"ubah"]],
    types: placeholder as Registry['customer.addresses.edit']['types'],
  },
  'customer.addresses.update': {
    methods: ["PUT"],
    pattern: '/profil/alamat/:id',
    tokens: [[0,"profil"],[0,"alamat"],[1,"id"]],
    types: placeholder as Registry['customer.addresses.update']['types'],
  },
  'customer.addresses.primary': {
    methods: ["POST"],
    pattern: '/profil/alamat/:id/utama',
    tokens: [[0,"profil"],[0,"alamat"],[1,"id"],[0,"utama"]],
    types: placeholder as Registry['customer.addresses.primary']['types'],
  },
  'customer.addresses.destroy': {
    methods: ["DELETE"],
    pattern: '/profil/alamat/:id',
    tokens: [[0,"profil"],[0,"alamat"],[1,"id"]],
    types: placeholder as Registry['customer.addresses.destroy']['types'],
  },
  'staff.home': {
    methods: ["GET","HEAD"],
    pattern: '/staf',
    tokens: [[0,"staf"]],
    types: placeholder as Registry['staff.home']['types'],
  },
  'staff.profile': {
    methods: ["GET","HEAD"],
    pattern: '/staf/profil',
    tokens: [[0,"staf"],[0,"profil"]],
    types: placeholder as Registry['staff.profile']['types'],
  },
  'staff.profile.edit': {
    methods: ["GET","HEAD"],
    pattern: '/staf/profil/ubah',
    tokens: [[0,"staf"],[0,"profil"],[0,"ubah"]],
    types: placeholder as Registry['staff.profile.edit']['types'],
  },
  'staff.profile.update': {
    methods: ["PUT"],
    pattern: '/staf/profil',
    tokens: [[0,"staf"],[0,"profil"]],
    types: placeholder as Registry['staff.profile.update']['types'],
  },
  'staff.phone.edit': {
    methods: ["GET","HEAD"],
    pattern: '/staf/profil/nomor',
    tokens: [[0,"staf"],[0,"profil"],[0,"nomor"]],
    types: placeholder as Registry['staff.phone.edit']['types'],
  },
  'staff.phone.store': {
    methods: ["POST"],
    pattern: '/staf/profil/nomor',
    tokens: [[0,"staf"],[0,"profil"],[0,"nomor"]],
    types: placeholder as Registry['staff.phone.store']['types'],
  },
  'admin.home': {
    methods: ["GET","HEAD"],
    pattern: '/admin',
    tokens: [[0,"admin"]],
    types: placeholder as Registry['admin.home']['types'],
  },
  'admin.profile': {
    methods: ["GET","HEAD"],
    pattern: '/admin/profil',
    tokens: [[0,"admin"],[0,"profil"]],
    types: placeholder as Registry['admin.profile']['types'],
  },
  'admin.profile.edit': {
    methods: ["GET","HEAD"],
    pattern: '/admin/profil/ubah',
    tokens: [[0,"admin"],[0,"profil"],[0,"ubah"]],
    types: placeholder as Registry['admin.profile.edit']['types'],
  },
  'admin.profile.update': {
    methods: ["PUT"],
    pattern: '/admin/profil',
    tokens: [[0,"admin"],[0,"profil"]],
    types: placeholder as Registry['admin.profile.update']['types'],
  },
  'admin.phone.edit': {
    methods: ["GET","HEAD"],
    pattern: '/admin/profil/nomor',
    tokens: [[0,"admin"],[0,"profil"],[0,"nomor"]],
    types: placeholder as Registry['admin.phone.edit']['types'],
  },
  'admin.phone.store': {
    methods: ["POST"],
    pattern: '/admin/profil/nomor',
    tokens: [[0,"admin"],[0,"profil"],[0,"nomor"]],
    types: placeholder as Registry['admin.phone.store']['types'],
  },
  'admin.services.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/layanan',
    tokens: [[0,"admin"],[0,"layanan"]],
    types: placeholder as Registry['admin.services.index']['types'],
  },
  'admin.services.store': {
    methods: ["POST"],
    pattern: '/admin/layanan',
    tokens: [[0,"admin"],[0,"layanan"]],
    types: placeholder as Registry['admin.services.store']['types'],
  },
  'admin.services.update': {
    methods: ["PUT"],
    pattern: '/admin/layanan/:id',
    tokens: [[0,"admin"],[0,"layanan"],[1,"id"]],
    types: placeholder as Registry['admin.services.update']['types'],
  },
  'admin.services.toggle': {
    methods: ["PATCH"],
    pattern: '/admin/layanan/:id/toggle',
    tokens: [[0,"admin"],[0,"layanan"],[1,"id"],[0,"toggle"]],
    types: placeholder as Registry['admin.services.toggle']['types'],
  },
  'admin.services.bulk_toggle': {
    methods: ["POST"],
    pattern: '/admin/layanan/bulk-toggle',
    tokens: [[0,"admin"],[0,"layanan"],[0,"bulk-toggle"]],
    types: placeholder as Registry['admin.services.bulk_toggle']['types'],
  },
  'admin.services.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/layanan/:id',
    tokens: [[0,"admin"],[0,"layanan"],[1,"id"]],
    types: placeholder as Registry['admin.services.destroy']['types'],
  },
  'admin.settings.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/pengaturan',
    tokens: [[0,"admin"],[0,"pengaturan"]],
    types: placeholder as Registry['admin.settings.index']['types'],
  },
  'admin.settings.store': {
    methods: ["GET","HEAD"],
    pattern: '/admin/pengaturan/toko',
    tokens: [[0,"admin"],[0,"pengaturan"],[0,"toko"]],
    types: placeholder as Registry['admin.settings.store']['types'],
  },
  'admin.settings.store.update': {
    methods: ["PUT"],
    pattern: '/admin/pengaturan/toko',
    tokens: [[0,"admin"],[0,"pengaturan"],[0,"toko"]],
    types: placeholder as Registry['admin.settings.store.update']['types'],
  },
  'admin.settings.slots': {
    methods: ["GET","HEAD"],
    pattern: '/admin/pengaturan/slot',
    tokens: [[0,"admin"],[0,"pengaturan"],[0,"slot"]],
    types: placeholder as Registry['admin.settings.slots']['types'],
  },
  'admin.settings.slots.update': {
    methods: ["PUT"],
    pattern: '/admin/pengaturan/slot/:weekday',
    tokens: [[0,"admin"],[0,"pengaturan"],[0,"slot"],[1,"weekday"]],
    types: placeholder as Registry['admin.settings.slots.update']['types'],
  },
  'admin.settings.slots.copy': {
    methods: ["POST"],
    pattern: '/admin/pengaturan/slot/:weekday/salin',
    tokens: [[0,"admin"],[0,"pengaturan"],[0,"slot"],[1,"weekday"],[0,"salin"]],
    types: placeholder as Registry['admin.settings.slots.copy']['types'],
  },
  'admin.settings.hours.update': {
    methods: ["PUT"],
    pattern: '/admin/pengaturan/jam',
    tokens: [[0,"admin"],[0,"pengaturan"],[0,"jam"]],
    types: placeholder as Registry['admin.settings.hours.update']['types'],
  },
  'admin.areas.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/pengaturan/area',
    tokens: [[0,"admin"],[0,"pengaturan"],[0,"area"]],
    types: placeholder as Registry['admin.areas.index']['types'],
  },
  'admin.areas.toggle': {
    methods: ["PATCH"],
    pattern: '/admin/pengaturan/area/:id/toggle',
    tokens: [[0,"admin"],[0,"pengaturan"],[0,"area"],[1,"id"],[0,"toggle"]],
    types: placeholder as Registry['admin.areas.toggle']['types'],
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
