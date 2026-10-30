import { defineConfig } from '@adonisjs/static'

const staticServerConfig = defineConfig({
  enabled: true,

  etag: true,

  lastModified: true,

  dotFiles: 'ignore',

  headers: (path) =>
    path.endsWith('.pmtiles') ? { 'Cache-Control': 'public, max-age=31536000, immutable' } : {},
})

export default staticServerConfig
