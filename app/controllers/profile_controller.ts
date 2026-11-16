import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AccountService from '#services/account_service'
import { updateProfileValidator } from '#validators/profile_validator'

@inject()
export default class ProfileController {
  constructor(protected accountService: AccountService) {}

  async show({ auth, inertia }: HttpContext) {
    const deviceCount = await this.accountService.countActiveDevices(auth.getUserOrFail())
    return inertia.render('customer/profile/show', { deviceCount })
  }

  async edit({ inertia }: HttpContext) {
    return inertia.render('customer/profile/edit', {})
  }

  async update({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(updateProfileValidator)
    await this.accountService.changeName(auth.getUserOrFail(), payload.name)

    session.flash('success', 'Nama diperbarui.')
    return response.redirect().toRoute('customer.profile.show')
  }

  async showStaff({ auth, inertia }: HttpContext) {
    const deviceCount = await this.accountService.countActiveDevices(auth.getUserOrFail())
    return inertia.render('staff/profile', { deviceCount })
  }

  async showOwner({ auth, inertia }: HttpContext) {
    const deviceCount = await this.accountService.countActiveDevices(auth.getUserOrFail())
    return inertia.render('admin/profile', { deviceCount })
  }
}
