/*
|--------------------------------------------------------------------------
| User Model
|--------------------------------------------------------------------------
|
| Defines the user model with authentication helpers.
|
*/

import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  /**
   * Returns uppercase initials derived from the user's name.
   */
  get initials() {
    const parts = this.fullName?.trim().split(/\s+/).filter(Boolean) ?? []

    if (parts.length > 1) {
      return `${parts[0][0]}${parts.at(-1)![0]}`.toUpperCase()
    }

    return parts[0]?.slice(0, 2).toUpperCase() ?? ''
  }
}
