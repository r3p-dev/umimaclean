/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'order.details': {
    methods: ["GET","HEAD"]
    pattern: '/pesan'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'order.items': {
    methods: ["GET","HEAD"]
    pattern: '/pesan/barang'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'order.confirm': {
    methods: ["GET","HEAD"]
    pattern: '/pesan/konfirmasi'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'order.created': {
    methods: ["GET","HEAD"]
    pattern: '/pesan/dibuat'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'tracking.sign_in': {
    methods: ["GET","HEAD"]
    pattern: '/lacak'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'tracking.orders': {
    methods: ["GET","HEAD"]
    pattern: '/pesanan'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'tracking.status': {
    methods: ["GET","HEAD"]
    pattern: '/pesanan/:number'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { number: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'payment.bill': {
    methods: ["GET","HEAD"]
    pattern: '/pesanan/:number/tagihan'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { number: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'payment.qris': {
    methods: ["GET","HEAD"]
    pattern: '/pesanan/:number/bayar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { number: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.home': {
    methods: ["GET","HEAD"]
    pattern: '/staf'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.pickups': {
    methods: ["GET","HEAD"]
    pattern: '/staf/jemput'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.pickup_task': {
    methods: ["GET","HEAD"]
    pattern: '/staf/jemput/tugas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.deliveries': {
    methods: ["GET","HEAD"]
    pattern: '/staf/antar'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.delivery_task': {
    methods: ["GET","HEAD"]
    pattern: '/staf/antar/tugas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.process': {
    methods: ["GET","HEAD"]
    pattern: '/staf/proses'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.inspection': {
    methods: ["GET","HEAD"]
    pattern: '/staf/proses/:number/periksa'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { number: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.washing': {
    methods: ["GET","HEAD"]
    pattern: '/staf/proses/:number/cuci'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { number: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.more': {
    methods: ["GET","HEAD"]
    pattern: '/staf/lainnya'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.walk_in': {
    methods: ["GET","HEAD"]
    pattern: '/staf/transaksi'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.store_payment': {
    methods: ["GET","HEAD"]
    pattern: '/staf/transaksi/:number/bayar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { number: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.photo': {
    methods: ["GET","HEAD"]
    pattern: '/staf/foto'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.history': {
    methods: ["GET","HEAD"]
    pattern: '/staf/riwayat'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'staff.profile': {
    methods: ["GET","HEAD"]
    pattern: '/staf/profil'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin.summary': {
    methods: ["GET","HEAD"]
    pattern: '/admin'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin.customers': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pelanggan'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin.activity': {
    methods: ["GET","HEAD"]
    pattern: '/admin/aktivitas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin.orders': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pesanan'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin.order': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pesanan/:number'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { number: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin.services': {
    methods: ["GET","HEAD"]
    pattern: '/admin/layanan'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin.reports': {
    methods: ["GET","HEAD"]
    pattern: '/admin/laporan'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin.staff': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pengaturan'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'admin.store': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pengaturan/toko'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
}
