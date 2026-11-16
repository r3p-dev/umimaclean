import { assert } from '@japa/assert'
import { ApiResponse, ApiRequest, apiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import { dbAssertions } from '@adonisjs/lucid/plugins/db'
import testUtils from '@adonisjs/core/services/test_utils'
import { browserClient } from '@japa/browser-client'
import { authBrowserClient } from '@adonisjs/auth/plugins/browser_client'
import { sessionBrowserClient } from '@adonisjs/session/plugins/browser_client'
import { authApiClient } from '@adonisjs/auth/plugins/api_client'
import { sessionApiClient } from '@adonisjs/session/plugins/api_client'
import { SessionClient } from '@adonisjs/session/client'
import { shieldApiClient } from '@adonisjs/shield/plugins/api_client'
import WhatsAppService from '#services/whatsapp_service'
import { fakeWhatsApp } from './helpers/fake_whatsapp_service.js'

// Japa's sessionApiClient teardown calls request.sessionClient.destroy(sessionId)
// on every request, deleting server-persisted database sessions immediately.
// For testing real multi-request session continuity and session invalidation (ACC-5),
// prevent teardown from destroying persisted sessions.
SessionClient.prototype.destroy = async function () {}

export const plugins: Config['plugins'] = [
  assert(),
  apiClient(),
  pluginAdonisJS(app),
  dbAssertions(app),
  sessionApiClient(app),
  shieldApiClient(),
  authApiClient(app),
  browserClient({ runInSuites: ['browser'] }),
  sessionBrowserClient(app),
  authBrowserClient(app),
]

declare module '@japa/api-client' {
  interface ApiResponse {
    assertValidationError(field: string, message: string | RegExp): void
  }
  interface ApiRequest {
    withAuthCookiesFrom(response: ApiResponse): this
  }
}

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  // Migrates the test database before the first test and rolls it back after the last one,
  // so a freshly created test database needs nothing else (docs/ARCHITECTURE.md §6.6).
  setup: [
    () => testUtils.db().migrate(),
    () => {
      app.container.swap(WhatsAppService, () => fakeWhatsApp)
    },
    () => {
      ApiResponse.macro(
        'assertValidationError',
        function (this: any, field: string, message: string | RegExp) {
          const errors =
            this.flashMessage('errors')?.[field] ||
            this.flashMessage('inputErrorsBag')?.[field] ||
            []
          if (message instanceof RegExp) {
            const matched = errors.some((err: string) => message.test(err))
            this.assert.isTrue(
              matched,
              `Expected error for "${field}" to match ${message}, got ${JSON.stringify(errors)}`
            )
          } else {
            this.assert.include(errors, message)
          }
        }
      )
      ApiResponse.macro('assertHasValidationError', function (this: any, field: string) {
        const has = !(
          this.flashMessage('errors')?.[field] || this.flashMessage('inputErrorsBag')?.[field]
        )
        this.assert.isTrue(has)
      })
      ApiResponse.macro(
        'assertValidationErrors',
        function (this: any, field: string, messages: string[]) {
          const errors =
            this.flashMessage('errors')?.[field] ||
            this.flashMessage('inputErrorsBag')?.[field] ||
            []
          this.assert.deepEqual(errors, messages)
        }
      )
      ApiRequest.macro('withAuthCookiesFrom', function (this: any, res: ApiResponse) {
        const sessionVal = res.cookie('adonis-session')?.value
        if (sessionVal) {
          this.sessionClient.sessionId = sessionVal
        }
        const rememberVal = res.cookie('remember_web')?.value
        if (rememberVal) {
          this.withEncryptedCookie('remember_web', rememberVal)
        }
        return this
      })
    },
  ],
  teardown: [],
}

export function configureSuite(suite: Parameters<NonNullable<Config['configureSuite']>>[0]) {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
