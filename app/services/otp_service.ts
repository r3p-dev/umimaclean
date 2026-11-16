import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { errors as limiterErrors } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { errors as vineErrors } from '@vinejs/vine'
import type { Session } from '@adonisjs/session'
import { OtpPurpose } from '#enums/otp_purpose_enum'
import OtpCode, {
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_MAX_PHONE_HOURLY,
  OTP_MAX_IP_HOURLY,
} from '#models/otp_code'
import User from '#models/user'
import WhatsAppService from '#services/whatsapp_service'
import env from '#start/env'
import AccountService from '#services/account_service'
import { maskPhone } from '#helpers/phone'

export interface OtpFlow {
  purpose: OtpPurpose
  phone: string
  name?: string
  passwordHash?: string
  failures: number
}

export interface PasswordResetGrant {
  userId: number
  phone: string
  expiresAt: string
}

export type OtpCheckResult = 'valid' | 'invalid' | 'locked'

const FLOW_KEY = 'otp_flow'
const PASSWORD_RESET_KEY = 'password_reset_grant'
const OTP_LENGTH = 6

export const OTP_INVALID_MESSAGE = 'Kode verifikasi salah atau sudah kedaluwarsa.'
export const OTP_LOCKED_MESSAGE = 'Kode salah 5 kali. Minta kode baru.'
export const PHONE_TAKEN_MESSAGE =
  'Nomor WhatsApp ini sudah terdaftar. Silakan masuk atau gunakan lupa kata sandi.'

function validationError(field: string, message: string, rule = 'otp'): never {
  throw new vineErrors.E_VALIDATION_ERROR([{ field, message, rule }])
}

@inject()
export default class OtpService {
  constructor(
    protected whatsapp: WhatsAppService,
    protected accountService: AccountService
  ) {}

  currentOtpFlow(session: Session): OtpFlow | null {
    const flow = session.get(FLOW_KEY) as OtpFlow | undefined
    return flow?.phone && flow.purpose ? flow : null
  }

  isOtpLocked(flow: OtpFlow): boolean {
    return flow.failures >= OTP_MAX_ATTEMPTS
  }

  recordOtpFailure(session: Session, flow: OtpFlow, isLocked: boolean): string {
    const failures = isLocked ? OTP_MAX_ATTEMPTS : flow.failures + 1
    session.put(FLOW_KEY, { ...flow, failures })
    return failures >= OTP_MAX_ATTEMPTS ? OTP_LOCKED_MESSAGE : OTP_INVALID_MESSAGE
  }

  clearOtpFlow(session: Session): void {
    session.forget(FLOW_KEY)
  }

  async otpCooldownRemaining(phone: string): Promise<number> {
    const remaining = await this.#cooldownLimiter().availableIn(`otp_cooldown_${phone}`)
    return Math.max(0, remaining)
  }

  #cooldownLimiter() {
    return limiter.use({
      requests: 1,
      duration: `${OTP_RESEND_COOLDOWN_SECONDS} s`,
      blockDuration: `${OTP_RESEND_COOLDOWN_SECONDS} s`,
    })
  }

  #phoneLimiter() {
    return limiter.use({
      requests: OTP_MAX_PHONE_HOURLY,
      duration: '1 hour',
    })
  }

  #ipLimiter() {
    return limiter.use({
      requests: OTP_MAX_IP_HOURLY,
      duration: '1 hour',
    })
  }

  #hashCode(phone: string, purpose: OtpPurpose, code: string): string {
    const appKey = env.get('APP_KEY').release()
    return createHmac('sha256', appKey).update(`${purpose}:${phone}:${code}`).digest('hex')
  }

  #safeCompareHash(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left, 'hex')
    const rightBuffer = Buffer.from(right, 'hex')
    if (leftBuffer.length !== rightBuffer.length) {
      return false
    }
    return timingSafeEqual(leftBuffer, rightBuffer)
  }

  async #throttle(
    phone: string,
    ip: string
  ): Promise<{ status: 'cooldown' | 'limited'; retryIn: number } | null> {
    const checks = [
      {
        limiter: this.#cooldownLimiter(),
        key: `otp_cooldown_${phone}`,
        status: 'cooldown' as const,
      },
      {
        limiter: this.#phoneLimiter(),
        key: `otp_send_phone_${phone}`,
        status: 'limited' as const,
      },
      {
        limiter: this.#ipLimiter(),
        key: `otp_send_ip_${ip}`,
        status: 'limited' as const,
      },
    ]

    for (const check of checks) {
      try {
        await check.limiter.consume(check.key)
      } catch (error) {
        if (error instanceof limiterErrors.E_TOO_MANY_REQUESTS) {
          return { status: check.status, retryIn: error.response.availableIn }
        }
        throw error
      }
    }

    return null
  }

  async #issue(
    phone: string,
    purpose: OtpPurpose,
    options: { ip: string; shouldDeliver?: boolean }
  ): Promise<{ status: 'sent' | 'cooldown' | 'limited' | 'failed'; retryIn?: number }> {
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
    await OtpCode.create({
      phone,
      purpose,
      codeHash: this.#hashCode(phone, purpose, code),
      attempts: 0,
      expiresAt: now.plus({ minutes: OTP_TTL_MINUTES }),
      consumedAt: null,
      createdAt: now,
    })

    const text = `Kode verifikasi Umima Clean Anda adalah: ${code}. Berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.`
    const delivery = await this.whatsapp.sendMessage(phone, text)

    if (!delivery.sent && delivery.reason !== 'logged_not_in_allowlist') {
      logger.warn({ phone: maskPhone(phone) }, 'WhatsApp message delivery failed for OTP')
      return { status: 'failed' }
    }

    return { status: 'sent' }
  }

  #assertIssued(
    result: { status: 'sent' | 'cooldown' | 'limited' | 'failed'; retryIn?: number },
    field: string,
    purpose: OtpPurpose
  ): void {
    if (result.status === 'sent') {
      return
    }

    if (result.status === 'cooldown') {
      validationError(field, `Tunggu ${result.retryIn} detik sebelum meminta kode baru.`)
    }

    if (result.status === 'limited') {
      const minutes = Math.max(1, Math.ceil((result.retryIn ?? 60) / 60))
      validationError(field, `Terlalu banyak permintaan kode. Coba lagi dalam ${minutes} menit.`)
    }

    if (purpose === OtpPurpose.RESET_PASSWORD) {
      logger.warn('Password reset code could not be delivered')
      return
    }

    validationError(field, 'Kode gagal dikirim ke WhatsApp. Coba lagi sebentar lagi.')
  }

  async startRegistration(
    session: Session,
    input: { name: string; phone: string; password: string },
    ip: string
  ): Promise<void> {
    if (await User.isPhoneTaken(input.phone)) {
      validationError('phone', PHONE_TAKEN_MESSAGE)
    }

    const passwordHash = await hash.make(input.password)
    const flow: OtpFlow = {
      purpose: OtpPurpose.REGISTER,
      phone: input.phone,
      name: input.name,
      passwordHash,
      failures: 0,
    }

    const result = await this.#issue(flow.phone, flow.purpose, { ip })
    this.#assertIssued(result, 'phone', flow.purpose)

    session.put(FLOW_KEY, flow)
  }

  async startPasswordReset(session: Session, phone: string, ip: string): Promise<void> {
    const isRegistered = await User.isPhoneTaken(phone)
    const flow: OtpFlow = {
      purpose: OtpPurpose.RESET_PASSWORD,
      phone,
      failures: 0,
    }

    const result = await this.#issue(phone, flow.purpose, {
      ip,
      shouldDeliver: isRegistered,
    })
    this.#assertIssued(result, 'phone', flow.purpose)

    session.put(FLOW_KEY, flow)
  }

  async resendOtp(session: Session, flow: OtpFlow, ip: string): Promise<void> {
    const isRegistered =
      flow.purpose !== OtpPurpose.RESET_PASSWORD || (await User.isPhoneTaken(flow.phone))
    const result = await this.#issue(flow.phone, flow.purpose, {
      ip,
      shouldDeliver: isRegistered,
    })
    this.#assertIssued(result, 'code', flow.purpose)

    session.put(FLOW_KEY, { ...flow, failures: 0 })
  }

  async verifyOtp(
    flow: OtpFlow,
    code: string
  ): Promise<{ result: OtpCheckResult; user: User | null }> {
    return db.transaction(async (transaction) => {
      const otp = await OtpCode.query({ client: transaction })
        .where('phone', flow.phone)
        .where('purpose', flow.purpose)
        .withScopes((scopes) => scopes.active())
        .orderBy('id', 'desc')
        .forUpdate()
        .first()

      if (!otp) {
        return { result: 'invalid', user: null }
      }

      if (otp.attempts >= OTP_MAX_ATTEMPTS) {
        return { result: 'locked', user: null }
      }

      const expectedHash = this.#hashCode(flow.phone, flow.purpose, code)
      if (!this.#safeCompareHash(otp.codeHash, expectedHash)) {
        otp.attempts += 1
        await otp.save()
        return { result: otp.attempts >= OTP_MAX_ATTEMPTS ? 'locked' : 'invalid', user: null }
      }

      otp.consumedAt = DateTime.now()
      await otp.save()

      let user: User | null = null
      if (flow.purpose === OtpPurpose.REGISTER) {
        user = await this.accountService.createCustomer(
          {
            name: flow.name!,
            phone: flow.phone,
            passwordHash: flow.passwordHash!,
          },
          transaction
        )
      } else if (flow.purpose === OtpPurpose.RESET_PASSWORD) {
        user = await User.query({ client: transaction }).where('phone', flow.phone).first()
      }

      return { result: 'valid', user }
    })
  }

  grantPasswordReset(session: Session, user: User): void {
    const grant: PasswordResetGrant = {
      userId: user.id,
      phone: user.phone,
      expiresAt: DateTime.now().plus({ minutes: 10 }).toISO()!,
    }
    session.put(PASSWORD_RESET_KEY, grant)
  }

  passwordResetGrant(session: Session): PasswordResetGrant | null {
    const grant = session.get(PASSWORD_RESET_KEY) as PasswordResetGrant | undefined
    if (!grant || DateTime.fromISO(grant.expiresAt) < DateTime.now()) {
      return null
    }
    return grant
  }

  forgetPasswordReset(session: Session): void {
    session.forget(PASSWORD_RESET_KEY)
  }
}
