import app from '@adonisjs/core/services/app'
import { defineConfig, drivers } from '@adonisjs/core/hash'

const hashConfig = defineConfig({
  default: 'scrypt',

  list: {
    scrypt: drivers.scrypt({
      // Tests use a lower cost to run faster; their hashes never have to resist brute force.
      cost: app.inTest ? 1024 : 16384,

      blockSize: 8,

      parallelization: 1,

      maxMemory: 33554432,
    }),
  },
})

export default hashConfig

declare module '@adonisjs/core/types' {
  export interface HashersList extends InferHashers<typeof hashConfig> {}
}
