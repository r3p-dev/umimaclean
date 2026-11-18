import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import SettingService from '#services/setting_service'
import OpeningHoursTransformer from '#transformers/opening_hours_transformer'
import { openingHoursValidator, storeSettingValidator } from '#validators/setting_validator'

@inject()
export default class StoreSettingsController {
  constructor(protected settingService: SettingService) {}

  async index({ inertia }: HttpContext) {
    return inertia.render('admin/settings/store', {
      hours: OpeningHoursTransformer.transform(await this.settingService.getOpeningHours()),
    })
  }

  async update({ request, response, auth, session }: HttpContext) {
    const actor = auth.user!
    const payload = await request.validateUsing(storeSettingValidator)

    await this.settingService.updateStoreSettings(actor, payload)

    session.flash('success', 'Pengaturan toko berhasil disimpan.')
    return response.redirect().back()
  }

  async updateHours({ request, response, auth, session }: HttpContext) {
    const payload = await request.validateUsing(openingHoursValidator)

    await this.settingService.updateOpeningHours(auth.user!, payload)

    session.flash('success', 'Jam buka berhasil disimpan.')
    return response.redirect().back()
  }
}
