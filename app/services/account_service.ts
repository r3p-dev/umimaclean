import User from '#models/user'
import ActivityLog from '#models/activity_log'
import { DateTime } from 'luxon'
import { Role } from '#enums/role_enum'
import type { CreateSessionInput } from '#validators/auth'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import db from '@adonisjs/lucid/services/db'

export class InactiveAccountException extends Error {
  constructor(message = 'Akun Anda dinonaktifkan. Hubungi kami untuk bantuan.') {
    super(message)
    this.name = 'InactiveAccountException'
  }
}

export class RoleMismatchException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RoleMismatchException'
  }
}

export default class AccountService {
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

  async resetPassword(
    userId: number,
    newPassword: string,
    exceptSessionId?: string
  ): Promise<User> {
    const user = await User.findOrFail(userId)
    user.password = newPassword
    await user.save()

    await this.signOutOtherDevices(user, exceptSessionId)
    return user
  }

  async signOutOtherDevices(user: User, exceptSessionId?: string): Promise<void> {
    const tokens = await User.rememberMeTokens.all(user)
    await Promise.all(tokens.map((token) => User.rememberMeTokens.delete(user, token.identifier)))

    const query = db.from('sessions').where('user_id', String(user.id))
    if (exceptSessionId) {
      query.whereNot('id', exceptSessionId)
    }
    await query.delete()
  }

  async verifyCustomerCredentials(input: CreateSessionInput): Promise<User> {
    const user = await User.verifyCredentials(input.phone, input.password)

    if (!user.isActive) {
      throw new InactiveAccountException()
    }

    if (user.role !== Role.CUSTOMER) {
      throw new RoleMismatchException(
        'Akun staf dan pemilik silakan masuk melalui halaman masuk staf.'
      )
    }

    return user
  }

  async verifyStaffCredentials(input: CreateSessionInput): Promise<User> {
    const user = await User.verifyCredentials(input.phone, input.password)

    if (!user.isActive) {
      throw new InactiveAccountException()
    }

    if (user.role === Role.CUSTOMER) {
      throw new RoleMismatchException(
        'Akun pelanggan silakan masuk melalui halaman masuk pelanggan.'
      )
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
}
