import { BaseTransformer } from '@adonisjs/core/transformers'
import { Role } from '#enums/role_enum'
import { StaffShiftLabel, StaffTypeLabel } from '#enums/staff_enum'
import type User from '#models/user'
import { displayPhone } from '#services/phone_service'
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
    const role =
      user.role === Role.ADMIN
        ? ('Owner' as const)
        : user.staffType
          ? StaffTypeLabel[user.staffType]
          : ('Kurir & toko' as const)
    return {
      id: String(user.id),
      name: user.name,
      phone: displayPhone(user.phone).replace('+62 ', '0'),
      role,
      shift: user.shift ? StaffShiftLabel[user.shift] : ('Fleksibel' as const),
      active: user.isActive,
      lastSeen: user.lastSeenAt
        ? user.lastSeenAt.setZone(SERVICE_ZONE).setLocale('id').toFormat('d LLL · HH.mm')
        : 'Belum masuk',
      isSelf: user.id === this.currentId,
    }
  }
}
