import { defineConfig } from '@adonisjs/inertia'

const inertiaConfig = defineConfig({
  ssr: {
    enabled: true,
    entrypoint: 'inertia/ssr.tsx',
    // Public pages are server-rendered, so they load fast and link previews read their tags (NFR-3,
    // GUEST-3); signed-in pages render in the browser only.
    pages: ['home', 'legal/terms', 'legal/privacy', 'auth/login', 'auth/signup'],
  },
})

export default inertiaConfig
