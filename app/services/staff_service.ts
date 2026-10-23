import { randomBytes } from 'node:crypto'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import { ActivityAction } from '#enums/activity_enum'
import { Role, RoleLabel, STAFF_ROLES } from '#enums/role_enum'
import ActivityLog from '#models/activity_log'
import User from '#models/user'
import AccountService from '#services/account_service'
import type { StaffPayload } from '#validators/admin/staff'
import { fieldError } from '#validators/shared/field_error'

function temporaryPassword() {
  return randomBytes(9).toString('base64url')
}

@inject()
export default class StaffService {
  constructor(protected accounts: AccountService) {}

  list() {
    return User.query()
      .whereIn('role', [...STAFF_ROLES])
      .orderBy('role', 'asc')
      .orderBy('name')
  }

  async create(owner: User, payload: StaffPayload) {
    if (await User.isPhoneTaken(payload.phone)) {
      throw fieldError('phone', 'Nomor ini sudah dipakai akun lain.', 'phone.taken')
    }
    const password = temporaryPassword()
    const user = await User.create({
      name: payload.name,
      phone: payload.phone,
      password,
      role: payload.role,
      isActive: true,
      phoneVerifiedAt: null,
    })
    await ActivityLog.record({
      actor: owner,
      action: ActivityAction.STAFF_CHANGED,
      detail: `Menambah akun ${user.name} (${RoleLabel[payload.role]})`,
      isSensitive: true,
    })
    return { user, password }
  }

  async update(owner: User, user: User, payload: StaffPayload) {
    if (await User.isPhoneTaken(payload.phone, { exceptUserId: user.id })) {
      throw fieldError('phone', 'Nomor ini sudah dipakai akun lain.', 'phone.taken')
    }
    if (user.id === owner.id && payload.role !== Role.ADMIN) {
      throw fieldError('role', 'Anda tidak bisa menurunkan peran akun sendiri.', 'role.self')
    }
    user.merge({
      name: payload.name,
      phone: payload.phone,
      role: payload.role,
    })
    await user.save()
    await ActivityLog.record({
      actor: owner,
      action: ActivityAction.STAFF_CHANGED,
      detail: `Mengubah akun ${user.name} (${RoleLabel[payload.role]})`,
      isSensitive: true,
    })
  }

  async resetPassword(owner: User, user: User) {
    if (user.id === owner.id) {
      throw fieldError('form', 'Ganti kata sandi Anda sendiri di halaman Profil.', 'staff.self')
    }
    const password = temporaryPassword()
    user.merge({ password, passwordChangedAt: null })
    await user.save()
    await this.accounts.endSessions(user)
    await ActivityLog.record({
      actor: owner,
      action: ActivityAction.STAFF_CHANGED,
      detail: `Mereset kata sandi ${user.name}`,
      isSensitive: true,
    })
    return { password }
  }

  async setActive(owner: User, user: User, isActive: boolean) {
    if (user.id === owner.id) {
      throw fieldError('form', 'Anda tidak bisa menonaktifkan akun sendiri.', 'staff.self')
    }
    user.merge({ isActive })
    await user.save()
    if (!isActive) {
      await this.accounts.endSessions(user)
    }
    await ActivityLog.record({
      actor: owner,
      action: ActivityAction.STAFF_CHANGED,
      detail: `${isActive ? 'Mengaktifkan' : 'Menonaktifkan'} akun ${user.name}`,
      isSensitive: true,
    })
  }

  async touch(user: User) {
    user.lastSeenAt = DateTime.now()
    await user.save()
    await ActivityLog.record({ actor: user, action: ActivityAction.SIGNED_IN })
  }
}
