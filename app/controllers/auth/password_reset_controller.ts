import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { LoginRedirect } from '#enums/role_enum'
import AccountService from '#services/account_service'
import { FORGOT_PASSWORD_NOTICE } from '#services/constants'
import OtpService from '#services/otp_service'
import { maskPhone } from '#helpers/phone'
import TurnstileService from '#services/turnstile_service'
import { forgotPasswordValidator, resetPasswordValidator } from '#validators/auth/password'

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
    await this.turnstile.assertToken(request.input('turnstile'), request.ip())
    const { phone } = await request.validateUsing(forgotPasswordValidator)

    await this.otp.startPasswordReset(session, phone, request.ip())

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
    const user = await this.accounts.resetPasswordAfterOtp(
      ctx,
      grant.userId,
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
