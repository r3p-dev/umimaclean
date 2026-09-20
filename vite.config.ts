import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    adonisjs({
      entryPoints: ['inertia/app.tsx'],

      /**
       * Without this the SSR entrypoint is never bundled, `node ace build`
       * still succeeds, and production silently falls back to client-only
       * rendering — which would serve crawlers an empty document.
       */
      serverEntryPoints: ['inertia/ssr.tsx'],

      reload: ['resources/views/**/*.edge'],
    }),
  ],

  /**
   * Define aliases for importing modules from
   * your frontend code
   */
  resolve: {
    alias: {
      '~/': `${import.meta.dirname}/inertia/`,
      '@generated': `${import.meta.dirname}/.adonisjs/client/`,

      /**
       * Business copy and the NAP are shared with the server rather than
       * duplicated. These modules import nothing, so bundling them into the
       * client is safe, and a footer can never disagree with the schema.
       */
      '@content': `${import.meta.dirname}/app/content`,
    },
  },

  server: {
    watch: {
      ignored: ['**/storage/**', '**/tmp/**'],
    },
  },
})
