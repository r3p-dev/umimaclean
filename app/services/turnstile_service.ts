import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import { fieldError } from '#validators/shared/field_error'

export const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export default class TurnstileService {
  async verify(token: unknown, ip: string) {
    if (typeof token !== 'string' || !token) {
      return false
    }

    try {
      const response = await fetch(TURNSTILE_VERIFY_URL, {
        method: 'POST',
        body: new URLSearchParams({
          secret: env.get('TURNSTILE_SECRET_KEY').release(),
          response: token,
          remoteip: ip,
        }),
        signal: AbortSignal.timeout(5000),
      })

      const body = (await response.json()) as { success?: boolean }

      return body.success === true
    } catch (error) {
      logger.warn({ err: error }, 'Turnstile verification failed')
      return false
    }
  }

  async assert(token: unknown, ip: string) {
    if (!(await this.verify(token, ip))) {
      throw fieldError('turnstile', 'Selesaikan verifikasi keamanan, lalu coba lagi.', 'turnstile')
    }
  }
}
