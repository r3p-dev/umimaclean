import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AccountService from '#services/account_service'
import TaskService from '#services/task_service'
import UserTransformer from '#transformers/user_transformer'

@inject()
export default class AccountController {
  constructor(
    protected accounts: AccountService,
    protected tasks: TaskService
  ) {}

  async history({ auth, inertia }: HttpContext) {
    return inertia.render('staff/account/history', {
      entries: await this.tasks.history(auth.getUserOrFail()),
    })
  }

  async profile({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    return inertia.render('staff/account/profile', {
      user: new UserTransformer(user).toObject(),
      deviceCount: await this.accounts.activeDeviceCount(user),
    })
  }
}
