import User from '#models/user'
import ActivityLog from '#models/activity_log'
import { DateTime } from 'luxon'
import { Role } from '#enums/role_enum'
import type { CreateSessionInput } from '#validators/auth'

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
