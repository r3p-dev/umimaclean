import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import OtpService from '#services/otp_service'
import TurnstileGateway from '#services/turnstile_gateway'
import { createRegistrationValidator } from '#validators/registration_validator'

@inject()
export default class RegistrationController {
  constructor(
    protected otpService: OtpService,
    protected turnstile: TurnstileGateway
  ) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/register', {})
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(createRegistrationValidator)
    const turnstileToken = payload.turnstile || request.input('cf-turnstile-response')

    await this.turnstile.assertToken(turnstileToken, request.ip())
    await this.otpService.startRegistration(
      session,
      {
        name: payload.name,
        phone: payload.phone,
        password: payload.password,
      },
      request.ip()
    )

    return response.redirect().toRoute('otp.show')
  }
}
