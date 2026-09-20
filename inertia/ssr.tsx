import ReactDOMServer from 'react-dom/server'
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

/**
 * Mirrors inertia/app.tsx: no default layout, no Tuyau provider. Pages bring
 * their own layout, so the server renders exactly the tree the client hydrates.
 */
export default function render(page: any) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      return resolvePageComponent<ResolvedComponent>(
        `./pages/${name}.tsx`,
        import.meta.glob<ResolvedComponent>('./pages/**/*.tsx', { eager: true })
      )
    },
    setup: ({ App, props }) => <App {...props} />,
  })
}
