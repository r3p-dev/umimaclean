import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/inertia'

const inertiaConfig = defineConfig({
  encryptHistory: app.inProduction,

  ssr: {
    enabled: false,

    entrypoint: 'inertia/ssr.tsx',
  },
})

export default inertiaConfig
