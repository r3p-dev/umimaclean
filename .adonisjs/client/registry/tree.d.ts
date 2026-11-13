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
  register: {
    create: typeof routes['register.create']
    store: typeof routes['register.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  dashboard: typeof routes['dashboard']
}
