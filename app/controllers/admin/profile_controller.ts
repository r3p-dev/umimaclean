import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AccountSessionService from '#services/account/account_session_service'
import UserTransformer from '#transformers/user_transformer'

@inject()
export default class ProfileController {
  constructor(protected sessions: AccountSessionService) {}

  async show({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    return inertia.render('admin/profile', {
      user: new UserTransformer(user).toObject(),
      deviceCount: await this.sessions.activeDeviceCount(user),
    })
  }
}
