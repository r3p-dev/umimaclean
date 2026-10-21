import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
  csp: {
    enabled: false,

    directives: {},

    reportOnly: false,
  },

  csrf: {
    enabled: true,

    enableXsrfCookie: true,

    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],

    exceptRoutes: ['/webhooks/midtrans'],
  },

  xFrame: {
    enabled: true,

    action: 'DENY',
  },

  hsts: {
    enabled: true,

    maxAge: '180 days',
  },

  contentTypeSniffing: {
    enabled: true,
  },
})

export default shieldConfig
