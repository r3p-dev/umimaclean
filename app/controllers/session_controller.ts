import { inject } from '@adonisjs/core'
import AccountService from '#services/account_service'
import { Role } from '#enums/role_enum'
import { createSessionValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class SessionController {
  constructor(protected accountService: AccountService) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(createSessionValidator)
    const user = await this.accountService.verifyCustomerCredentials(payload, request.ip())

    await auth.use('web').login(user, !!payload.rememberMe)
    return response.redirect().toRoute('customer.home')
  }

  async createStaff({ inertia }: HttpContext) {
    return inertia.render('auth/staff_login', {})
  }

  async storeStaff({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(createSessionValidator)
    const user = await this.accountService.verifyStaffCredentials(payload, request.ip())

    await auth.use('web').login(user, !!payload.rememberMe)
    await this.accountService.logStaffSignIn(user)

    if (user.role === Role.ADMIN) {
      return response.redirect().toRoute('admin.home')
    }

    return response.redirect().toRoute('staff.home')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('session.create')
  }
}
