import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { PHOTO_RETENTION_DAYS } from '#services/proof_photo_service'
import SettingsService from '#services/settings_service'

@inject()
export default class LegalController {
  constructor(protected settings: SettingsService) {}

  async terms({ inertia }: HttpContext) {
    return inertia.render('legal/terms', { store: await this.settings.get('store') })
  }

  async privacy({ inertia }: HttpContext) {
    return inertia.render('legal/privacy', {
      store: await this.settings.get('store'),
      photoDays: PHOTO_RETENTION_DAYS,
    })
  }
}
