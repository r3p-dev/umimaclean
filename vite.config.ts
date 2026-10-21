import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      svgrOptions: {
        svgProps: { 'fill': 'currentColor', 'aria-hidden': 'true', 'focusable': 'false' },
      },
    }),
    adonisjs({ entryPoints: ['inertia/app.tsx'], reload: ['resources/views/**/*.edge'] }),
  ],

  resolve: {
    alias: [
      { find: /^cn$/, replacement: `${import.meta.dirname}/inertia/lib/shared/utils.ts` },
      { find: '~/', replacement: `${import.meta.dirname}/inertia/` },
      { find: '@enums', replacement: `${import.meta.dirname}/app/enums` },
      { find: '@generated', replacement: `${import.meta.dirname}/.adonisjs/client/` },
    ],
  },

  server: {
    watch: {
      ignored: ['**/storage/**', '**/tmp/**'],
    },
  },
})
