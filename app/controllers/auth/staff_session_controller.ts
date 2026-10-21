import { Bouncer } from '@adonisjs/bouncer'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { enterStaffArea } from '#abilities/main'
import { LoginRedirect } from '#enums/role_enum'
import AccountSessionService from '#services/account/account_session_service'
import StaffAccountService from '#services/account/staff_account_service'
import TurnstileService from '#services/turnstile_service'
import { loginValidator } from '#validators/auth/session'

@inject()
export default class StaffSessionController {
  constructor(
    protected sessions: AccountSessionService,
    protected turnstile: TurnstileService,
    protected staffAccounts: StaffAccountService
  ) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/staff_login', {})
  }

  async store(ctx: HttpContext) {
    const { request, response } = ctx
    await this.turnstile.assert(request.input('turnstile'), request.ip())
    const payload = await request.validateUsing(loginValidator)

    const user = await this.sessions.authenticate(
      payload.phone,
      payload.password,
      request.ip(),
      (candidate) => new Bouncer(candidate).allows(enterStaffArea)
    )
    await this.sessions.signIn(ctx, user, payload.remember ?? false)
    await this.staffAccounts.touch(user)

    return response.redirect().toIntendedRoute(LoginRedirect[user.role])
  }
}
