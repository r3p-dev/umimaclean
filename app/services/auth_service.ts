import User from '#models/user'
import type { CreateSessionInput, CreateUserInput } from '#validators/auth'

export default class AuthService {
  async registerUser(payload: CreateUserInput): Promise<User> {
    return User.create({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
    })
  }

  async verifyUserCredentials(credentials: CreateSessionInput): Promise<User> {
    return User.verifyCredentials(credentials.email, credentials.password)
  }
}
