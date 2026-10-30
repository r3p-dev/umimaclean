import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import { dbAssertions } from '@adonisjs/lucid/plugins/db'
import testUtils from '@adonisjs/core/services/test_utils'
import { browserClient, decoratorsCollection } from '@japa/browser-client'
import { authApiClient } from '@adonisjs/auth/plugins/api_client'
import { authBrowserClient } from '@adonisjs/auth/plugins/browser_client'
import { shieldApiClient } from '@adonisjs/shield/plugins/api_client'
import { inertiaApiClient } from '@adonisjs/inertia/plugins/api_client'
import { sessionApiClient } from '@adonisjs/session/plugins/api_client'
import { sessionBrowserClient } from '@adonisjs/session/plugins/browser_client'
import { loadOsmFixtures } from '#tests/support/osm'

const FAKE_TURNSTILE = `window.turnstile = {
  render(element, options) {
    const input = Object.assign(document.createElement('input'), {
      type: 'hidden',
      name: 'cf-turnstile-response',
      value: 'browser-test-token',
    })
    element.append(input)
    setTimeout(() => options.callback(input.value))
    return 'fake'
  },
  reset() {},
  remove() {},
}`

decoratorsCollection.register({
  context(context) {
    void context.route(
      (url) => !['localhost', '127.0.0.1'].includes(url.hostname),
      (route) =>
        route.request().url().startsWith('https://challenges.cloudflare.com/turnstile/')
          ? route.fulfill({ contentType: 'text/javascript', body: FAKE_TURNSTILE })
          : route.abort()
    )
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
  setup: [() => testUtils.db().migrate(), loadOsmFixtures],
  teardown: [],
}

export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
