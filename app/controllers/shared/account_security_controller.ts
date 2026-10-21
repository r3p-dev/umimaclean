import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { ProfileRoute } from '#enums/role_enum'
import AccountService from '#services/account/account_service'
import AccountSessionService from '#services/account/account_session_service'
import { changePasswordValidator } from '#validators/shared/account'

@inject()
export default class AccountSecurityController {
  constructor(
    protected accounts: AccountService,
    protected sessions: AccountSessionService
  ) {}

  async updatePassword(ctx: HttpContext) {
    const { auth, request, response, session } = ctx
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(changePasswordValidator)

    await this.accounts.changePassword(user, payload.currentPassword, payload.password)
    await this.sessions.endOtherSessions(ctx, user)
    await this.sessions.signIn(ctx, user, true)

    session.flash('success', 'Kata sandi diganti. Perangkat lain sudah dikeluarkan.')
    return response.redirect().toRoute(ProfileRoute[user.role].password)
  }

  async signOutOthers(ctx: HttpContext) {
    const { auth, response, session } = ctx
    const user = auth.getUserOrFail()

    await this.sessions.endOtherSessions(ctx, user)
    await this.sessions.signIn(ctx, user, true)

    session.flash('success', 'Perangkat lain sudah dikeluarkan.')
    return response.redirect().toRoute(ProfileRoute[user.role].devices)
  }
}
