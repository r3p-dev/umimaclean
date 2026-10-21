import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import { OtpPurpose } from '#enums/otp_enum'
import { OTP_MAX_ATTEMPTS } from '#models/otp_code'
import User from '#models/user'
import AccountService from '#services/account/account_service'
import OtpService, { type OtpIssueResult } from '#services/otp/otp_service'
import { fieldError } from '#validators/shared/field_error'

export const OTP_LOCKED_MESSAGE = 'Kode salah 5 kali. Minta kode baru.'
export const OTP_INVALID_MESSAGE = 'Kode salah atau sudah kedaluwarsa.'
export const PHONE_TAKEN_MESSAGE = 'Nomor ini sudah dipakai akun lain.'

const FLOW_KEY = 'otp_flow'
const PASSWORD_RESET_KEY = 'password_reset'
const PASSWORD_RESET_MINUTES = 10

export type PasswordResetGrant = { userId: number; phone: string; expiresAt: string }

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
export default class OtpFlowService {
  constructor(
    protected otp: OtpService,
    protected accounts: AccountService
  ) {}

  current(session: Session): OtpFlow | null {
    const flow = session.get(FLOW_KEY) as OtpFlow | undefined
    return flow?.phone && flow.purpose ? flow : null
  }

  isLocked(flow: OtpFlow) {
    return flow.failures >= OTP_MAX_ATTEMPTS
  }

  async start(session: Session, flow: OtpFlow, ip: string, shouldDeliver = true) {
    const result = await this.otp.issue(flow.phone, flow.purpose, { ip, shouldDeliver })
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
      flow.purpose !== OtpPurpose.RESET_PASSWORD || (await this.accounts.isPhoneTaken(flow.phone))
    const result = await this.otp.issue(flow.phone, flow.purpose, { ip, shouldDeliver })
    this.#assertIssued(result, 'code', flow.purpose)
    session.put(FLOW_KEY, { ...flow, failures: 0 })
  }

  async verify(flow: OtpFlow, code: string) {
    return db.transaction(async (transaction) => {
      const result = await this.otp.check(flow.phone, flow.purpose, code, transaction)
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

  async #complete(flow: OtpFlow, transaction: TransactionClientContract) {
    if (flow.purpose === OtpPurpose.RESET_PASSWORD) {
      return User.query({ client: transaction }).where('phone', flow.phone).firstOrFail()
    }

    const user =
      flow.purpose === OtpPurpose.REGISTER
        ? await this.accounts.createCustomer(
            { name: flow.name!, phone: flow.phone, passwordHash: flow.passwordHash! },
            transaction
          )
        : await this.accounts.changePhone(flow.userId!, flow.phone, transaction)
    if (!user) {
      throw fieldError('code', PHONE_TAKEN_MESSAGE, 'phone.taken')
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
