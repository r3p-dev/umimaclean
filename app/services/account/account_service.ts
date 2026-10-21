import limiter from '@adonisjs/limiter/services/main'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import { Role } from '#enums/role_enum'
import User from '#models/user'
import { isUniqueViolation } from '#services/database_service'
import { fieldError } from '#validators/shared/field_error'

export type PendingRegistration = { name: string; phone: string; passwordHash: string }

export default class AccountService {
  async createCustomer(pending: PendingRegistration, transaction: TransactionClientContract) {
    if (await this.isPhoneTaken(pending.phone, { transaction })) {
      return null
    }

    return User.createQuietly(
      {
        role: Role.CUSTOMER,
        name: pending.name,
        phone: pending.phone,
        password: pending.passwordHash,
        phoneVerifiedAt: DateTime.now(),
      },
      { client: transaction }
    )
  }

  async changePhone(userId: number, phone: string, transaction: TransactionClientContract) {
    const user = await User.query({ client: transaction })
      .where('id', userId)
      .forUpdate()
      .firstOrFail()

    if (await this.isPhoneTaken(phone, { exceptUserId: user.id, transaction })) {
      return null
    }

    user.merge({ phone, phoneVerifiedAt: DateTime.now() })

    try {
      await user.save()
    } catch (error) {
      if (isUniqueViolation(error)) {
        return null
      }

      throw error
    }

    return user
  }

  async updateProfile(user: User, profile: { name: string }) {
    user.merge(profile)
    await user.save()
  }

  async updatePassword(user: User, password: string) {
    user.merge({ password, passwordChangedAt: DateTime.now() })
    await user.save()
  }

  async changePassword(user: User, currentPassword: string, password: string) {
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

    await this.updatePassword(user, password)
  }

  async isPhoneTaken(
    phone: string,
    options: { exceptUserId?: number; transaction?: TransactionClientContract } = {}
  ) {
    const query = User.query({ client: options.transaction }).where('phone', phone)

    if (options.exceptUserId) {
      query.whereNot('id', options.exceptUserId)
    }

    const user = await query.first()
    return user !== null
  }

  #passwordChangeLimiter() {
    return limiter.use({ requests: 5, duration: '15 mins', blockDuration: '15 mins' })
  }
}
