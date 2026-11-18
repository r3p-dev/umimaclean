import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PickupSlot from '#models/pickup_slot'
import { DEFAULT_DAY_SLOTS } from '#services/pickup_slot_service'
import SettingService from '#services/setting_service'

// The default slots on every open day (SLOT-2, D106), only while there are none: re-seeding keeps
// the owner's slots.
export default class PickupSlotSeeder extends BaseSeeder {
  override async run() {
    if (await PickupSlot.query().first()) {
      return
    }
    const hours = await new SettingService().getOpeningHours()
    const openDays = hours.days.filter((day) => day.isOpen).map((day) => day.day)
    await PickupSlot.createMany(
      openDays.flatMap((weekday) => DEFAULT_DAY_SLOTS.map((slot) => ({ weekday, ...slot })))
    )
  }
}
