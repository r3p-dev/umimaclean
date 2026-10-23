import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { hasMany } from '@adonisjs/lucid/orm'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { UserSchema } from '#database/schema'
import { Role, RoleLabel } from '#enums/role_enum'
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

  static findCustomerByPhone(phone: string) {
    return User.query().where('phone', phone).where('role', Role.CUSTOMER).first()
  }

  static async isPhoneTaken(
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
    return RoleLabel[this.role]
  }
}
