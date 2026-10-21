import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AccountSessionService from '#services/account/account_session_service'
import StaffHistoryService from '#services/order/staff_history_service'
import UserTransformer from '#transformers/user_transformer'

@inject()
export default class AccountController {
  constructor(
    protected sessions: AccountSessionService,
    protected staffHistory: StaffHistoryService
  ) {}

  async history({ auth, inertia }: HttpContext) {
    return inertia.render('staff/account/history', {
      entries: await this.staffHistory.recent(auth.getUserOrFail()),
    })
  }

  async profile({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    return inertia.render('staff/account/profile', {
      user: new UserTransformer(user).toObject(),
      deviceCount: await this.sessions.activeDeviceCount(user),
    })
  }
}
