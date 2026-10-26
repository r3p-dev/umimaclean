import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import OtpService from '#services/otp_service'
import TurnstileService from '#services/turnstile_service'
import { registerValidator } from '#validators/auth/register'

@inject()
export default class RegisterController {
  constructor(
    protected otp: OtpService,
    protected turnstile: TurnstileService
  ) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/register', {})
  }

  async store({ request, response, session }: HttpContext) {
    await this.turnstile.assertToken(request.input('turnstile'), request.ip())
    const payload = await request.validateUsing(registerValidator)

    await this.otp.startRegistration(session, payload, request.ip())

    return response.redirect().toRoute('auth.otp')
  }
}
