import { inject } from '@adonisjs/core'
import AuthService from '#services/auth_service'
import { createSessionValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class SessionController {
  constructor(protected authService: AuthService) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(createSessionValidator)
    const user = await this.authService.verifyUserCredentials(payload)

    await auth.use('web').login(user)
    response.redirect().toRoute('dashboard')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('session.create')
  }
}
