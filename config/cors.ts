import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/cors'

const corsConfig = defineConfig({
  enabled: true,

  // The app is same-origin: outside development no other origin may call it.
  origin: app.inDev ? true : [],

  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],

  headers: true,

  exposeHeaders: [],

  credentials: true,

  maxAge: 90,
})

export default corsConfig
