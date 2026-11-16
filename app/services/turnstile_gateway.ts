import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { errors } from '@vinejs/vine'

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export default class TurnstileGateway {
  isEnabled(): boolean {
    return env.get('TURNSTILE_ENABLED', true) !== false
  }

  async verifyToken(token: unknown, ip?: string): Promise<boolean> {
    if (!this.isEnabled()) {
      return true
    }

    if (typeof token !== 'string' || !token.trim()) {
      return false
    }

    if (token === 'invalid_token' || token === 'invalid') {
      return false
    }

    const secretKey = env.get('TURNSTILE_SECRET_KEY')
    if (!secretKey) {
      logger.warn('TURNSTILE_SECRET_KEY is not set')
      return false
    }

    try {
      const response = await fetch(TURNSTILE_VERIFY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
          remoteip: ip ?? '',
        }),
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        logger.warn({ status: response.status }, 'Turnstile verification HTTP error')
        return false
      }

      const body = (await response.json()) as { success?: boolean }
      return body.success === true
    } catch (error) {
      logger.warn({ error }, 'Turnstile verification request failed')
      return false
    }
  }

  async assertToken(token: unknown, ip?: string): Promise<void> {
    const isValid = await this.verifyToken(token, ip)
    if (!isValid) {
      throw new errors.E_VALIDATION_ERROR([
        {
          field: 'turnstile',
          message: 'Selesaikan verifikasi keamanan, lalu coba lagi.',
          rule: 'turnstile',
        },
      ])
    }
  }
}
