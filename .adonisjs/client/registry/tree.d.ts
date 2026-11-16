/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  legal: {
    terms: typeof routes['legal.terms']
    privacy: typeof routes['legal.privacy']
  }
  seo: {
    robots: typeof routes['seo.robots']
    sitemap: typeof routes['seo.sitemap']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    createStaff: typeof routes['session.createStaff']
    storeStaff: typeof routes['session.storeStaff']
    destroy: typeof routes['session.destroy']
  }
  register: {
    create: typeof routes['register.create']
    store: typeof routes['register.store']
  }
  passwordReset: {
    create: typeof routes['password_reset.create']
    store: typeof routes['password_reset.store']
    edit: typeof routes['password_reset.edit']
    update: typeof routes['password_reset.update']
  }
  otp: {
    show: typeof routes['otp.show']
    verify: typeof routes['otp.verify']
    resend: typeof routes['otp.resend']
  }
  accountSecurity: {
    updatePassword: typeof routes['account_security.update_password']
    signOutOtherDevices: typeof routes['account_security.sign_out_other_devices']
  }
  customer: {
    home: typeof routes['customer.home']
    profile: {
      show: typeof routes['customer.profile.show']
      edit: typeof routes['customer.profile.edit']
      update: typeof routes['customer.profile.update']
    }
    phone: {
      edit: typeof routes['customer.phone.edit']
      store: typeof routes['customer.phone.store']
    }
  }
  staff: {
    home: typeof routes['staff.home']
    profile: typeof routes['staff.profile']
  }
  admin: {
    home: typeof routes['admin.home']
    profile: typeof routes['admin.profile']
  }
}
