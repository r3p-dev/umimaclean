import '~/css/app.css'
import { client } from '~/client'
import { pageTitle } from '~/lib/page_title'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'

createInertiaApp({
  title: pageTitle,
  resolve: async (name) => {
    const page = await resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob<{ default: ResolvedComponent }>('./pages/**/*.tsx')
    )
    return page.default
  },
  setup({ el, App, props }) {
    const app = (
      <TuyauProvider client={client}>
        <App {...props} />
      </TuyauProvider>
    )
    // Server-rendered pages (config/inertia.ts) arrive with their HTML, which React takes over.
    if (el.hasChildNodes()) {
      hydrateRoot(el, app)
      return
    }
    createRoot(el).render(app)
  },
  progress: {
    color: 'var(--primary)',
  },
})
