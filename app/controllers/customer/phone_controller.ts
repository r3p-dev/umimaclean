import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import OtpService from '#services/otp_service'
import { displayPhone } from '#helpers/phone'
import TurnstileService from '#services/turnstile_service'
import { changePhoneValidator } from '#validators/customer/profile'

@inject()
export default class PhoneController {
  constructor(
    protected otp: OtpService,
    protected turnstile: TurnstileService
  ) {}

  async edit({ inertia, auth }: HttpContext) {
    return inertia.render('customer/profile/phone', {
      currentPhone: displayPhone(auth.getUserOrFail().phone),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    await this.turnstile.assertToken(request.input('turnstile'), request.ip())
    const user = auth.getUserOrFail()
    const { phone } = await request.validateUsing(changePhoneValidator)

    await this.otp.startPhoneChange(session, user, phone, request.ip())

    return response.redirect().toRoute('auth.otp')
  }
}
