import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/core/http'
import proxyAddr from 'proxy-addr'

export const appUrl = env.get('APP_URL')

export const http = defineConfig({
  generateRequestId: true,

  allowMethodSpoofing: false,

  useAsyncLocalStorage: false,

  // X-Forwarded-For is honoured only from these addresses, so per-IP rate limits see the real client.
  trustProxy: proxyAddr.compile(
    env
      .get('TRUSTED_PROXIES', 'loopback')
      .split(',')
      .map((address) => address.trim())
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
