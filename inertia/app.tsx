import './css/app.css'
import { createRoot } from 'react-dom/client'
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

/**
 * The client entrypoint deliberately wraps nothing.
 *
 * It used to eagerly import the authenticated layout and wrap every page in a
 * Tuyau provider, which pulled `sonner` and the route registry into the shared
 * bundle that public pages download. Public pages navigate with plain anchors
 * and show no toasts, so they were paying for both and using neither.
 *
 * Layout is now each page's own decision — `page.layout` — so the
 * authenticated shell and its dependencies land in a chunk that only
 * authenticated pages load.
 */
createInertiaApp({
  resolve: (name) => {
    return resolvePageComponent<ResolvedComponent>(
      `./pages/${name}.tsx`,
      import.meta.glob<ResolvedComponent>('./pages/**/*.tsx')
    )
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
  progress: {
    color: '#111111',
  },
})
