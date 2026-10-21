import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { inject } from '@adonisjs/core'
import { errors } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import env from '#start/env'
import type { OtpPurpose } from '#enums/otp_enum'
import OtpCode, { OTP_MAX_ATTEMPTS } from '#models/otp_code'
import { MessageStatus } from '#enums/message_enum'
import FonnteService from '#services/fonnte_service'

export const OTP_LENGTH = 6
export const OTP_TTL_MINUTES = 5
export const OTP_RESEND_SECONDS = 60
export const OTP_PHONE_HOURLY_LIMIT = 5
export const OTP_IP_HOURLY_LIMIT = 20

export type OtpIssueResult =
  { status: 'sent' } | { status: 'failed' } | { status: 'cooldown' | 'limited'; retryIn: number }

export type OtpCheckResult = 'valid' | 'invalid' | 'locked'

@inject()
export default class OtpService {
  constructor(protected fonnte: FonnteService) {}

  async issue(
    phone: string,
    purpose: OtpPurpose,
    options: { ip: string; shouldDeliver?: boolean }
  ): Promise<OtpIssueResult> {
    const throttled = await this.#throttle(phone, options.ip)
    if (throttled) {
      return throttled
    }

    if (options.shouldDeliver === false) {
      return { status: 'sent' }
    }

    const now = DateTime.now()
    await OtpCode.query()
      .where('phone', phone)
      .where('purpose', purpose)
      .withScopes((scopes) => scopes.active())
      .update({ expires_at: now.toJSDate() })

    const code = String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0')
    const otp = await OtpCode.create({
      phone,
      purpose,
      codeHash: this.#hashCode(phone, purpose, code),
      attempts: 0,
      expiresAt: now.plus({ minutes: OTP_TTL_MINUTES }),
      consumedAt: null,
    })

    const delivery = await this.fonnte.send(
      phone,
      `Kode verifikasi Umima Clean: ${code}. Berlaku ${OTP_TTL_MINUTES} menit. Jangan berikan kode ini ke siapa pun.`
    )
    if (delivery !== MessageStatus.FAILED) {
      return { status: 'sent' }
    }

    await otp.delete()

    return { status: 'failed' }
  }

  async check(
    phone: string,
    purpose: OtpPurpose,
    code: string,
    transaction: TransactionClientContract
  ): Promise<OtpCheckResult> {
    const otp = await OtpCode.query({ client: transaction })
      .where('phone', phone)
      .where('purpose', purpose)
      .withScopes((scopes) => scopes.active())
      .orderBy('id', 'desc')
      .forUpdate()
      .first()
    if (!otp) {
      return 'invalid'
    }
    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      return 'locked'
    }

    if (!this.#sameHash(otp.codeHash, this.#hashCode(phone, purpose, code))) {
      otp.attempts += 1
      await otp.save()

      return otp.attempts >= OTP_MAX_ATTEMPTS ? 'locked' : 'invalid'
    }

    otp.consumedAt = DateTime.now()
    await otp.save()

    return 'valid'
  }

  async cooldownRemaining(phone: string) {
    return this.#cooldownLimiter().availableIn(`otp_cooldown_${phone}`)
  }

  async #throttle(phone: string, ip: string): Promise<OtpIssueResult | null> {
    const steps = [
      {
        limiter: this.#cooldownLimiter(),
        key: `otp_cooldown_${phone}`,
        status: 'cooldown' as const,
      },
      { limiter: this.#phoneLimiter(), key: `otp_phone_${phone}`, status: 'limited' as const },
      { limiter: this.#ipLimiter(), key: `otp_ip_${ip}`, status: 'limited' as const },
    ]

    for (const step of steps) {
      try {
        await step.limiter.consume(step.key)
      } catch (error) {
        if (!(error instanceof errors.ThrottleException)) {
          throw error
        }

        return { status: step.status, retryIn: error.response.availableIn }
      }
    }

    return null
  }

  #cooldownLimiter() {
    return limiter.use({
      requests: 1,
      duration: OTP_RESEND_SECONDS,
      blockDuration: OTP_RESEND_SECONDS,
    })
  }

  #phoneLimiter() {
    return limiter.use({ requests: OTP_PHONE_HOURLY_LIMIT, duration: '1 hour' })
  }

  #ipLimiter() {
    return limiter.use({ requests: OTP_IP_HOURLY_LIMIT, duration: '1 hour' })
  }

  #hashCode(phone: string, purpose: OtpPurpose, code: string) {
    return createHmac('sha256', env.get('APP_KEY').release())
      .update(`${purpose}:${phone}:${code}`)
      .digest('hex')
  }

  #sameHash(left: string, right: string) {
    const leftBytes = Buffer.from(left, 'hex')
    const rightBytes = Buffer.from(right, 'hex')

    return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes)
  }
}
