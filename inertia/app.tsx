import '~/css/app.css'
import { client } from './client'
import { createRoot } from 'react-dom/client'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { createInertiaApp, router, type ResolvedComponent } from '@inertiajs/react'
import { RouterProvider } from 'react-aria-components'

declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: Parameters<typeof router.visit>[1]
  }
}

function navigate(href: string, options?: Parameters<typeof router.visit>[1]) {
  const url = new URL(href, window.location.href)
  const isSamePage =
    url.pathname === window.location.pathname && url.search === window.location.search

  if (isSamePage && url.hash) {
    window.location.hash = url.hash
    return
  }

  router.visit(href, options)
}

const appName = import.meta.env.VITE_APP_NAME || 'Umima Clean'

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: async (name) => {
    const page = await resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob<{ default: ResolvedComponent }>('./pages/**/*.tsx')
    )
    return page.default
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <TuyauProvider client={client}>
        <RouterProvider navigate={navigate}>
          <App {...props} />
        </RouterProvider>
      </TuyauProvider>
    )
  },
  progress: {
    color: 'var(--primary)',
  },
})
