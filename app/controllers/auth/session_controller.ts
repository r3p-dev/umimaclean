import { Bouncer } from '@adonisjs/bouncer'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { enterCustomerArea, enterStaffArea } from '#abilities/main'
import { LoginRedirect } from '#enums/role_enum'
import AccountService from '#services/account_service'
import TurnstileService from '#services/turnstile_service'
import { loginValidator } from '#validators/auth/session'

@inject()
export default class SessionController {
  constructor(
    protected accounts: AccountService,
    protected turnstile: TurnstileService
  ) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store(ctx: HttpContext) {
    const { request, response } = ctx
    await this.turnstile.assertToken(request.input('turnstile'), request.ip())
    const payload = await request.validateUsing(loginValidator)

    const user = await this.accounts.authenticate(
      payload.phone,
      payload.password,
      request.ip(),
      (candidate) => new Bouncer(candidate).allows(enterCustomerArea)
    )
    await this.accounts.signIn(ctx, user, payload.remember ?? false)

    return response.redirect().toIntendedRoute(LoginRedirect[user.role])
  }

  async destroy(ctx: HttpContext) {
    const { auth, bouncer, inertia, response } = ctx
    const isStaff = auth.user ? await bouncer.allows(enterStaffArea) : false

    await this.accounts.signOut(ctx)
    inertia.clearHistory()

    return response.redirect().toRoute(isStaff ? 'auth.staff_login' : 'home')
  }
}
