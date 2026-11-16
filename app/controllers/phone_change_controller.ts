import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import OtpService from '#services/otp_service'
import { changePhoneValidator } from '#validators/profile_validator'

@inject()
export default class PhoneChangeController {
  constructor(protected otpService: OtpService) {}

  async edit({ inertia }: HttpContext) {
    return inertia.render('customer/profile/phone', {})
  }

  async store({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(changePhoneValidator)
    await this.otpService.startPhoneChange(
      session,
      auth.getUserOrFail(),
      payload.phone,
      request.ip()
    )

    return response.redirect().toRoute('otp.show')
  }
}
