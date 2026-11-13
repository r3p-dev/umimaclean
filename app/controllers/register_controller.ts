import { inject } from '@adonisjs/core'
import AuthService from '#services/auth_service'
import { createUserValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RegisterController {
  constructor(protected authService: AuthService) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/signup', {})
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const user = await this.authService.registerUser(payload)

    await auth.use('web').login(user)
    response.redirect().toRoute('dashboard')
  }
}
