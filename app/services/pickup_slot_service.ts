import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import ActivityLog from '#models/activity_log'
import Order from '#models/order'
import PickupSlot from '#models/pickup_slot'
import type User from '#models/user'
import { DAY_NAMES, ZONE, displayTime, pickupDates } from '#helpers/opening_hours'
import { fieldError } from '#helpers/validation'
import SettingService from '#services/setting_service'

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

// A slot as a customer sees it on a date (SLOT-3): the places already taken, and whether it can be
// chosen (switched on and not full).
export type DateSlot = { slot: PickupSlot; taken: number; isAvailable: boolean }

// Pickup slots per weekday (SLOT-2, D106), the dates and places customers can choose (SLOT-1,
// SLOT-3). A slot with pending pickups keeps its times (M5a decision 1).
@inject()
export default class PickupSlotService {
  constructor(protected settingService: SettingService) {}

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

  // SLOT-1: the pickup dates a customer can choose, tomorrow up to 7 days ahead in Jakarta.
  async listPickupDates(now: DateTime = DateTime.now()) {
    const tomorrow = now.setZone(ZONE).plus({ days: 1 }).startOf('day')
    return pickupDates(
      await this.settingService.getOpeningHours(),
      await this.weekdaysWithActiveSlots(),
      tomorrow,
      tomorrow.plus({ days: 6 })
    )
  }

  // SLOT-1, SLOT-3: the slots of a pickup date ("2026-11-27") with the places already taken.
  async listSlotsForDate(date: string): Promise<DateSlot[]> {
    const slots = await this.forWeekday(DateTime.fromISO(date, { zone: ZONE }).weekday)
    const taken = await this.#countTakenPlaces(
      slots.map((slot) => slot.id),
      date
    )
    return slots.map((slot) => {
      const count = taken.get(slot.id) ?? 0
      return { slot, taken: count, isAvailable: slot.isActive && count < slot.capacity }
    })
  }

  // SLOT-3: the places taken in one slot on a date, inside the transaction that locked the slot.
  async countTakenPlaces(slotId: number, date: string, client: TransactionClientContract) {
    const taken = await this.#countTakenPlaces([slotId], date, client)
    return taken.get(slotId) ?? 0
  }

  async #countTakenPlaces(slotIds: number[], date: string, client?: TransactionClientContract) {
    const rows = await Order.query({ client })
      .withScopes((scopes) => scopes.holdingSlotPlace())
      .whereIn('pickup_slot_id', slotIds)
      .where('pickup_date', date)
      .groupBy('pickup_slot_id')
      .select('pickup_slot_id')
      .count('* as taken')
    return new Map(rows.map((row) => [row.pickupSlotId!, Number(row.$extras.taken)]))
  }

  // M5a decision 1: a slot with pending pickups from today on cannot be deleted, re-timed or copied
  // over; it can only be switched off or get another capacity. Its orders keep their copied times.
  async #refuseSlotsWithPendingPickups(
    slots: PickupSlot[],
    field: string,
    client: TransactionClientContract
  ) {
    if (slots.length === 0) {
      return
    }
    const order = await Order.query({ client })
      .withScopes((scopes) => scopes.pickupPending())
      .whereIn(
        'pickup_slot_id',
        slots.map((slot) => slot.id)
      )
      .where('pickup_date', '>=', DateTime.now().setZone(ZONE).toISODate()!)
      .first()
    const slot = order && slots.find((candidate) => candidate.id === order.pickupSlotId)
    if (slot) {
      fieldError(
        field,
        `Slot ${DAY_NAMES[slot.weekday - 1]} ${displayTime(slot.startsAt)}–${displayTime(slot.endsAt)} masih punya pesanan yang belum dijemput. Slot itu hanya bisa dimatikan atau diubah kapasitasnya.`,
        'slotHasOrders'
      )
    }
  }

  // Saves one day's list: listed ids are updated, new entries created, missing ones deleted.
  async replaceDay(actor: User, weekday: number, slots: DaySlotInput[]) {
    await db.transaction(async (trx) => {
      // Locked, so no order can take one of these slots while they change (SLOT-3).
      const existing = await PickupSlot.query({ client: trx }).where('weekday', weekday).forUpdate()
      const keptIds = new Set(slots.flatMap((slot) => (slot.id ? [slot.id] : [])))
      const deletedOrRetimed = existing.filter((slot) => {
        const input = slots.find((candidate) => candidate.id === slot.id)
        return !input || input.startsAt !== slot.startsAt || input.endsAt !== slot.endsAt
      })
      await this.#refuseSlotsWithPendingPickups(deletedOrRetimed, 'slots', trx)
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
      const overwritten = await PickupSlot.query({ client: trx })
        .whereIn('weekday', targets)
        .forUpdate()
      await this.#refuseSlotsWithPendingPickups(overwritten, 'params.weekday', trx)
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
