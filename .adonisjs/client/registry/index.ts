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
  'order.details': {
    methods: ["GET","HEAD"],
    pattern: '/pesan',
    tokens: [{"old":"/pesan","type":0,"val":"pesan","end":""}],
    types: placeholder as Registry['order.details']['types'],
  },
  'order.items': {
    methods: ["GET","HEAD"],
    pattern: '/pesan/barang',
    tokens: [{"old":"/pesan/barang","type":0,"val":"pesan","end":""},{"old":"/pesan/barang","type":0,"val":"barang","end":""}],
    types: placeholder as Registry['order.items']['types'],
  },
  'order.confirm': {
    methods: ["GET","HEAD"],
    pattern: '/pesan/konfirmasi',
    tokens: [{"old":"/pesan/konfirmasi","type":0,"val":"pesan","end":""},{"old":"/pesan/konfirmasi","type":0,"val":"konfirmasi","end":""}],
    types: placeholder as Registry['order.confirm']['types'],
  },
  'order.created': {
    methods: ["GET","HEAD"],
    pattern: '/pesan/dibuat',
    tokens: [{"old":"/pesan/dibuat","type":0,"val":"pesan","end":""},{"old":"/pesan/dibuat","type":0,"val":"dibuat","end":""}],
    types: placeholder as Registry['order.created']['types'],
  },
  'tracking.sign_in': {
    methods: ["GET","HEAD"],
    pattern: '/lacak',
    tokens: [{"old":"/lacak","type":0,"val":"lacak","end":""}],
    types: placeholder as Registry['tracking.sign_in']['types'],
  },
  'tracking.orders': {
    methods: ["GET","HEAD"],
    pattern: '/pesanan',
    tokens: [{"old":"/pesanan","type":0,"val":"pesanan","end":""}],
    types: placeholder as Registry['tracking.orders']['types'],
  },
  'tracking.status': {
    methods: ["GET","HEAD"],
    pattern: '/pesanan/:number',
    tokens: [{"old":"/pesanan/:number","type":0,"val":"pesanan","end":""},{"old":"/pesanan/:number","type":1,"val":"number","end":""}],
    types: placeholder as Registry['tracking.status']['types'],
  },
  'payment.bill': {
    methods: ["GET","HEAD"],
    pattern: '/pesanan/:number/tagihan',
    tokens: [{"old":"/pesanan/:number/tagihan","type":0,"val":"pesanan","end":""},{"old":"/pesanan/:number/tagihan","type":1,"val":"number","end":""},{"old":"/pesanan/:number/tagihan","type":0,"val":"tagihan","end":""}],
    types: placeholder as Registry['payment.bill']['types'],
  },
  'payment.qris': {
    methods: ["GET","HEAD"],
    pattern: '/pesanan/:number/bayar',
    tokens: [{"old":"/pesanan/:number/bayar","type":0,"val":"pesanan","end":""},{"old":"/pesanan/:number/bayar","type":1,"val":"number","end":""},{"old":"/pesanan/:number/bayar","type":0,"val":"bayar","end":""}],
    types: placeholder as Registry['payment.qris']['types'],
  },
  'staff.home': {
    methods: ["GET","HEAD"],
    pattern: '/staf',
    tokens: [{"old":"/staf","type":0,"val":"staf","end":""}],
    types: placeholder as Registry['staff.home']['types'],
  },
  'staff.pickups': {
    methods: ["GET","HEAD"],
    pattern: '/staf/jemput',
    tokens: [{"old":"/staf/jemput","type":0,"val":"staf","end":""},{"old":"/staf/jemput","type":0,"val":"jemput","end":""}],
    types: placeholder as Registry['staff.pickups']['types'],
  },
  'staff.pickup_task': {
    methods: ["GET","HEAD"],
    pattern: '/staf/jemput/tugas',
    tokens: [{"old":"/staf/jemput/tugas","type":0,"val":"staf","end":""},{"old":"/staf/jemput/tugas","type":0,"val":"jemput","end":""},{"old":"/staf/jemput/tugas","type":0,"val":"tugas","end":""}],
    types: placeholder as Registry['staff.pickup_task']['types'],
  },
  'staff.deliveries': {
    methods: ["GET","HEAD"],
    pattern: '/staf/antar',
    tokens: [{"old":"/staf/antar","type":0,"val":"staf","end":""},{"old":"/staf/antar","type":0,"val":"antar","end":""}],
    types: placeholder as Registry['staff.deliveries']['types'],
  },
  'staff.delivery_task': {
    methods: ["GET","HEAD"],
    pattern: '/staf/antar/tugas',
    tokens: [{"old":"/staf/antar/tugas","type":0,"val":"staf","end":""},{"old":"/staf/antar/tugas","type":0,"val":"antar","end":""},{"old":"/staf/antar/tugas","type":0,"val":"tugas","end":""}],
    types: placeholder as Registry['staff.delivery_task']['types'],
  },
  'staff.process': {
    methods: ["GET","HEAD"],
    pattern: '/staf/proses',
    tokens: [{"old":"/staf/proses","type":0,"val":"staf","end":""},{"old":"/staf/proses","type":0,"val":"proses","end":""}],
    types: placeholder as Registry['staff.process']['types'],
  },
  'staff.inspection': {
    methods: ["GET","HEAD"],
    pattern: '/staf/proses/:number/periksa',
    tokens: [{"old":"/staf/proses/:number/periksa","type":0,"val":"staf","end":""},{"old":"/staf/proses/:number/periksa","type":0,"val":"proses","end":""},{"old":"/staf/proses/:number/periksa","type":1,"val":"number","end":""},{"old":"/staf/proses/:number/periksa","type":0,"val":"periksa","end":""}],
    types: placeholder as Registry['staff.inspection']['types'],
  },
  'staff.washing': {
    methods: ["GET","HEAD"],
    pattern: '/staf/proses/:number/cuci',
    tokens: [{"old":"/staf/proses/:number/cuci","type":0,"val":"staf","end":""},{"old":"/staf/proses/:number/cuci","type":0,"val":"proses","end":""},{"old":"/staf/proses/:number/cuci","type":1,"val":"number","end":""},{"old":"/staf/proses/:number/cuci","type":0,"val":"cuci","end":""}],
    types: placeholder as Registry['staff.washing']['types'],
  },
  'staff.more': {
    methods: ["GET","HEAD"],
    pattern: '/staf/lainnya',
    tokens: [{"old":"/staf/lainnya","type":0,"val":"staf","end":""},{"old":"/staf/lainnya","type":0,"val":"lainnya","end":""}],
    types: placeholder as Registry['staff.more']['types'],
  },
  'staff.walk_in': {
    methods: ["GET","HEAD"],
    pattern: '/staf/transaksi',
    tokens: [{"old":"/staf/transaksi","type":0,"val":"staf","end":""},{"old":"/staf/transaksi","type":0,"val":"transaksi","end":""}],
    types: placeholder as Registry['staff.walk_in']['types'],
  },
  'staff.store_payment': {
    methods: ["GET","HEAD"],
    pattern: '/staf/transaksi/:number/bayar',
    tokens: [{"old":"/staf/transaksi/:number/bayar","type":0,"val":"staf","end":""},{"old":"/staf/transaksi/:number/bayar","type":0,"val":"transaksi","end":""},{"old":"/staf/transaksi/:number/bayar","type":1,"val":"number","end":""},{"old":"/staf/transaksi/:number/bayar","type":0,"val":"bayar","end":""}],
    types: placeholder as Registry['staff.store_payment']['types'],
  },
  'staff.photo': {
    methods: ["GET","HEAD"],
    pattern: '/staf/foto',
    tokens: [{"old":"/staf/foto","type":0,"val":"staf","end":""},{"old":"/staf/foto","type":0,"val":"foto","end":""}],
    types: placeholder as Registry['staff.photo']['types'],
  },
  'staff.history': {
    methods: ["GET","HEAD"],
    pattern: '/staf/riwayat',
    tokens: [{"old":"/staf/riwayat","type":0,"val":"staf","end":""},{"old":"/staf/riwayat","type":0,"val":"riwayat","end":""}],
    types: placeholder as Registry['staff.history']['types'],
  },
  'staff.profile': {
    methods: ["GET","HEAD"],
    pattern: '/staf/profil',
    tokens: [{"old":"/staf/profil","type":0,"val":"staf","end":""},{"old":"/staf/profil","type":0,"val":"profil","end":""}],
    types: placeholder as Registry['staff.profile']['types'],
  },
  'admin.summary': {
    methods: ["GET","HEAD"],
    pattern: '/admin',
    tokens: [{"old":"/admin","type":0,"val":"admin","end":""}],
    types: placeholder as Registry['admin.summary']['types'],
  },
  'admin.customers': {
    methods: ["GET","HEAD"],
    pattern: '/admin/pelanggan',
    tokens: [{"old":"/admin/pelanggan","type":0,"val":"admin","end":""},{"old":"/admin/pelanggan","type":0,"val":"pelanggan","end":""}],
    types: placeholder as Registry['admin.customers']['types'],
  },
  'admin.activity': {
    methods: ["GET","HEAD"],
    pattern: '/admin/aktivitas',
    tokens: [{"old":"/admin/aktivitas","type":0,"val":"admin","end":""},{"old":"/admin/aktivitas","type":0,"val":"aktivitas","end":""}],
    types: placeholder as Registry['admin.activity']['types'],
  },
  'admin.orders': {
    methods: ["GET","HEAD"],
    pattern: '/admin/pesanan',
    tokens: [{"old":"/admin/pesanan","type":0,"val":"admin","end":""},{"old":"/admin/pesanan","type":0,"val":"pesanan","end":""}],
    types: placeholder as Registry['admin.orders']['types'],
  },
  'admin.order': {
    methods: ["GET","HEAD"],
    pattern: '/admin/pesanan/:number',
    tokens: [{"old":"/admin/pesanan/:number","type":0,"val":"admin","end":""},{"old":"/admin/pesanan/:number","type":0,"val":"pesanan","end":""},{"old":"/admin/pesanan/:number","type":1,"val":"number","end":""}],
    types: placeholder as Registry['admin.order']['types'],
  },
  'admin.services': {
    methods: ["GET","HEAD"],
    pattern: '/admin/layanan',
    tokens: [{"old":"/admin/layanan","type":0,"val":"admin","end":""},{"old":"/admin/layanan","type":0,"val":"layanan","end":""}],
    types: placeholder as Registry['admin.services']['types'],
  },
  'admin.reports': {
    methods: ["GET","HEAD"],
    pattern: '/admin/laporan',
    tokens: [{"old":"/admin/laporan","type":0,"val":"admin","end":""},{"old":"/admin/laporan","type":0,"val":"laporan","end":""}],
    types: placeholder as Registry['admin.reports']['types'],
  },
  'admin.staff': {
    methods: ["GET","HEAD"],
    pattern: '/admin/pengaturan',
    tokens: [{"old":"/admin/pengaturan","type":0,"val":"admin","end":""},{"old":"/admin/pengaturan","type":0,"val":"pengaturan","end":""}],
    types: placeholder as Registry['admin.staff']['types'],
  },
  'admin.store': {
    methods: ["GET","HEAD"],
    pattern: '/admin/pengaturan/toko',
    tokens: [{"old":"/admin/pengaturan/toko","type":0,"val":"admin","end":""},{"old":"/admin/pengaturan/toko","type":0,"val":"pengaturan","end":""},{"old":"/admin/pengaturan/toko","type":0,"val":"toko","end":""}],
    types: placeholder as Registry['admin.store']['types'],
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
