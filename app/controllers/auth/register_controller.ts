import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { OtpPurpose } from '#enums/otp_enum'
import AccountService from '#services/account/account_service'
import OtpFlowService from '#services/otp/otp_flow_service'
import TurnstileService from '#services/turnstile_service'
import { registerValidator } from '#validators/auth/register'
import { fieldError } from '#validators/shared/field_error'

@inject()
export default class RegisterController {
  constructor(
    protected accounts: AccountService,
    protected otpFlow: OtpFlowService,
    protected turnstile: TurnstileService
  ) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/register', {})
  }

  async store({ request, response, session }: HttpContext) {
    await this.turnstile.assert(request.input('turnstile'), request.ip())
    const payload = await request.validateUsing(registerValidator)

    if (await this.accounts.isPhoneTaken(payload.phone)) {
      throw fieldError(
        'phone',
        'Nomor ini sudah terdaftar. Masuk atau atur ulang kata sandi.',
        'phone.taken'
      )
    }

    await this.otpFlow.start(
      session,
      {
        purpose: OtpPurpose.REGISTER,
        phone: payload.phone,
        name: payload.name,
        passwordHash: await hash.make(payload.password),
        failures: 0,
      },
      request.ip()
    )

    return response.redirect().toRoute('auth.otp')
  }
}
