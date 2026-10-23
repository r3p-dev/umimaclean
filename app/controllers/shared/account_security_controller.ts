import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { ProfileRoute } from '#enums/role_enum'
import AccountService from '#services/account_service'
import { changePasswordValidator } from '#validators/shared/account'

@inject()
export default class AccountSecurityController {
  constructor(protected accounts: AccountService) {}

  async updatePassword(ctx: HttpContext) {
    const { auth, request, response, session } = ctx
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(changePasswordValidator)

    await this.accounts.changePassword(ctx, user, payload.currentPassword, payload.password)

    session.flash('success', 'Kata sandi diganti. Perangkat lain sudah dikeluarkan.')
    return response.redirect().toRoute(ProfileRoute[user.role].password)
  }

  async signOutOthers(ctx: HttpContext) {
    const { auth, response, session } = ctx
    const user = auth.getUserOrFail()

    await this.accounts.signOutOthers(ctx, user)

    session.flash('success', 'Perangkat lain sudah dikeluarkan.')
    return response.redirect().toRoute(ProfileRoute[user.role].devices)
  }
}
