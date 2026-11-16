import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AccountService from '#services/account_service'
import { changePasswordValidator } from '#validators/profile_validator'

@inject()
export default class AccountSecurityController {
  constructor(protected accountService: AccountService) {}

  async updatePassword({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(changePasswordValidator)
    await this.accountService.changePassword(
      auth.getUserOrFail(),
      payload.currentPassword,
      payload.password,
      {
        sessionId: session.sessionId,
        rememberMeToken: request.encryptedCookie(auth.use('web').rememberMeKeyName),
      }
    )

    session.flash('success', 'Kata sandi diganti. Perangkat lain sudah dikeluarkan.')
    return response.redirect().back()
  }

  async signOutOtherDevices({ auth, request, response, session }: HttpContext) {
    await this.accountService.signOutOtherDevices(auth.getUserOrFail(), {
      sessionId: session.sessionId,
      rememberMeToken: request.encryptedCookie(auth.use('web').rememberMeKeyName),
    })

    session.flash('success', 'Perangkat lain sudah dikeluarkan.')
    return response.redirect().back()
  }
}
