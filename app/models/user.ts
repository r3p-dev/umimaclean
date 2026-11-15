import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'

export type UserRole = 'customer' | 'staff' | 'admin'

export default class User extends compose(
  UserSchema,
  withAuthFinder(hash, { uids: ['phone'], passwordColumnName: 'password' })
) {
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

  declare role: UserRole

  isCustomer() {
    return this.role === 'customer'
  }

  isStaff() {
    return this.role === 'staff'
  }

  isAdmin() {
    return this.role === 'admin'
  }

  canAccessStaff() {
    return this.role === 'staff' || this.role === 'admin'
  }

  canAccessAdmin() {
    return this.role === 'admin'
  }

  initials() {
    const parts = this.fullName.trim().split(/\s+/).filter(Boolean)

    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }

    return parts[0]?.slice(0, 2).toUpperCase() ?? ''
  }
}
