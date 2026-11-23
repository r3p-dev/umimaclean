/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractRawResponse, ExtractResponse, Method, PathWithRegistry, PatternsByMethod, RouteWithRegistry } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'
import type { routes } from './index.ts'

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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/home_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/home_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/home_controller').default['index']>>>
    }
  }
  'area.check': {
    methods: ["GET","HEAD"]
    pattern: '/area/cek'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/area_validator').checkAreaNameValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/area_check_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/area_check_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/area_check_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'legal.terms': {
    methods: ["GET","HEAD"]
    pattern: '/syarat'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
      rawResponse: ExtractRawResponse<unknown>
    }
  }
  'legal.privacy': {
    methods: ["GET","HEAD"]
    pattern: '/privasi'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
      rawResponse: ExtractRawResponse<unknown>
    }
  }
  'seo.robots': {
    methods: ["GET","HEAD"]
    pattern: '/robots.txt'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['robots']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['robots']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['robots']>>>
    }
  }
  'seo.sitemap': {
    methods: ["GET","HEAD"]
    pattern: '/sitemap.xml'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['sitemap']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['sitemap']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['sitemap']>>>
    }
  }
  'session.create': {
    methods: ["GET","HEAD"]
    pattern: '/masuk'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'session.store': {
    methods: ["POST"]
    pattern: '/masuk'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').createSessionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').createSessionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.createStaff': {
    methods: ["GET","HEAD"]
    pattern: '/staf/masuk'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['createStaff']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['createStaff']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/session_controller').default['createStaff']>>>
    }
  }
  'session.storeStaff': {
    methods: ["POST"]
    pattern: '/staf/masuk'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').createSessionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').createSessionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['storeStaff']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['storeStaff']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/session_controller').default['storeStaff']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'register.create': {
    methods: ["GET","HEAD"]
    pattern: '/daftar'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/registration_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/registration_controller').default['create']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/registration_controller').default['create']>>>
    }
  }
  'register.store': {
    methods: ["POST"]
    pattern: '/daftar'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/registration_validator').createRegistrationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/registration_validator').createRegistrationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/registration_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/registration_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/registration_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'password_reset.create': {
    methods: ["GET","HEAD"]
    pattern: '/lupa-kata-sandi'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['create']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['create']>>>
    }
  }
  'password_reset.store': {
    methods: ["POST"]
    pattern: '/lupa-kata-sandi'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/password_reset_validator').forgotPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/password_reset_validator').forgotPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'password_reset.edit': {
    methods: ["GET","HEAD"]
    pattern: '/kata-sandi-baru'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['edit']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['edit']>>>
    }
  }
  'password_reset.update': {
    methods: ["POST"]
    pattern: '/kata-sandi-baru'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/password_reset_validator').resetPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/password_reset_validator').resetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'otp.show': {
    methods: ["GET","HEAD"]
    pattern: '/verifikasi'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/otp_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/otp_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/otp_controller').default['show']>>>
    }
  }
  'otp.verify': {
    methods: ["POST"]
    pattern: '/verifikasi'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/otp_validator').verifyOtpValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/otp_validator').verifyOtpValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/otp_controller').default['verify']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/otp_controller').default['verify']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/otp_controller').default['verify']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'otp.resend': {
    methods: ["POST"]
    pattern: '/verifikasi/kirim-ulang'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/otp_validator').resendOtpValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/otp_validator').resendOtpValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/otp_controller').default['resend']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/otp_controller').default['resend']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/otp_controller').default['resend']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.destroy': {
    methods: ["POST"]
    pattern: '/keluar'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
    }
  }
  'account_security.update_password': {
    methods: ["PUT"]
    pattern: '/akun/kata-sandi'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/profile_validator').changePasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/profile_validator').changePasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account_security_controller').default['updatePassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account_security_controller').default['updatePassword']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/account_security_controller').default['updatePassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'customer.home': {
    methods: ["GET","HEAD"]
    pattern: '/beranda'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
      rawResponse: ExtractRawResponse<unknown>
    }
  }
  'customer.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/profil'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'customer.profile.edit': {
    methods: ["GET","HEAD"]
    pattern: '/profil/ubah'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['edit']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['edit']>>>
    }
  }
  'customer.profile.update': {
    methods: ["PUT"]
    pattern: '/profil'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/profile_validator').updateProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/profile_validator').updateProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'customer.phone.edit': {
    methods: ["GET","HEAD"]
    pattern: '/profil/nomor'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/phone_change_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/phone_change_controller').default['edit']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/phone_change_controller').default['edit']>>>
    }
  }
  'customer.phone.store': {
    methods: ["POST"]
    pattern: '/profil/nomor'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/profile_validator').changePhoneValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/profile_validator').changePhoneValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/phone_change_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/phone_change_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/phone_change_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      rawResponse: ExtractRawResponse<unknown>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['showStaff']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['showStaff']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['showStaff']>>>
    }
  }
  'admin.home': {
    methods: ["GET","HEAD"]
    pattern: '/admin'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
      rawResponse: ExtractRawResponse<unknown>
    }
  }
  'admin.profile': {
    methods: ["GET","HEAD"]
    pattern: '/admin/profil'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['showOwner']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['showOwner']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['showOwner']>>>
    }
  }
  'admin.services.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/layanan'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/services_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/services_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/services_controller').default['index']>>>
    }
  }
  'admin.services.store': {
    methods: ["POST"]
    pattern: '/admin/layanan'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/service_validator').createServiceValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/service_validator').createServiceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/services_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/services_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/services_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.services.update': {
    methods: ["PUT"]
    pattern: '/admin/layanan/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/service_validator').updateServiceValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/service_validator').updateServiceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/services_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/services_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/services_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.services.toggle': {
    methods: ["PATCH"]
    pattern: '/admin/layanan/:id/toggle'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/service_validator').toggleServiceValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/service_validator').toggleServiceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/services_controller').default['toggleActive']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/services_controller').default['toggleActive']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/services_controller').default['toggleActive']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.services.bulk_toggle': {
    methods: ["POST"]
    pattern: '/admin/layanan/bulk-toggle'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/service_validator').bulkToggleServiceValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/service_validator').bulkToggleServiceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/services_controller').default['bulkToggleActive']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/services_controller').default['bulkToggleActive']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/services_controller').default['bulkToggleActive']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.services.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/layanan/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/services_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/services_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/services_controller').default['destroy']>>>
    }
  }
  'admin.settings.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pengaturan'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
      rawResponse: ExtractRawResponse<unknown>
    }
  }
  'admin.settings.store': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pengaturan/toko'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_settings_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_settings_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/store_settings_controller').default['index']>>>
    }
  }
  'admin.settings.store.update': {
    methods: ["PUT"]
    pattern: '/admin/pengaturan/toko'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/setting_validator').storeSettingValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/setting_validator').storeSettingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_settings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_settings_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/store_settings_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.settings.slots': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pengaturan/slot'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pickup_slots_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pickup_slots_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/pickup_slots_controller').default['index']>>>
    }
  }
  'admin.settings.slots.update': {
    methods: ["PUT"]
    pattern: '/admin/pengaturan/slot/:weekday'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/pickup_slot_validator').pickupDaySlotsValidator)>>
      paramsTuple: [ParamValue]
      params: { weekday: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/pickup_slot_validator').pickupDaySlotsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pickup_slots_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pickup_slots_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/pickup_slots_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.settings.slots.copy': {
    methods: ["POST"]
    pattern: '/admin/pengaturan/slot/:weekday/salin'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/pickup_slot_validator').copyPickupSlotsValidator)>>
      paramsTuple: [ParamValue]
      params: { weekday: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/pickup_slot_validator').copyPickupSlotsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pickup_slots_controller').default['copy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pickup_slots_controller').default['copy']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/pickup_slots_controller').default['copy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.settings.hours.update': {
    methods: ["PUT"]
    pattern: '/admin/pengaturan/jam'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/setting_validator').openingHoursValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/setting_validator').openingHoursValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_settings_controller').default['updateHours']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_settings_controller').default['updateHours']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/store_settings_controller').default['updateHours']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.areas.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/pengaturan/area'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/service_areas_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/service_areas_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/service_areas_controller').default['index']>>>
    }
  }
  'admin.areas.toggle': {
    methods: ["PATCH"]
    pattern: '/admin/pengaturan/area/:id/toggle'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/service_areas_controller').default['toggleActive']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/service_areas_controller').default['toggleActive']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/service_areas_controller').default['toggleActive']>>>
    }
  }
}

export namespace Route {
  export type Request<Name extends keyof typeof routes> = RouteWithRegistry.Request<typeof routes, Name>
  export type Response<Name extends keyof typeof routes> = RouteWithRegistry.Response<typeof routes, Name>
  export type Params<Name extends keyof typeof routes> = RouteWithRegistry.Params<typeof routes, Name>
  export type Body<Name extends keyof typeof routes> = RouteWithRegistry.Body<typeof routes, Name>
  export type Query<Name extends keyof typeof routes> = RouteWithRegistry.Query<typeof routes, Name>
  export type Error<Name extends keyof typeof routes> = RouteWithRegistry.Error<typeof routes, Name>
}

export namespace Path {
  export type Request<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Request<typeof routes, M, P>
  export type Response<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Response<typeof routes, M, P>
  export type Params<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Params<typeof routes, M, P>
  export type Body<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Body<typeof routes, M, P>
  export type Query<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Query<typeof routes, M, P>
  export type Error<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Error<typeof routes, M, P>
}
