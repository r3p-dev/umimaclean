import { inject } from '@adonisjs/core'
import { errors as authErrors } from '@adonisjs/auth'
import { RememberMeToken } from '@adonisjs/auth/session'
import limiter from '@adonisjs/limiter/services/main'
import { SessionCollection } from '@adonisjs/session'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { errors as vineErrors } from '@vinejs/vine'
import { DateTime } from 'luxon'
import User from '#models/user'
import ActivityLog from '#models/activity_log'
import { Role } from '#enums/role_enum'
import type { CreateSessionInput } from '#validators/auth'

export const SIGN_IN_FAILED_MESSAGE = 'Nomor atau kata sandi salah.'
export const INACTIVE_ACCOUNT_MESSAGE = 'Akun Anda dinonaktifkan. Hubungi kami untuk bantuan.'
export const PHONE_IN_USE_MESSAGE = 'Nomor ini sudah dipakai akun lain.'

// Failed attempts allowed per 15 minutes (ACC-3, ACC-4).
export const SIGN_IN_MAX_PHONE_FAILURES = 5
export const SIGN_IN_MAX_IP_FAILURES = 50
export const PASSWORD_CHANGE_MAX_FAILURES = 5
const FAILURE_WINDOW = '15 mins'

// The device a request comes from: its session and, when "Ingat saya" was used, its remember-me cookie.
export interface CurrentDevice {
  sessionId: string
  rememberMeToken?: string
}

function fieldError(field: string, message: string, rule: string): never {
  throw new vineErrors.E_VALIDATION_ERROR([{ field, message, rule }])
}

function waitMessage(seconds: number) {
  return `Coba lagi dalam ${Math.max(1, Math.ceil(seconds / 60))} menit.`
}

@inject()
export default class AccountService {
  constructor(protected sessions: SessionCollection) {}

  async createCustomer(
    data: { name: string; phone: string; passwordHash: string },
    transaction?: TransactionClientContract
  ): Promise<User> {
    return User.createQuietly(
      {
        fullName: data.name,
        phone: data.phone,
        password: data.passwordHash,
        role: Role.CUSTOMER,
        isActive: true,
      },
      { client: transaction }
    )
  }

  async verifyCustomerCredentials(input: CreateSessionInput, ip: string): Promise<User> {
    const user = await this.#checkSignInPassword(input, ip)

    if (user.role !== Role.CUSTOMER) {
      fieldError('phone', 'Akun staf dan pemilik silakan masuk melalui halaman masuk staf.', 'role')
    }

    return user
  }

  async verifyStaffCredentials(input: CreateSessionInput, ip: string): Promise<User> {
    const user = await this.#checkSignInPassword(input, ip)

    if (user.role === Role.CUSTOMER) {
      fieldError('phone', 'Akun pelanggan silakan masuk melalui halaman masuk pelanggan.', 'role')
    }

    return user
  }

  // Only wrong passwords count. A correct one clears the number's counter but not the IP's,
  // so one valid account can't reset the limit for guesses at other numbers.
  async #checkSignInPassword(input: CreateSessionInput, ip: string): Promise<User> {
    const ipLimiter = limiter.use({ requests: SIGN_IN_MAX_IP_FAILURES, duration: FAILURE_WINDOW })
    const ipKey = `sign_in_ip_${ip}`
    const ipState = await ipLimiter.get(ipKey)
    if (ipState && ipState.remaining <= 0) {
      fieldError(
        'phone',
        `Terlalu banyak percobaan masuk. ${waitMessage(ipState.availableIn)}`,
        'throttle'
      )
    }

    const phoneLimiter = limiter.use({
      requests: SIGN_IN_MAX_PHONE_FAILURES,
      duration: FAILURE_WINDOW,
    })
    const [throttled, user] = await phoneLimiter.penalize(
      `sign_in_phone_${input.phone}`,
      async () => {
        try {
          return await User.verifyCredentials(input.phone, input.password)
        } catch (error) {
          if (!(error instanceof authErrors.E_INVALID_CREDENTIALS)) {
            throw error
          }
          await ipLimiter.increment(ipKey)
          return fieldError('phone', SIGN_IN_FAILED_MESSAGE, 'credentials')
        }
      }
    )

    if (throttled) {
      fieldError(
        'phone',
        `Terlalu banyak percobaan masuk. ${waitMessage(throttled.response.availableIn)}`,
        'throttle'
      )
    }

    if (!user.isActive) {
      fieldError('phone', INACTIVE_ACCOUNT_MESSAGE, 'inactive')
    }

    return user
  }

  async logStaffSignIn(user: User): Promise<void> {
    user.lastSeenAt = DateTime.now()
    await user.save()

    await ActivityLog.create({
      userId: user.id,
      category: 'auth',
      action: 'sign_in',
      description: 'Masuk ke sistem',
      isSensitive: false,
    })
  }

  async changeName(user: User, name: string): Promise<void> {
    user.fullName = name
    await user.save()
  }

  async changePassword(user: User, currentPassword: string, newPassword: string): Promise<void> {
    const attempts = limiter.use({
      requests: PASSWORD_CHANGE_MAX_FAILURES,
      duration: FAILURE_WINDOW,
    })
    const [throttled] = await attempts.penalize(`password_change_${user.id}`, async () => {
      try {
        return await User.verifyCredentials(user.phone, currentPassword)
      } catch (error) {
        if (!(error instanceof authErrors.E_INVALID_CREDENTIALS)) {
          throw error
        }
        return fieldError('currentPassword', 'Kata sandi saat ini salah.', 'credentials')
      }
    })

    if (throttled) {
      fieldError(
        'currentPassword',
        `Terlalu banyak percobaan. ${waitMessage(throttled.response.availableIn)}`,
        'throttle'
      )
    }

    user.password = newPassword
    await user.save()
  }

  async resetPassword(userId: number, newPassword: string, device: CurrentDevice): Promise<User> {
    const user = await User.findOrFail(userId)
    user.password = newPassword
    await user.save()

    await this.signOutOtherDevices(user, device)
    return user
  }

  async changePhone(
    userId: number,
    phone: string,
    transaction: TransactionClientContract
  ): Promise<User> {
    if (await User.isPhoneTaken(phone, { exceptUserId: userId, client: transaction })) {
      fieldError('code', PHONE_IN_USE_MESSAGE, 'phone')
    }

    const user = await User.findOrFail(userId, { client: transaction })
    user.phone = phone
    await user.save()
    return user
  }

  // Active devices are the user's unexpired sessions (sessions are tagged with the user id at sign-in).
  async countActiveDevices(user: User): Promise<number> {
    const sessions = await this.sessions.tagged(String(user.id))
    return sessions.length
  }

  // Remember-me tokens go too, or the other devices would sign themselves back in (ACC-4, ACC-5).
  async signOutOtherDevices(user: User, device: CurrentDevice): Promise<void> {
    const currentTokenId = device.rememberMeToken
      ? RememberMeToken.decode(device.rememberMeToken)?.identifier
      : undefined

    const tokens = await User.rememberMeTokens.all(user)
    for (const token of tokens) {
      if (String(token.identifier) !== currentTokenId) {
        await User.rememberMeTokens.delete(user, token.identifier)
      }
    }

    const sessions = await this.sessions.tagged(String(user.id))
    for (const session of sessions) {
      if (session.id !== device.sessionId) {
        await this.sessions.destroy(session.id)
      }
    }
  }
}
