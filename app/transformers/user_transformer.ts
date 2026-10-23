import { BaseTransformer } from '@adonisjs/core/transformers'
import type User from '#models/user'
import { displayPhone, maskPhone } from '#helpers/phone'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      name: this.resource.name,
      firstName: this.resource.firstName(),
      role: this.resource.role,
      roleLabel: this.resource.roleLabel(),
      phone: displayPhone(this.resource.phone),
      maskedPhone: maskPhone(this.resource.phone),
      joinedOn: this.resource.createdAt.setZone(SERVICE_ZONE).toISODate() ?? '',
      passwordChangedOn: this.resource.passwordChangedAt?.setZone(SERVICE_ZONE).toISODate() ?? null,
    }
  }
}
