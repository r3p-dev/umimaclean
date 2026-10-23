import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { OtpPurpose } from '#enums/otp_enum'
import User from '#models/user'
import OtpService, { PHONE_TAKEN_MESSAGE } from '#services/otp_service'
import { displayPhone } from '#helpers/phone'
import TurnstileService from '#services/turnstile_service'
import { changePhoneValidator } from '#validators/customer/profile'
import { fieldError } from '#validators/shared/field_error'

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
    await this.turnstile.assert(request.input('turnstile'), request.ip())
    const user = auth.getUserOrFail()
    const { phone } = await request.validateUsing(changePhoneValidator)
    if (phone === user.phone) {
      throw fieldError('phone', 'Ini nomor Anda saat ini. Isi nomor baru.', 'phone.same')
    }

    if (await User.isPhoneTaken(phone, { exceptUserId: user.id })) {
      throw fieldError('phone', PHONE_TAKEN_MESSAGE, 'phone.taken')
    }

    await this.otp.start(
      session,
      { purpose: OtpPurpose.CHANGE_PHONE, phone, userId: user.id, failures: 0 },
      request.ip()
    )

    return response.redirect().toRoute('auth.otp')
  }
}
