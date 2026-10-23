import { errors as authErrors } from '@adonisjs/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as limiterErrors } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'
import { SessionCollection } from '@adonisjs/session'
import { DateTime } from 'luxon'
import User from '#models/user'
import { fieldError } from '#validators/shared/field_error'

export const LOGIN_FAILED_MESSAGE = 'Nomor atau kata sandi salah.'

@inject()
export default class AccountService {
  constructor(protected sessions: SessionCollection) {}

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

  async activeDeviceCount(user: User) {
    const now = DateTime.now().toJSDate()
    const tokens = await User.rememberMeTokens.all(user)

    return Math.max(1, tokens.filter((token) => token.expiresAt > now).length)
  }

  async changePasswordWithCurrent(
    ctx: HttpContext,
    user: User,
    currentPassword: string,
    password: string
  ) {
    const [throttled, isVerified] = await this.#passwordChangeLimiter().penalize(
      `password_change_${user.id}`,
      async () => {
        if (!(await user.verifyPassword(currentPassword))) {
          throw fieldError('currentPassword', 'Kata sandi saat ini salah.', 'password.current')
        }

        return true
      }
    )

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

  async resetPasswordAfterOtp(
    ctx: HttpContext,
    user: User,
    password: string,
    shouldEndOthers: boolean
  ) {
    await this.#savePassword(user, password)
    if (shouldEndOthers) {
      await this.endSessions(user, ctx.session.sessionId)
    }
    await this.signIn(ctx, user, true)
  }

  async signOutOtherDevices(ctx: HttpContext, user: User) {
    await this.endSessions(user, ctx.session.sessionId)
    await this.signIn(ctx, user, true)
  }

  async #savePassword(user: User, password: string) {
    user.merge({ password, passwordChangedAt: DateTime.now() })
    await user.save()
  }

  #loginLimiter(phone: string, ip: string) {
    return limiter.multi([
      { key: `login_phone_${phone}`, requests: 5, duration: '15 mins', blockDuration: '15 mins' },
      { key: `login_ip_${ip}`, requests: 20, duration: '15 mins', blockDuration: '30 mins' },
    ])
  }

  #passwordChangeLimiter() {
    return limiter.use({ requests: 5, duration: '15 mins', blockDuration: '15 mins' })
  }
}
