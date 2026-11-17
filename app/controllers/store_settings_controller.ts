import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import SettingService from '#services/setting_service'
import OpeningHoursTransformer from '#transformers/opening_hours_transformer'
import PickupSlotTransformer from '#transformers/pickup_slot_transformer'
import {
  openingHoursValidator,
  pickupSlotsSettingValidator,
  storeSettingValidator,
} from '#validators/setting_validator'

@inject()
export default class StoreSettingsController {
  constructor(protected settingService: SettingService) {}

  async index({ inertia }: HttpContext) {
    const slots = await this.settingService.getPickupSlots()

    return inertia.render('admin/settings/store', {
      slots: PickupSlotTransformer.transform(slots),
      pickupDays: await this.settingService.getPickupDays(),
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

  async updateSlots({ request, response, auth, session }: HttpContext) {
    const actor = auth.user!
    const { slots, pickupDays } = await request.validateUsing(pickupSlotsSettingValidator)

    await this.settingService.updatePickupSlots(actor, slots)
    await this.settingService.updatePickupDays(actor, pickupDays)

    session.flash('success', 'Jadwal slot penjemputan berhasil disimpan.')
    return response.redirect().back()
  }
}
