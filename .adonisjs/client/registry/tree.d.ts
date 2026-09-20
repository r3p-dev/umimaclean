/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  services: {
    index: typeof routes['services.index']
    show: typeof routes['services.show']
  }
  pricing: typeof routes['pricing']
  faq: typeof routes['faq']
  about: typeof routes['about']
  contact: typeof routes['contact']
  areas: {
    index: typeof routes['areas.index']
    show: typeof routes['areas.show']
  }
  order: {
    create: typeof routes['order.create']
    store: typeof routes['order.store']
  }
  robots: typeof routes['robots']
  sitemap: typeof routes['sitemap']
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
}
