/*
|--------------------------------------------------------------------------
| New Account Controller
|--------------------------------------------------------------------------
|
| Handles self-signup requests for new user accounts.
|
*/

import { inject } from '@adonisjs/core'
import AuthService from '#services/auth_service'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class NewAccountController {
  constructor(protected authService: AuthService) {}

  /**
   * Render the signup page.
   */
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/signup', {})
  }

  /**
   * Handle registration submission.
   */
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)
    const user = await this.authService.register(payload)

    await auth.use('web').login(user)
    response.redirect().toRoute('dashboard')
  }
}
