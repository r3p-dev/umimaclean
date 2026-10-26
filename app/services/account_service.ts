import { errors as authErrors } from '@adonisjs/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as limiterErrors } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'
import { SessionCollection } from '@adonisjs/session'
import { DateTime } from 'luxon'
import User from '#models/user'
import { fieldError } from '#validators/shared/field_error'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { Role } from '#enums/role_enum'
import type { OtpFlow } from '#services/types'
import { LOGIN_FAILED_MESSAGE } from '#services/constants'

@inject()
export default class AccountService {
  constructor(protected sessions: SessionCollection) {}

  async createCustomer(flow: OtpFlow, transaction: TransactionClientContract) {
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

  async authenticate(
    phone: string,
    password: string,
    ip: string,
    canSignIn: (user: User) => Promise<boolean>
  ) {
    try {
      const [throttled, user] = await this.#loginLimiter(phone, ip).penalize(async () => {
        const found = await User.verifyCredentials(phone, password)
        if (!(await canSignIn(found))) {
          throw new authErrors.E_INVALID_CREDENTIALS(LOGIN_FAILED_MESSAGE)
        }

        return found
      })

      if (throttled) {
        throw throttled
      }

      return user
    } catch (error) {
      if (error instanceof limiterErrors.ThrottleException) {
        const minutes = Math.max(1, Math.ceil(error.response.availableIn / 60))
        throw fieldError(
          'password',
          `Terlalu banyak percobaan masuk. Coba lagi dalam ${minutes} menit.`,
          'login.throttled'
        )
      }

      if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
        throw fieldError('password', LOGIN_FAILED_MESSAGE, 'login.invalid')
      }

      throw error
    }
  }

  #loginLimiter(phone: string, ip: string) {
    return limiter.multi([
      { key: `login_phone_${phone}`, requests: 5, duration: '15 mins', blockDuration: '15 mins' },
      { key: `login_ip_${ip}`, requests: 20, duration: '15 mins', blockDuration: '30 mins' },
    ])
  }

  async signIn({ auth, session }: HttpContext, user: User, shouldRemember: boolean) {
    await auth.use('web').login(user, shouldRemember)
    if (session.supportsTagging()) {
      await session.tag(String(user.id))
    }
  }

  async signOut({ auth, session }: HttpContext) {
    const user = auth.use('web').user
    if (user && session.supportsTagging()) {
      await session.untag(String(user.id))
    }

    await auth.use('web').logout()
  }

  async activeDeviceCount(user: User) {
    const now = DateTime.now().toJSDate()
    const tokens = await User.rememberMeTokens.all(user)

    return Math.max(1, tokens.filter((token) => token.expiresAt > now).length)
  }

  async endSessions(user: User, exceptSessionId?: string) {
    const tokens = await User.rememberMeTokens.all(user)
    await Promise.all(tokens.map((token) => User.rememberMeTokens.delete(user, token.identifier)))

    if (this.sessions.supportsTagging()) {
      const tagged = await this.sessions.tagged(String(user.id))
      await Promise.all(
        tagged
          .filter((taggedSession) => taggedSession.id !== exceptSessionId)
          .map((taggedSession) => this.sessions.destroy(taggedSession.id))
      )
    }
  }

  async signOutOtherDevices(ctx: HttpContext, user: User) {
    await this.endSessions(user, ctx.session.sessionId)
    await this.signIn(ctx, user, true)
  }

  async updateProfileName(user: User, name: string) {
    await user.merge({ name }).save()
  }

  async changePasswordWithCurrent(
    ctx: HttpContext,
    user: User,
    currentPassword: string,
    password: string
  ) {
    const [throttled, isVerified] = await this.#passwordChangeLimiter(user).penalize(async () => {
      if (!(await user.verifyPassword(currentPassword))) {
        throw fieldError('currentPassword', 'Kata sandi saat ini salah.', 'password.current')
      }

      return true
    })

    if (throttled || !isVerified) {
      throw fieldError(
        'currentPassword',
        'Terlalu banyak percobaan. Coba lagi dalam 15 menit.',
        'password.throttled'
      )
    }

    await this.#savePassword(user, password)
    await this.endSessions(user, ctx.session.sessionId)
    await this.signIn(ctx, user, true)
  }

  #passwordChangeLimiter(user: User) {
    return limiter.multi([
      {
        key: `password_change_${user.id}`,
        requests: 5,
        duration: '15 mins',
        blockDuration: '15 mins',
      },
    ])
  }

  async resetPasswordAfterOtp(
    ctx: HttpContext,
    userId: number,
    password: string,
    shouldEndOthers: boolean
  ) {
    const user = await User.findOrFail(userId)
    await this.#savePassword(user, password)

    if (shouldEndOthers) {
      await this.endSessions(user, ctx.session.sessionId)
    }

    await this.signIn(ctx, user, true)
    return user
  }

  async #savePassword(user: User, password: string) {
    await user.merge({ password, passwordChangedAt: DateTime.now() }).save()
  }

  async changePhone(userId: number, phone: string, transaction: TransactionClientContract) {
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
}
