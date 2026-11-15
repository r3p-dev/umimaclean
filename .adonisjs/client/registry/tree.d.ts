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
  }
  customer: {
    home: typeof routes['customer.home']
  }
  staff: {
    home: typeof routes['staff.home']
  }
  admin: {
    home: typeof routes['admin.home']
  }
}
