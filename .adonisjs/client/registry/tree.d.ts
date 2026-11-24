/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  area: {
    check: typeof routes['area.check']
    checkPoint: typeof routes['area.check_point']
  }
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
  }
  places: {
    index: typeof routes['places.index']
    show: typeof routes['places.show']
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
    addresses: {
      index: typeof routes['customer.addresses.index']
      create: typeof routes['customer.addresses.create']
      store: typeof routes['customer.addresses.store']
      edit: typeof routes['customer.addresses.edit']
      update: typeof routes['customer.addresses.update']
      primary: typeof routes['customer.addresses.primary']
      destroy: typeof routes['customer.addresses.destroy']
    }
  }
  staff: {
    home: typeof routes['staff.home']
    profile: typeof routes['staff.profile'] & {
      edit: typeof routes['staff.profile.edit']
      update: typeof routes['staff.profile.update']
    }
    phone: {
      edit: typeof routes['staff.phone.edit']
      store: typeof routes['staff.phone.store']
    }
  }
  admin: {
    home: typeof routes['admin.home']
    profile: typeof routes['admin.profile'] & {
      edit: typeof routes['admin.profile.edit']
      update: typeof routes['admin.profile.update']
    }
    phone: {
      edit: typeof routes['admin.phone.edit']
      store: typeof routes['admin.phone.store']
    }
    services: {
      index: typeof routes['admin.services.index']
      store: typeof routes['admin.services.store']
      update: typeof routes['admin.services.update']
      toggle: typeof routes['admin.services.toggle']
      bulkToggle: typeof routes['admin.services.bulk_toggle']
      destroy: typeof routes['admin.services.destroy']
    }
    settings: {
      index: typeof routes['admin.settings.index']
      store: typeof routes['admin.settings.store'] & {
        update: typeof routes['admin.settings.store.update']
      }
      slots: typeof routes['admin.settings.slots'] & {
        update: typeof routes['admin.settings.slots.update']
        copy: typeof routes['admin.settings.slots.copy']
      }
      hours: {
        update: typeof routes['admin.settings.hours.update']
      }
    }
    areas: {
      index: typeof routes['admin.areas.index']
      toggle: typeof routes['admin.areas.toggle']
    }
  }
}
