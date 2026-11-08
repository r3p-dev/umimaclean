/*
|--------------------------------------------------------------------------
| Session Controller
|--------------------------------------------------------------------------
|
| Handles authentication sessions: displaying the login view, authenticating
| credentials, and logging out the active session.
|
*/

import { inject } from '@adonisjs/core'
import AuthService from '#services/auth_service'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class SessionController {
  constructor(protected authService: AuthService) {}

  /**
   * Render the login page.
   */
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  /**
   * Handle login submission and authenticate user.
   */
  async store({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const user = await this.authService.verifyCredentials(payload)

    await auth.use('web').login(user)
    response.redirect().toRoute('dashboard')
  }

  /**
   * Destroy the current user session.
   */
  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('session.create')
  }
}
