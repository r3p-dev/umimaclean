/*
|--------------------------------------------------------------------------
| Auth Service
|--------------------------------------------------------------------------
|
| Handles user registration and credential verification.
|
*/

import User from '#models/user'
import type { RegisterInput, LoginInput } from '#validators/auth'

export default class AuthService {
  async register(payload: RegisterInput): Promise<User> {
    return User.create({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
    })
  }

  async verifyCredentials(credentials: LoginInput): Promise<User> {
    return User.verifyCredentials(credentials.email, credentials.password)
  }
}
