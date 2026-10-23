import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { errors } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import { MessageStatus } from '#enums/message_enum'
import { OtpPurpose } from '#enums/otp_enum'
import { Role } from '#enums/role_enum'
import OtpCode, { OTP_MAX_ATTEMPTS } from '#models/otp_code'
import User from '#models/user'
import FonnteService from '#services/fonnte_service'
import env from '#start/env'
import { fieldError } from '#validators/shared/field_error'

export const OTP_LENGTH = 6
export const OTP_TTL_MINUTES = 5
const OTP_RESEND_SECONDS = 60
const OTP_PHONE_HOURLY_LIMIT = 5
const OTP_IP_HOURLY_LIMIT = 20

type OtpIssueResult =
  { status: 'sent' } | { status: 'failed' } | { status: 'cooldown' | 'limited'; retryIn: number }

type OtpCheckResult = 'valid' | 'invalid' | 'locked'

export const OTP_LOCKED_MESSAGE = 'Kode salah 5 kali. Minta kode baru.'
export const OTP_INVALID_MESSAGE = 'Kode salah atau sudah kedaluwarsa.'
export const PHONE_TAKEN_MESSAGE = 'Nomor ini sudah dipakai akun lain.'

const FLOW_KEY = 'otp_flow'
const PASSWORD_RESET_KEY = 'password_reset'
const PASSWORD_RESET_MINUTES = 10

type PasswordResetGrant = { userId: number; phone: string; expiresAt: string }

export type OtpFlow = {
  purpose: OtpPurpose
  phone: string
  failures: number
  name?: string
  passwordHash?: string
  userId?: number
}

type Session = HttpContext['session']

@inject()
export default class OtpService {
  constructor(protected fonnte: FonnteService) {}

  current(session: Session): OtpFlow | null {
    const flow = session.get(FLOW_KEY) as OtpFlow | undefined
    return flow?.phone && flow.purpose ? flow : null
  }

  isLocked(flow: OtpFlow) {
    return flow.failures >= OTP_MAX_ATTEMPTS
  }

  async start(session: Session, flow: OtpFlow, ip: string, shouldDeliver = true) {
    const result = await this.#issue(flow.phone, flow.purpose, { ip, shouldDeliver })
    const existing = this.current(session)
    const isResumable =
      result.status === 'cooldown' &&
      existing?.phone === flow.phone &&
      existing.purpose === flow.purpose
    if (!isResumable) {
      this.#assertIssued(result, 'phone', flow.purpose)
    }

    session.put(FLOW_KEY, { ...flow, failures: isResumable ? existing.failures : 0 })
  }

  async resend(session: Session, flow: OtpFlow, ip: string) {
    const shouldDeliver =
      flow.purpose !== OtpPurpose.RESET_PASSWORD || (await User.isPhoneTaken(flow.phone))
    const result = await this.#issue(flow.phone, flow.purpose, { ip, shouldDeliver })
    this.#assertIssued(result, 'code', flow.purpose)
    session.put(FLOW_KEY, { ...flow, failures: 0 })
  }

  async verify(flow: OtpFlow, code: string) {
    return db.transaction(async (transaction) => {
      const result = await this.#check(flow.phone, flow.purpose, code, transaction)
      if (result !== 'valid') {
        return { result, user: null }
      }

      return { result, user: await this.#complete(flow, transaction) }
    })
  }

  recordFailure(session: Session, flow: OtpFlow, isLocked: boolean) {
    const failures = isLocked ? OTP_MAX_ATTEMPTS : flow.failures + 1
    session.put(FLOW_KEY, { ...flow, failures })
    return failures >= OTP_MAX_ATTEMPTS ? OTP_LOCKED_MESSAGE : OTP_INVALID_MESSAGE
  }

  clear(session: Session) {
    session.forget(FLOW_KEY)
  }

  grantPasswordReset(session: Session, user: User) {
    const grant: PasswordResetGrant = {
      userId: user.id,
      phone: user.phone,
      expiresAt: DateTime.now().plus({ minutes: PASSWORD_RESET_MINUTES }).toISO()!,
    }
    session.put(PASSWORD_RESET_KEY, grant)
  }

  passwordResetGrant(session: Session) {
    const grant = session.get(PASSWORD_RESET_KEY) as PasswordResetGrant | undefined
    if (!grant || DateTime.fromISO(grant.expiresAt) < DateTime.now()) {
      return null
    }

    return grant
  }

  forgetPasswordReset(session: Session) {
    session.forget(PASSWORD_RESET_KEY)
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
  async #issue(
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

  async #check(
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

  async #complete(flow: OtpFlow, transaction: TransactionClientContract) {
    if (flow.purpose === OtpPurpose.RESET_PASSWORD) {
      return User.query({ client: transaction }).where('phone', flow.phone).firstOrFail()
    }

    const user =
      flow.purpose === OtpPurpose.REGISTER
        ? await this.#createCustomer(flow, transaction)
        : await this.#changePhone(flow.userId!, flow.phone, transaction)
    if (!user) {
      throw fieldError('code', PHONE_TAKEN_MESSAGE, 'phone.taken')
    }

    return user
  }

  async #createCustomer(flow: OtpFlow, transaction: TransactionClientContract) {
    if (await User.isPhoneTaken(flow.phone, { transaction })) {
      return null
    }

    return User.createQuietly(
      {
        role: Role.CUSTOMER,
        name: flow.name!,
        phone: flow.phone,
        password: flow.passwordHash!,
        phoneVerifiedAt: DateTime.now(),
      },
      { client: transaction }
    )
  }

  async #changePhone(userId: number, phone: string, transaction: TransactionClientContract) {
    const user = await User.query({ client: transaction })
      .where('id', userId)
      .forUpdate()
      .firstOrFail()

    if (await User.isPhoneTaken(phone, { exceptUserId: user.id, transaction })) {
      return null
    }

    user.merge({ phone, phoneVerifiedAt: DateTime.now() })

    try {
      await user.save()
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        String(error.code) === '23505'
      ) {
        return null
      }

      throw error
    }

    return user
  }

  #assertIssued(result: OtpIssueResult, field: string, purpose: OtpPurpose) {
    if (result.status === 'sent') {
      return
    }

    if (result.status === 'cooldown') {
      throw fieldError(
        field,
        `Tunggu ${result.retryIn} detik sebelum meminta kode baru.`,
        'otp.cooldown'
      )
    }

    if (result.status === 'limited') {
      const minutes = Math.max(1, Math.ceil(result.retryIn / 60))
      throw fieldError(
        field,
        `Terlalu banyak permintaan kode. Coba lagi dalam ${minutes} menit.`,
        'otp.limited'
      )
    }

    if (purpose === OtpPurpose.RESET_PASSWORD) {
      logger.warn('Password reset code could not be delivered')
      return
    }

    throw fieldError(
      field,
      'Kode gagal dikirim ke WhatsApp. Coba lagi sebentar lagi.',
      'otp.failed'
    )
  }
}
