import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import ActivityLog from '#models/activity_log'
import PickupSlot from '#models/pickup_slot'
import type User from '#models/user'
import { DAY_NAMES } from '#helpers/opening_hours'

export type DaySlotInput = {
  id?: number
  startsAt: string
  endsAt: string
  capacity: number
  isActive: boolean
}

// What a new open day starts with (SLOT-2): the three slots the shop has always offered.
export const DEFAULT_DAY_SLOTS: DaySlotInput[] = [
  { startsAt: '09:00', endsAt: '12:00', capacity: 6, isActive: true },
  { startsAt: '12:00', endsAt: '15:00', capacity: 6, isActive: true },
  { startsAt: '15:00', endsAt: '18:00', capacity: 4, isActive: true },
]

// Pickup slots per weekday (SLOT-2, D106). Deleting a slot that has orders is decided in M5a.
@inject()
export default class PickupSlotService {
  all() {
    return PickupSlot.query().withScopes((scopes) => scopes.ordered())
  }

  forWeekday(weekday: number) {
    return this.all().where('weekday', weekday)
  }

  // The weekdays with at least one slot switched on, for `pickupDates` (SLOT-1).
  async weekdaysWithActiveSlots() {
    const rows = await PickupSlot.query().where('is_active', true).distinct('weekday')
    return new Set(rows.map((row) => row.weekday))
  }

  // Saves one day's list: listed ids are updated, new entries created, missing ones deleted.
  async replaceDay(actor: User, weekday: number, slots: DaySlotInput[]) {
    await db.transaction(async (trx) => {
      const existing = await PickupSlot.query({ client: trx }).where('weekday', weekday)
      const keptIds = new Set(slots.flatMap((slot) => (slot.id ? [slot.id] : [])))
      const toDelete = existing.filter((slot) => !keptIds.has(slot.id)).map((slot) => slot.id)
      if (toDelete.length > 0) {
        await PickupSlot.query({ client: trx }).whereIn('id', toDelete).delete()
      }
      for (const input of slots) {
        const fields = {
          weekday,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          capacity: input.capacity,
          isActive: input.isActive,
        }
        const slot = input.id ? existing.find((row) => row.id === input.id) : undefined
        if (slot) {
          await slot.useTransaction(trx).merge(fields).save()
        } else {
          await PickupSlot.create(fields, { client: trx })
        }
      }
      await ActivityLog.create(
        {
          userId: actor.id,
          category: 'settings',
          action: 'settings.slots.update',
          description: `Memperbarui slot penjemputan ${DAY_NAMES[weekday - 1]} (${slots.length} slot)`,
          isSensitive: false,
        },
        { client: trx }
      )
    })
  }

  // "Salin slot Senin ke hari buka lain": every other open day gets a copy of this day's slots.
  async copyDay(actor: User, weekday: number, openDays: number[]) {
    const source = await this.forWeekday(weekday)
    const targets = openDays.filter((day) => day !== weekday)
    await db.transaction(async (trx) => {
      await PickupSlot.query({ client: trx }).whereIn('weekday', targets).delete()
      const copies = targets.flatMap((day) =>
        source.map((slot) => ({
          weekday: day,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          capacity: slot.capacity,
          isActive: slot.isActive,
        }))
      )
      if (copies.length > 0) {
        await PickupSlot.createMany(copies, { client: trx })
      }
      await ActivityLog.create(
        {
          userId: actor.id,
          category: 'settings',
          action: 'settings.slots.copy',
          description: `Menyalin slot penjemputan ${DAY_NAMES[weekday - 1]} ke ${targets.map((day) => DAY_NAMES[day - 1]).join(', ')}`,
          isSensitive: false,
        },
        { client: trx }
      )
    })
    return targets
  }
}
