import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import SettingService from '#services/setting_service'
import PickupSlotTransformer from '#transformers/pickup_slot_transformer'
import { storeSettingValidator, pickupSlotsSettingValidator } from '#validators/setting_validator'

@inject()
export default class StoreSettingsController {
  constructor(protected settingService: SettingService) {}

  async index({ inertia }: HttpContext) {
    const slots = await this.settingService.getPickupSlots()

    return inertia.render('admin/settings/store', {
      slots: PickupSlotTransformer.transform(slots),
    })
  }

  async update({ request, response, auth, session }: HttpContext) {
    const actor = auth.user!
    const payload = await request.validateUsing(storeSettingValidator)

    await this.settingService.updateStoreSettings(actor, payload)

    session.flash('success', 'Pengaturan toko berhasil disimpan.')
    return response.redirect().back()
  }

  async updateSlots({ request, response, auth, session }: HttpContext) {
    const actor = auth.user!
    const { slots } = await request.validateUsing(pickupSlotsSettingValidator)

    await this.settingService.updatePickupSlots(actor, slots)

    session.flash('success', 'Jadwal slot penjemputan berhasil disimpan.')
    return response.redirect().back()
  }
}
