import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import OtpService from '#services/otp_service'
import AccountService from '#services/account_service'
import TurnstileGateway from '#services/turnstile_gateway'
import { maskPhone } from '#helpers/phone'
import {
  forgotPasswordValidator,
  resetPasswordValidator,
} from '#validators/password_reset_validator'

@inject()
export default class PasswordResetController {
  constructor(
    protected otpService: OtpService,
    protected accountService: AccountService,
    protected turnstile: TurnstileGateway
  ) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/forgot_password', {})
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(forgotPasswordValidator)
    const turnstileToken = payload.turnstile || request.input('cf-turnstile-response')

    await this.turnstile.assertToken(turnstileToken, request.ip())
    await this.otpService.startPasswordReset(session, payload.phone, request.ip())

    session.flash('success', 'Jika nomor terdaftar, kode dikirim via WhatsApp.')
    return response.redirect().toRoute('otp.show')
  }

  async edit({ inertia, response, session }: HttpContext) {
    const grant = this.otpService.passwordResetGrant(session)
    if (!grant) {
      return response.redirect().toRoute('password_reset.create')
    }

    return inertia.render('auth/reset_password', {
      maskedPhone: maskPhone(grant.phone),
    })
  }

  async update({ auth, request, response, session }: HttpContext) {
    const grant = this.otpService.passwordResetGrant(session)
    if (!grant) {
      return response.redirect().toRoute('password_reset.create')
    }

    const payload = await request.validateUsing(resetPasswordValidator)
    const user = await this.accountService.resetPassword(
      grant.userId,
      payload.password,
      session.sessionId
    )

    this.otpService.forgetPasswordReset(session)

    await auth.use('web').login(user)

    session.flash('success', 'Kata sandi berhasil diatur ulang. Selamat datang kembali!')
    return response.redirect().toRoute('customer.home')
  }
}
