/*
|--------------------------------------------------------------------------
| User Transformer
|--------------------------------------------------------------------------
|
| Transforms user data for API responses and Inertia views.
|
*/

import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
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
