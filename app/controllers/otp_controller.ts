import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import OtpService, { OTP_LOCKED_MESSAGE } from '#services/otp_service'
import { OTP_TTL_MINUTES } from '#models/otp_code'
import { OtpPurpose } from '#enums/otp_purpose_enum'
import TurnstileGateway from '#services/turnstile_gateway'
import AccountService from '#services/account_service'
import { maskPhone } from '#helpers/phone'
import { verifyOtpValidator, resendOtpValidator } from '#validators/otp_validator'
import { profileRoute } from '#helpers/profile_route'
import { errors as vineErrors } from '@vinejs/vine'

@inject()
export default class OtpController {
  constructor(
    protected otpService: OtpService,
    protected turnstile: TurnstileGateway,
    protected accountService: AccountService
  ) {}

  // A phone change belongs to the signed-in account that started it (CUST-13).
  #currentFlow({ auth, session }: HttpContext) {
    const flow = this.otpService.currentOtpFlow(session)
    if (flow?.purpose === OtpPurpose.CHANGE_PHONE && flow.userId !== auth.user?.id) {
      return null
    }
    return flow
  }

  async show(ctx: HttpContext) {
    const { inertia, response } = ctx
    const flow = this.#currentFlow(ctx)
    if (!flow) {
      return response.redirect().toRoute('session.create')
    }

    return inertia.render('auth/otp', {
      purpose: flow.purpose,
      maskedPhone: maskPhone(flow.phone),
      resendIn: await this.otpService.otpCooldownRemaining(flow.phone),
      ttlMinutes: OTP_TTL_MINUTES,
      isLocked: this.otpService.isOtpLocked(flow),
      profileArea: flow.profileArea ?? 'customer',
    })
  }

  async verify(ctx: HttpContext) {
    const { auth, request, response, session } = ctx
    const flow = this.#currentFlow(ctx)
    if (!flow) {
      return response.redirect().toRoute('session.create')
    }

    if (this.otpService.isOtpLocked(flow)) {
      throw new vineErrors.E_VALIDATION_ERROR([
        {
          field: 'code',
          message: OTP_LOCKED_MESSAGE,
          rule: 'otp.locked',
        },
      ])
    }

    const payload = await request.validateUsing(verifyOtpValidator)
    const { result, user } = await this.otpService.verifyOtp(flow, payload.code)

    if (result !== 'valid' || !user) {
      const message = this.otpService.recordOtpFailure(session, flow, result === 'locked')
      throw new vineErrors.E_VALIDATION_ERROR([
        {
          field: 'code',
          message,
          rule: result === 'locked' ? 'otp.locked' : 'otp.invalid',
        },
      ])
    }

    this.otpService.clearOtpFlow(session)

    if (flow.purpose === OtpPurpose.REGISTER) {
      await auth.use('web').login(user)
      session.flash('success', 'Akun berhasil dibuat. Selamat datang!')
      return response.redirect().toRoute('customer.home')
    }

    if (flow.purpose === OtpPurpose.RESET_PASSWORD) {
      this.otpService.grantPasswordReset(session, user)
      return response.redirect().toRoute('password_reset.edit')
    }

    if (flow.purpose === OtpPurpose.CHANGE_PHONE) {
      await this.accountService.signOutOtherDevices(user, {
        sessionId: session.sessionId,
        rememberMeToken: request.encryptedCookie(auth.use('web').rememberMeKeyName),
      })
      session.flash('success', 'Nomor WhatsApp diganti. Perangkat lain sudah dikeluarkan.')
      return response.redirect().toRoute(profileRoute(flow.profileArea ?? 'customer'))
    }

    return response.redirect().toRoute('home')
  }

  async resend(ctx: HttpContext) {
    const { request, response, session } = ctx
    const flow = this.#currentFlow(ctx)
    if (!flow) {
      return response.redirect().toRoute('session.create')
    }

    const payload = await request.validateUsing(resendOtpValidator)
    const turnstileToken = payload.turnstile || request.input('cf-turnstile-response')
    await this.turnstile.assertToken(turnstileToken, request.ip())
    await this.otpService.resendOtp(session, flow, request.ip())

    session.flash('success', 'Kode baru dikirim via WhatsApp.')
    return response.redirect().toRoute('otp.show')
  }
}
