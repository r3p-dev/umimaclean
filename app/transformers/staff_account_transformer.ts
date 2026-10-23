import { BaseTransformer } from '@adonisjs/core/transformers'
import { Role } from '#enums/role_enum'
import type User from '#models/user'
import { displayPhone } from '#helpers/phone'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

export default class StaffAccountTransformer extends BaseTransformer<User> {
  constructor(
    resource: User,
    protected currentId: number
  ) {
    super(resource)
  }

  toObject() {
    const user = this.resource
    return {
      id: String(user.id),
      name: user.name,
      phone: displayPhone(user.phone).replace('+62 ', '0'),
      role: user.role === Role.ADMIN ? Role.ADMIN : Role.STAFF,
      active: user.isActive,
      lastSeen: user.lastSeenAt
        ? user.lastSeenAt.setZone(SERVICE_ZONE).setLocale('id').toFormat('d LLL · HH.mm')
        : 'Belum masuk',
      isSelf: user.id === this.currentId,
    }
  }
}
