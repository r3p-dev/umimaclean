import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { OtpPurpose } from '#enums/otp_enum'
import { LoginRedirect } from '#enums/role_enum'
import User from '#models/user'
import AccountService from '#services/account_service'
import OtpService from '#services/otp_service'
import { maskPhone } from '#helpers/phone'
import TurnstileService from '#services/turnstile_service'
import { forgotPasswordValidator, resetPasswordValidator } from '#validators/auth/password'

export const FORGOT_PASSWORD_NOTICE = 'Jika nomor terdaftar, kode dikirim via WhatsApp.'

@inject()
export default class PasswordResetController {
  constructor(
    protected accounts: AccountService,
    protected otp: OtpService,
    protected turnstile: TurnstileService
  ) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/forgot_password', {})
  }

  async store({ request, response, session }: HttpContext) {
    await this.turnstile.assert(request.input('turnstile'), request.ip())
    const { phone } = await request.validateUsing(forgotPasswordValidator)

    await this.otp.start(
      session,
      { purpose: OtpPurpose.RESET_PASSWORD, phone, failures: 0 },
      request.ip(),
      await User.isPhoneTaken(phone)
    )

    session.flash('success', FORGOT_PASSWORD_NOTICE)
    return response.redirect().toRoute('auth.otp')
  }

  async edit({ inertia, response, session }: HttpContext) {
    const grant = this.otp.passwordResetGrant(session)
    if (!grant) {
      return this.#expired(session, response)
    }

    return inertia.render('auth/reset_password', { maskedPhone: maskPhone(grant.phone) })
  }

  async update(ctx: HttpContext) {
    const { request, response, session } = ctx

    const grant = this.otp.passwordResetGrant(session)
    if (!grant) {
      return this.#expired(session, response)
    }

    const payload = await request.validateUsing(resetPasswordValidator)
    const user = await User.findOrFail(grant.userId)

    await this.accounts.resetPasswordAfterOtp(
      ctx,
      user,
      payload.password,
      payload.logoutOthers !== false
    )
    this.otp.forgetPasswordReset(session)

    session.flash('success', 'Kata sandi baru disimpan.')
    return response.redirect().toRoute(LoginRedirect[user.role])
  }

  #expired(session: HttpContext['session'], response: HttpContext['response']) {
    this.otp.forgetPasswordReset(session)

    session.flash('error', 'Waktu atur ulang kata sandi habis. Minta kode baru.')
    return response.redirect().toRoute('auth.password.forgot')
  }
}
