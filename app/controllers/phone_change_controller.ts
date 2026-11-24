import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { profileArea } from '#helpers/profile_route'
import AccountService from '#services/account_service'
import OtpService from '#services/otp_service'
import { changePhoneValidator } from '#validators/profile_validator'

const PAGES = {
  customer: 'customer/profile/phone',
  staff: 'staff/profile_phone',
  admin: 'admin/profile_phone',
} as const

// Changing the number changes the sign-in identity: the current password first, then an OTP to
// the new number (CUST-13, D108).
@inject()
export default class PhoneChangeController {
  constructor(
    protected otpService: OtpService,
    protected accountService: AccountService
  ) {}

  async edit(ctx: HttpContext) {
    return ctx.inertia.render(PAGES[profileArea(ctx)], {})
  }

  async store(ctx: HttpContext) {
    const { auth, request, response, session } = ctx
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(changePhoneValidator)
    await this.accountService.verifyCurrentPassword(user, payload.currentPassword)
    await this.otpService.startPhoneChange(
      session,
      user,
      payload.phone,
      request.ip(),
      profileArea(ctx)
    )

    return response.redirect().toRoute('otp.show')
  }
}
