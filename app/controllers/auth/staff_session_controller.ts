import { Bouncer } from '@adonisjs/bouncer'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { enterStaffArea } from '#abilities/main'
import { LoginRedirect } from '#enums/role_enum'
import AccountService from '#services/account_service'
import StaffService from '#services/staff_service'
import TurnstileService from '#services/turnstile_service'
import { loginValidator } from '#validators/auth/session'

@inject()
export default class StaffSessionController {
  constructor(
    protected accounts: AccountService,
    protected turnstile: TurnstileService,
    protected staff: StaffService
  ) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/staff_login', {})
  }

  async store(ctx: HttpContext) {
    const { request, response } = ctx
    await this.turnstile.assert(request.input('turnstile'), request.ip())
    const payload = await request.validateUsing(loginValidator)

    const user = await this.accounts.authenticate(
      payload.phone,
      payload.password,
      request.ip(),
      (candidate) => new Bouncer(candidate).allows(enterStaffArea)
    )
    await this.accounts.signIn(ctx, user, payload.remember ?? false)
    await this.staff.touch(user)

    return response.redirect().toIntendedRoute(LoginRedirect[user.role])
  }
}
