import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { OtpPurpose } from '#enums/otp_enum'
import { LoginRedirect } from '#enums/role_enum'
import User from '#models/user'
import AccountService from '#services/account/account_service'
import AccountSessionService from '#services/account/account_session_service'
import OtpFlowService from '#services/otp/otp_flow_service'
import { maskPhone } from '#services/phone_service'
import TurnstileService from '#services/turnstile_service'
import { forgotPasswordValidator, resetPasswordValidator } from '#validators/auth/password'

export const FORGOT_PASSWORD_NOTICE = 'Jika nomor terdaftar, kode dikirim via WhatsApp.'

@inject()
export default class PasswordResetController {
  constructor(
    protected accounts: AccountService,
    protected sessions: AccountSessionService,
    protected otpFlow: OtpFlowService,
    protected turnstile: TurnstileService
  ) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/forgot_password', {})
  }

  async store({ request, response, session }: HttpContext) {
    await this.turnstile.assert(request.input('turnstile'), request.ip())
    const { phone } = await request.validateUsing(forgotPasswordValidator)

    await this.otpFlow.start(
      session,
      { purpose: OtpPurpose.RESET_PASSWORD, phone, failures: 0 },
      request.ip(),
      await this.accounts.isPhoneTaken(phone)
    )

    session.flash('success', FORGOT_PASSWORD_NOTICE)
    return response.redirect().toRoute('auth.otp')
  }

  async edit({ inertia, response, session }: HttpContext) {
    const grant = this.otpFlow.passwordResetGrant(session)
    if (!grant) {
      return this.#expired(session, response)
    }

    return inertia.render('auth/reset_password', { maskedPhone: maskPhone(grant.phone) })
  }

  async update(ctx: HttpContext) {
    const { request, response, session } = ctx

    const grant = this.otpFlow.passwordResetGrant(session)
    if (!grant) {
      return this.#expired(session, response)
    }

    const payload = await request.validateUsing(resetPasswordValidator)
    const user = await User.findOrFail(grant.userId)

    await this.accounts.updatePassword(user, payload.password)
    this.otpFlow.forgetPasswordReset(session)

    if (payload.logoutOthers !== false) {
      await this.sessions.endOtherSessions(ctx, user)
    }

    await this.sessions.signIn(ctx, user, true)

    session.flash('success', 'Kata sandi baru disimpan.')
    return response.redirect().toRoute(LoginRedirect[user.role])
  }

  #expired(session: HttpContext['session'], response: HttpContext['response']) {
    this.otpFlow.forgetPasswordReset(session)

    session.flash('error', 'Waktu atur ulang kata sandi habis. Minta kode baru.')
    return response.redirect().toRoute('auth.password.forgot')
  }
}
