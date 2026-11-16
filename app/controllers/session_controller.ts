import { inject } from '@adonisjs/core'
import AccountService, {
  InactiveAccountException,
  RoleMismatchException,
} from '#services/account_service'
import { Role } from '#enums/role_enum'
import { createSessionValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class SessionController {
  constructor(protected accountService: AccountService) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response, session }: HttpContext) {
    const payload = await request.validateUsing(createSessionValidator)

    try {
      const user = await this.accountService.verifyCustomerCredentials(payload)
      await auth.use('web').login(user, !!payload.rememberMe)
      return response.redirect().toRoute('customer.home')
    } catch (error) {
      const message =
        error instanceof InactiveAccountException || error instanceof RoleMismatchException
          ? error.message
          : 'Nomor WhatsApp atau kata sandi salah.'

      session.flash({
        errors: { phone: [message] },
        inputErrorsBag: { phone: [message] },
        errorsBag: { phone: message },
      })
      session.flashExcept(['_csrf', '_method', 'password', 'password_confirmation'])
      return response.redirect().toRoute('session.create')
    }
  }

  async createStaff({ inertia }: HttpContext) {
    return inertia.render('auth/staff_login', {})
  }

  async storeStaff({ request, auth, response, session }: HttpContext) {
    const payload = await request.validateUsing(createSessionValidator)

    try {
      const user = await this.accountService.verifyStaffCredentials(payload)
      await auth.use('web').login(user, !!payload.rememberMe)
      await this.accountService.logStaffSignIn(user)

      if (user.role === Role.ADMIN) {
        return response.redirect().toRoute('admin.home')
      }

      return response.redirect().toRoute('staff.home')
    } catch (error) {
      const message =
        error instanceof InactiveAccountException || error instanceof RoleMismatchException
          ? error.message
          : 'Nomor WhatsApp atau kata sandi salah.'

      session.flash({
        errors: { phone: [message] },
        inputErrorsBag: { phone: [message] },
        errorsBag: { phone: message },
      })
      session.flashExcept(['_csrf', '_method', 'password', 'password_confirmation'])
      return response.redirect().toRoute('session.createStaff')
    }
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('session.create')
  }
}
