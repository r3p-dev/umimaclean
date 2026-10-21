import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),

  LOG_LEVEL: Env.schema.string(),
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),
  LIMITER_STORE: Env.schema.enum(['database', 'memory'] as const),

  DB_CONNECTION: Env.schema.enum(['pg'] as const),
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.secret(),
  DB_DATABASE: Env.schema.string(),

  FONNTE_DEVICE_NUMBER: Env.schema.string(),
  FONNTE_TOKEN: Env.schema.secret.optional(),

  MIDTRANS_SERVER_KEY: Env.schema.secret.optional(),
  MIDTRANS_IS_PRODUCTION: Env.schema.boolean.optional(),

  PROOF_STORAGE_PATH: Env.schema.string.optional(),

  TURNSTILE_ENABLED: Env.schema.boolean.optional(),
  TURNSTILE_SITE_KEY: Env.schema.string(),
  TURNSTILE_SECRET_KEY: Env.schema.secret(),
})
