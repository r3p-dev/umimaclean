/*
|--------------------------------------------------------------------------
| Authentication Service
|--------------------------------------------------------------------------
|
| Encapsulates business logic for user account registration, credentials
| verification, and related authentication operations.
|
*/

import User from '#models/user'
import type { SignupInput, LoginInput } from '#validators/user'

export default class AuthService {
  /**
   * Register a new user account using validated signup input.
   */
  async register(payload: SignupInput): Promise<User> {
    return User.create({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
    })
  }

  /**
   * Verify user credentials for login using validated login input.
   */
  async verifyCredentials(credentials: LoginInput): Promise<User> {
    return User.verifyCredentials(credentials.email, credentials.password)
  }
}
