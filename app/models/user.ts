import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import { Role, STAFF_ROLES } from '#enums/role_enum'

export default class User extends compose(
  UserSchema,
  withAuthFinder(hash, { uids: ['phone'], passwordColumnName: 'password' })
) {
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

  isCustomer() {
    return this.role === Role.CUSTOMER
  }

  isStaff() {
    return this.role === Role.STAFF
  }

  isAdmin() {
    return this.role === Role.ADMIN
  }

  canAccessStaff() {
    return (STAFF_ROLES as readonly Role[]).includes(this.role)
  }

  canAccessAdmin() {
    return this.role === Role.ADMIN
  }

  initials() {
    const parts = this.fullName.trim().split(/\s+/).filter(Boolean)

    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }

    return parts[0]?.slice(0, 2).toUpperCase() ?? ''
  }
}
