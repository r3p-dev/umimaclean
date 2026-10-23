import { randomBytes } from 'node:crypto'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import { ActivityAction } from '#enums/activity_enum'
import { MessagePurpose } from '#enums/message_enum'
import { Role, STAFF_ROLES } from '#enums/role_enum'
import { StaffShift, StaffType } from '#enums/staff_enum'
import ActivityLog from '#models/activity_log'
import User from '#models/user'
import AccountService from '#services/account/account_service'
import AccountSessionService from '#services/account/account_session_service'
import NotificationService from '#services/notification_service'
import env from '#start/env'
import type { StaffPayload } from '#validators/admin/staff'
import { fieldError } from '#validators/shared/field_error'

const ROLE_OF = {
  'Kurir & toko': { role: Role.STAFF, staffType: StaffType.COURIER_STORE },
  'Workshop': { role: Role.STAFF, staffType: StaffType.WORKSHOP },
  'Owner': { role: Role.ADMIN, staffType: null },
} as const

const SHIFT_OF = {
  Pagi: StaffShift.MORNING,
  Siang: StaffShift.AFTERNOON,
  Fleksibel: StaffShift.FLEXIBLE,
} as const

export function temporaryPassword() {
  return randomBytes(9).toString('base64url')
}

@inject()
export default class StaffAccountService {
  constructor(
    protected accounts: AccountService,
    protected sessions: AccountSessionService,
    protected notifications: NotificationService
  ) {}

  list() {
    return User.query()
      .whereIn('role', [...STAFF_ROLES])
      .orderBy('role', 'asc')
      .orderBy('name')
  }

  async create(owner: User, payload: StaffPayload) {
    if (await this.accounts.isPhoneTaken(payload.phone)) {
      throw fieldError('phone', 'Nomor ini sudah dipakai akun lain.', 'phone.taken')
    }
    const password = temporaryPassword()
    const user = await User.create({
      name: payload.name,
      phone: payload.phone,
      password,
      ...ROLE_OF[payload.role],
      shift: SHIFT_OF[payload.shift],
      isActive: true,
      phoneVerifiedAt: null,
    })
    await ActivityLog.record({
      actor: owner,
      action: ActivityAction.STAFF_CHANGED,
      detail: `Menambah akun ${user.name} (${payload.role})`,
      isSensitive: true,
    })
    const notice = await this.#sendPassword(user, password, true)
    return { user, password, notice }
  }

  async update(owner: User, user: User, payload: StaffPayload) {
    if (await this.accounts.isPhoneTaken(payload.phone, { exceptUserId: user.id })) {
      throw fieldError('phone', 'Nomor ini sudah dipakai akun lain.', 'phone.taken')
    }
    const target = ROLE_OF[payload.role]
    if (user.id === owner.id && target.role !== Role.ADMIN) {
      throw fieldError('role', 'Anda tidak bisa menurunkan peran akun sendiri.', 'role.self')
    }
    user.merge({
      name: payload.name,
      phone: payload.phone,
      ...target,
      shift: SHIFT_OF[payload.shift],
    })
    await user.save()
    await ActivityLog.record({
      actor: owner,
      action: ActivityAction.STAFF_CHANGED,
      detail: `Mengubah akun ${user.name} (${payload.role})`,
      isSensitive: true,
    })
  }

  async resetPassword(owner: User, user: User) {
    if (user.id === owner.id) {
      throw fieldError('form', 'Ganti kata sandi Anda sendiri di halaman Profil.', 'staff.self')
    }
    const password = temporaryPassword()
    await this.accounts.updatePassword(user, password)
    await this.sessions.endAllSessions(user)
    await ActivityLog.record({
      actor: owner,
      action: ActivityAction.STAFF_CHANGED,
      detail: `Mereset kata sandi ${user.name}`,
      isSensitive: true,
    })
    const notice = await this.#sendPassword(user, password, false)
    return { password, notice }
  }

  async setActive(owner: User, user: User, isActive: boolean) {
    if (user.id === owner.id) {
      throw fieldError('form', 'Anda tidak bisa menonaktifkan akun sendiri.', 'staff.self')
    }
    user.merge({ isActive })
    await user.save()
    if (!isActive) {
      await this.sessions.endAllSessions(user)
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

  #sendPassword(user: User, password: string, isNew: boolean) {
    const login = `${env.get('APP_URL')}/staf/masuk`
    return this.notifications.toUser(
      user,
      MessagePurpose.STAFF_PASSWORD,
      `${isNew ? 'Akun staf Umima Clean Anda sudah dibuat.' : 'Kata sandi akun staf Umima Clean Anda direset.'} Masuk di ${login} dengan nomor ini dan kata sandi sementara: ${password}\nSegera ganti kata sandi di menu Profil.`
    )
  }
}
