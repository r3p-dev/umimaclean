import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import SettingService from '#services/setting_service'

@inject()
export default class LegalController {
  constructor(protected settings: SettingService) {}

  async terms({ inertia }: HttpContext) {
    return inertia.render('legal/terms', { store: await this.settings.storeProfile() })
  }

  async privacy({ inertia }: HttpContext) {
    return inertia.render('legal/privacy', await this.settings.privacyPolicyInfo())
  }
}
