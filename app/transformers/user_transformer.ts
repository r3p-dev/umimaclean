/*
|--------------------------------------------------------------------------
| User Transformer
|--------------------------------------------------------------------------
|
| Transforms User model instances into serialized objects for Inertia
| views or JSON responses.
|
*/

import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  /**
   * Serialize user entity into public data structure.
   */
  toObject() {
    return this.pick(this.resource, [
      'id',
      'fullName',
      'email',
      'createdAt',
      'updatedAt',
      'initials',
    ])
  }
}
