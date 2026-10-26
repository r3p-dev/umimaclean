import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { OtpPurpose } from '#enums/otp_enum'
import { LoginRedirect, Role } from '#enums/role_enum'
import OtpFlowPolicy from '#policies/otp_flow_policy'
import AccountService from '#services/account_service'
import OtpService from '#services/otp_service'
import { maskPhone } from '#helpers/phone'
import TurnstileService from '#services/turnstile_service'
import { verifyOtpValidator } from '#validators/auth/otp'
import { fieldError } from '#validators/shared/field_error'
import { OTP_TTL_MINUTES, OTP_LOCKED_MESSAGE } from '#services/constants'

@inject()
export default class OtpController {
  constructor(
    protected otp: OtpService,
    protected accounts: AccountService,
    protected turnstile: TurnstileService
  ) {}

  async show({ bouncer, inertia, response, session }: HttpContext) {
    const flow = await this.#flow(session, bouncer)
    if (!flow) {
      return response.redirect().toRoute('auth.login')
    }

    return inertia.render('auth/otp', {
      purpose: flow.purpose,
      maskedPhone: maskPhone(flow.phone),
      resendIn: await this.otp.otpCooldownRemaining(flow.phone),
      ttlMinutes: OTP_TTL_MINUTES,
      isLocked: this.otp.isOtpLocked(flow),
    })
  }

  async verify(ctx: HttpContext) {
    const { bouncer, request, response, session } = ctx
    const flow = await this.#flow(session, bouncer)
    if (!flow) {
      return response.redirect().toRoute('auth.login')
    }

    const { code } = await request.validateUsing(verifyOtpValidator)
    if (this.otp.isOtpLocked(flow)) {
      throw fieldError('code', OTP_LOCKED_MESSAGE, 'otp.locked')
    }

    const { result, user } = await this.otp.verifyOtp(flow, code)
    if (!user) {
      const message = this.otp.recordOtpFailure(session, flow, result === 'locked')
      throw fieldError('code', message, 'otp.invalid')
    }

    this.otp.clearOtpFlow(session)

    if (flow.purpose === OtpPurpose.REGISTER) {
      await this.accounts.signIn(ctx, user, true)
      session.flash('success', 'Akun berhasil dibuat. Selamat datang!')
      return response.redirect().toRoute(LoginRedirect[Role.CUSTOMER])
    }

    if (flow.purpose === OtpPurpose.RESET_PASSWORD) {
      this.otp.grantPasswordReset(session, user)
      return response.redirect().toRoute('auth.password.reset')
    }

    session.flash('success', 'Nomor WhatsApp berhasil diganti.')
    return response.redirect().toRoute('customer.profile.edit')
  }

  async resend({ bouncer, request, response, session }: HttpContext) {
    const flow = await this.#flow(session, bouncer)
    if (!flow) {
      return response.redirect().toRoute('auth.login')
    }

    await this.turnstile.assertToken(request.input('turnstile'), request.ip())
    await this.otp.resendOtp(session, flow, request.ip())

    session.flash('success', 'Kode baru dikirim via WhatsApp.')
    return response.redirect().toRoute('auth.otp')
  }

  async #flow(session: HttpContext['session'], bouncer: HttpContext['bouncer']) {
    const flow = this.otp.currentOtpFlow(session)
    if (!flow || (await bouncer.with(OtpFlowPolicy).denies('continue', flow))) {
      return null
    }

    return flow
  }
}
