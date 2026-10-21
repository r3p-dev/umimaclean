import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { OtpPurpose } from '#enums/otp_enum'
import { LoginRedirect, Role } from '#enums/role_enum'
import OtpFlowPolicy from '#policies/otp_flow_policy'
import AccountSessionService from '#services/account/account_session_service'
import OtpFlowService, { OTP_LOCKED_MESSAGE } from '#services/otp/otp_flow_service'
import OtpService, { OTP_TTL_MINUTES } from '#services/otp/otp_service'
import { maskPhone } from '#services/phone_service'
import TurnstileService from '#services/turnstile_service'
import { verifyOtpValidator } from '#validators/auth/otp'
import { fieldError } from '#validators/shared/field_error'

@inject()
export default class OtpController {
  constructor(
    protected otp: OtpService,
    protected otpFlow: OtpFlowService,
    protected sessions: AccountSessionService,
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
      resendIn: await this.otp.cooldownRemaining(flow.phone),
      ttlMinutes: OTP_TTL_MINUTES,
      isLocked: this.otpFlow.isLocked(flow),
    })
  }

  async verify(ctx: HttpContext) {
    const { bouncer, request, response, session } = ctx
    const flow = await this.#flow(session, bouncer)
    if (!flow) {
      return response.redirect().toRoute('auth.login')
    }

    const { code } = await request.validateUsing(verifyOtpValidator)
    if (this.otpFlow.isLocked(flow)) {
      throw fieldError('code', OTP_LOCKED_MESSAGE, 'otp.locked')
    }

    const { result, user } = await this.otpFlow.verify(flow, code)
    if (!user) {
      const message = this.otpFlow.recordFailure(session, flow, result === 'locked')
      throw fieldError('code', message, 'otp.invalid')
    }

    this.otpFlow.clear(session)

    if (flow.purpose === OtpPurpose.REGISTER) {
      await this.sessions.signIn(ctx, user, true)
      session.flash('success', 'Akun berhasil dibuat. Selamat datang!')
      return response.redirect().toRoute(LoginRedirect[Role.CUSTOMER])
    }

    if (flow.purpose === OtpPurpose.RESET_PASSWORD) {
      this.otpFlow.grantPasswordReset(session, user)
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

    await this.turnstile.assert(request.input('turnstile'), request.ip())
    await this.otpFlow.resend(session, flow, request.ip())

    session.flash('success', 'Kode baru dikirim via WhatsApp.')
    return response.redirect().toRoute('auth.otp')
  }

  async #flow(session: HttpContext['session'], bouncer: HttpContext['bouncer']) {
    const flow = this.otpFlow.current(session)
    if (!flow || (await bouncer.with(OtpFlowPolicy).denies('continue', flow))) {
      return null
    }

    return flow
  }
}
