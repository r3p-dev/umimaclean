import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { errors } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { MessageStatus } from '#enums/message_enum'
import { OtpPurpose } from '#enums/otp_enum'
import OtpCode, { OTP_MAX_ATTEMPTS } from '#models/otp_code'
import User from '#models/user'
import FonnteService from '#services/fonnte_service'
import env from '#start/env'
import { fieldError } from '#validators/shared/field_error'
import AccountService from '#services/account_service'
import type {
  OtpFlow,
  Session,
  PasswordResetGrant,
  OtpIssueResult,
  OtpCheckResult,
} from '#services/types'
import {
  OTP_INVALID_MESSAGE,
  OTP_LOCKED_MESSAGE,
  OTP_TTL_MINUTES,
  PASSWORD_RESET_KEY,
  PHONE_TAKEN_MESSAGE,
} from '#services/constants'

const FLOW_KEY = 'otp_flow'
const OTP_LENGTH = 6

@inject()
export default class OtpService {
  constructor(
    protected fonnte: FonnteService,
    protected accounts: AccountService
  ) {}

  async startRegistration(
    session: Session,
    input: { name: string; phone: string; password: string },
    ip: string
  ) {
    if (await User.isPhoneTaken(input.phone)) {
      throw fieldError(
        'phone',
        'Nomor ini sudah terdaftar. Masuk atau atur ulang kata sandi.',
        'phone.taken'
      )
    }

    await this.#start(
      session,
      {
        purpose: OtpPurpose.REGISTER,
        phone: input.phone,
        name: input.name,
        passwordHash: await hash.make(input.password),
        failures: 0,
      },
      ip
    )
  }

  async startPasswordReset(session: Session, phone: string, ip: string) {
    await this.#start(
      session,
      { purpose: OtpPurpose.RESET_PASSWORD, phone, failures: 0 },
      ip,
      await User.isPhoneTaken(phone)
    )
  }

  async startPhoneChange(session: Session, user: User, phone: string, ip: string) {
    if (phone === user.phone) {
      throw fieldError('phone', 'Ini nomor Anda saat ini. Isi nomor baru.', 'phone.same')
    }

    if (await User.isPhoneTaken(phone, { exceptUserId: user.id })) {
      throw fieldError('phone', PHONE_TAKEN_MESSAGE, 'phone.taken')
    }

    await this.#start(
      session,
      { purpose: OtpPurpose.CHANGE_PHONE, phone, userId: user.id, failures: 0 },
      ip
    )
  }

  async #start(session: Session, flow: OtpFlow, ip: string, shouldDeliver = true) {
    const result = await this.#issue(flow.phone, flow.purpose, { ip, shouldDeliver })
    const existing = this.currentOtpFlow(session)

    const isResumable =
      result.status === 'cooldown' &&
      existing?.phone === flow.phone &&
      existing.purpose === flow.purpose
    if (!isResumable) {
      this.#assertIssued(result, 'phone', flow.purpose)
    }

    session.put(FLOW_KEY, { ...flow, failures: isResumable ? existing.failures : 0 })
  }

  currentOtpFlow(session: Session): OtpFlow | null {
    const flow = session.get(FLOW_KEY) as OtpFlow | undefined
    return flow?.phone && flow.purpose ? flow : null
  }

  async resendOtp(session: Session, flow: OtpFlow, ip: string) {
    const shouldDeliver =
      flow.purpose !== OtpPurpose.RESET_PASSWORD || (await User.isPhoneTaken(flow.phone))
    const result = await this.#issue(flow.phone, flow.purpose, { ip, shouldDeliver })
    this.#assertIssued(result, 'code', flow.purpose)

    session.put(FLOW_KEY, { ...flow, failures: 0 })
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

    const delivery = await this.fonnte.sendMessage(
      phone,
      `Kode verifikasi Umima Clean: ${code}. Berlaku ${OTP_TTL_MINUTES} menit. Jangan berikan kode ini ke siapa pun.`
    )
    if (delivery !== MessageStatus.FAILED) {
      return { status: 'sent' }
    }

    await otp.delete()

    return { status: 'failed' }
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

  async otpCooldownRemaining(phone: string) {
    return this.#cooldownLimiter().availableIn(`otp_cooldown_${phone}`)
  }

  #cooldownLimiter() {
    return limiter.use({
      requests: 1,
      duration: '1 min',
      blockDuration: '1 min',
    })
  }

  #phoneLimiter() {
    return limiter.use({ requests: 5, duration: '1 hour' })
  }

  #ipLimiter() {
    return limiter.use({ requests: 20, duration: '1 hour' })
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

  isOtpLocked(flow: OtpFlow) {
    return flow.failures >= OTP_MAX_ATTEMPTS
  }

  async verifyOtp(flow: OtpFlow, code: string) {
    return db.transaction(async (transaction) => {
      const result = await this.#check(flow.phone, flow.purpose, code, transaction)
      if (result !== 'valid') {
        return { result, user: null }
      }

      return { result, user: await this.#complete(flow, transaction) }
    })
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

  #sameHash(left: string, right: string) {
    const leftBytes = Buffer.from(left, 'hex')
    const rightBytes = Buffer.from(right, 'hex')
    return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes)
  }

  #hashCode(phone: string, purpose: OtpPurpose, code: string) {
    const APP_KEY = env.get('APP_KEY').release()
    return createHmac('sha256', APP_KEY).update(`${purpose}:${phone}:${code}`).digest('hex')
  }

  async #complete(flow: OtpFlow, transaction: TransactionClientContract) {
    if (flow.purpose === OtpPurpose.RESET_PASSWORD) {
      return User.query({ client: transaction }).where('phone', flow.phone).firstOrFail()
    }

    const user =
      flow.purpose === OtpPurpose.REGISTER
        ? await this.accounts.createCustomer(flow, transaction)
        : await this.accounts.changePhone(flow.userId!, flow.phone, transaction)
    if (!user) {
      throw fieldError('code', PHONE_TAKEN_MESSAGE, 'phone.taken')
    }

    return user
  }

  recordOtpFailure(session: Session, flow: OtpFlow, isLocked: boolean) {
    const failures = isLocked ? OTP_MAX_ATTEMPTS : flow.failures + 1
    session.put(FLOW_KEY, { ...flow, failures })
    return failures >= OTP_MAX_ATTEMPTS ? OTP_LOCKED_MESSAGE : OTP_INVALID_MESSAGE
  }

  clearOtpFlow(session: Session) {
    session.forget(FLOW_KEY)
  }

  grantPasswordReset(session: Session, user: User) {
    const grant: PasswordResetGrant = {
      userId: user.id,
      phone: user.phone,
      expiresAt: DateTime.now().plus({ minutes: 10 }).toISO()!,
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
}
