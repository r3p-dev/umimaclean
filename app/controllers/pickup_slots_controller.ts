import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PickupSlotService from '#services/pickup_slot_service'
import SettingService from '#services/setting_service'
import PickupSlotTransformer from '#transformers/pickup_slot_transformer'
import {
  copyPickupSlotsValidator,
  pickupDaySlotsValidator,
} from '#validators/pickup_slot_validator'

// Pickup slots per weekday on /admin/pengaturan/slot (OWN-8, SLOT-2, D106).
@inject()
export default class PickupSlotsController {
  constructor(
    protected pickupSlotService: PickupSlotService,
    protected settingService: SettingService
  ) {}

  async #openDays() {
    const hours = await this.settingService.getOpeningHours()
    return hours.days.filter((day) => day.isOpen).map((day) => day.day)
  }

  async index({ inertia }: HttpContext) {
    return inertia.render('admin/settings/slots', {
      slots: PickupSlotTransformer.transform(await this.pickupSlotService.all()),
      openDays: await this.#openDays(),
    })
  }

  async update({ request, response, auth, session }: HttpContext) {
    const { params, slots } = await request.validateUsing(pickupDaySlotsValidator, {
      meta: { openDays: await this.#openDays() },
    })

    await this.pickupSlotService.replaceDay(auth.user!, params.weekday, slots)

    session.flash('success', 'Slot penjemputan berhasil disimpan.')
    return response.redirect().back()
  }

  async copy({ request, response, auth, session }: HttpContext) {
    const openDays = await this.#openDays()
    const { params } = await request.validateUsing(copyPickupSlotsValidator, {
      meta: { openDays },
    })

    const targets = await this.pickupSlotService.copyDay(auth.user!, params.weekday, openDays)

    session.flash('success', `Slot disalin ke ${targets.length} hari buka lain.`)
    return response.redirect().back()
  }
}
