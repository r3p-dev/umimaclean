import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import { dbAssertions } from '@adonisjs/lucid/plugins/db'
import testUtils from '@adonisjs/core/services/test_utils'
import { browserClient, decoratorsCollection } from '@japa/browser-client'
import { authBrowserClient } from '@adonisjs/auth/plugins/browser_client'
import { sessionBrowserClient } from '@adonisjs/session/plugins/browser_client'
import { authApiClient } from '@adonisjs/auth/plugins/api_client'
import { sessionApiClient } from '@adonisjs/session/plugins/api_client'
import { inertiaApiClient } from '@adonisjs/inertia/plugins/api_client'
import { shieldApiClient } from '@adonisjs/shield/plugins/api_client'
import WhatsAppService from '#services/whatsapp_service'
import { fakeWhatsApp } from './helpers/fake_whatsapp_service.js'
import TurnstileGateway from '#services/turnstile_gateway'
import env from '#start/env'
import { fakeTurnstile, TEST_TURNSTILE_TOKEN } from './helpers/fake_turnstile_gateway.js'

// Browser decorator: serves a local fake script for Cloudflare Turnstile
// and aborts any other request to a non-localhost host so browser tests run fully isolated.
decoratorsCollection.register({
  context(context) {
    context.route('**/*', async (route) => {
      const url = new URL(route.request().url())
      if (url.hostname === 'challenges.cloudflare.com' && url.pathname.includes('/turnstile/')) {
        const fakeScript = `
          window.turnstile = {
            render: function(container, options) {
              var el = typeof container === 'string' ? document.querySelector(container) : container;
              if (el) {
                var fieldName = (options && options['response-field-name']) || 'cf-turnstile-response';
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = fieldName;
                input.value = '${TEST_TURNSTILE_TOKEN}';
                el.appendChild(input);
                if (fieldName !== 'cf-turnstile-response') {
                  var cfInput = document.createElement('input');
                  cfInput.type = 'hidden';
                  cfInput.name = 'cf-turnstile-response';
                  cfInput.value = '${TEST_TURNSTILE_TOKEN}';
                  el.appendChild(cfInput);
                }
              }
              if (options && typeof options.callback === 'function') {
                options.callback('${TEST_TURNSTILE_TOKEN}');
              }
              return 'fake-turnstile-widget-id';
            },
            reset: function() {},
            remove: function() {}
          };
        `
        return route.fulfill({
          status: 200,
          contentType: 'application/javascript',
          body: fakeScript,
        })
      }

      const host = url.hostname
      const isLocal =
        host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === env.get('HOST')

      if (!isLocal) {
        return route.abort()
      }

      return route.continue()
    })
  },
})

export const plugins: Config['plugins'] = [
  assert(),
  apiClient(),
  pluginAdonisJS(app),
  dbAssertions(app),
  sessionApiClient(app),
  shieldApiClient(),
  authApiClient(app),
  inertiaApiClient(app),
  browserClient({ runInSuites: ['browser'] }),
  sessionBrowserClient(app),
  authBrowserClient(app),
]

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  // Migrates the test database before the first test and rolls it back after the last one,
  // so a freshly created test database needs nothing else (docs/ARCHITECTURE.md §6.6).
  setup: [
    () => testUtils.db().migrate(),
    () => {
      app.container.swap(WhatsAppService, () => fakeWhatsApp)
      app.container.swap(TurnstileGateway, () => fakeTurnstile)
    },
  ],
  teardown: [],
}

export function configureSuite(suite: Parameters<NonNullable<Config['configureSuite']>>[0]) {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
