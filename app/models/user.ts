import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { UserSchema } from '#database/schema'
import { Role, RoleLabel } from '#enums/role_enum'
import { StaffShiftLabel, StaffTypeLabel } from '#enums/staff_enum'
import CustomerAddress from '#models/customer_address'
import Order from '#models/order'

const AuthFinder = withAuthFinder(hash, {
  uids: ['phone'],
  passwordColumnName: 'password',
})

export default class User extends compose(UserSchema, AuthFinder) {
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

  @hasMany(() => Order)
  declare orders: HasMany<typeof Order>

  @hasMany(() => CustomerAddress)
  declare addresses: HasMany<typeof CustomerAddress>

  firstName() {
    return this.name.trim().split(/\s+/)[0] ?? ''
  }

  isCustomer() {
    return this.role === Role.CUSTOMER
  }

  isOwner() {
    return this.role === Role.ADMIN
  }

  roleLabel() {
    const parts: string[] = [RoleLabel[this.role]]
    if (this.staffType) {
      parts.push(StaffTypeLabel[this.staffType].toLowerCase())
    }
    if (this.shift) {
      parts.push(`shift ${StaffShiftLabel[this.shift].toLowerCase()}`)
    }
    return parts.join(' · ')
  }
}
