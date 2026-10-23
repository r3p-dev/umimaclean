import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/core/http'
import proxyAddr from 'proxy-addr'

export const appUrl = env.get('APP_URL')

export const http = defineConfig({
  generateRequestId: true,

  allowMethodSpoofing: false,

  useAsyncLocalStorage: false,

  trustProxy: proxyAddr.compile(
    env
      .get('TRUSTED_PROXIES', 'loopback,uniquelocal')
      .split(',')
      .map((range) => range.trim())
  ),

  router: {
    matcher: 'tree',
  },

  redirect: {
    forwardQueryString: true,
  },

  cookie: {
    domain: '',

    path: '/',

    maxAge: '2h',

    httpOnly: true,

    secure: app.inProduction,

    sameSite: 'lax',
  },
})
