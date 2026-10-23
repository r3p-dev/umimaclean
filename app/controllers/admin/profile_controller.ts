import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AccountService from '#services/account_service'
import UserTransformer from '#transformers/user_transformer'

@inject()
export default class ProfileController {
  constructor(protected accounts: AccountService) {}

  async show({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    return inertia.render('admin/profile', {
      user: new UserTransformer(user).toObject(),
      deviceCount: await this.accounts.activeDeviceCount(user),
    })
  }
}
