import { BaseSchema } from '@adonisjs/lucid/schema'

// The open days when the opening hours were never saved (their default, D101).
const MONDAY_TO_SATURDAY = [1, 2, 3, 4, 5, 6]

type OldSlot = { label: string; capacity: number; isActive: boolean }
type OldHours = { days: { day: number; isOpen: boolean }[] }

// "09.00–12.00" → ["09:00", "12:00"]; anything else is skipped.
function parseLabel(label: string) {
  const match = /^(\d{2})[.:](\d{2})\s*[–-]\s*(\d{2})[.:](\d{2})$/.exec(label.trim())
  return match ? [`${match[1]}:${match[2]}`, `${match[3]}:${match[4]}`] : null
}

export default class extends BaseSchema {
  protected tableName = 'pickup_slots'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      // ISO weekday: 1 is Monday, 7 is Sunday.
      table.smallint('weekday').notNullable()
      table.time('starts_at').notNullable()
      table.time('ends_at').notNullable()
      table.smallint('capacity').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.check('weekday BETWEEN 1 AND 7', [], 'pickup_slots_weekday_check')
      table.check('ends_at > starts_at', [], 'pickup_slots_ends_after_starts')
      table.check('capacity BETWEEN 1 AND 20', [], 'pickup_slots_capacity_check')
      table.index(['weekday', 'starts_at'])
    })

    // The slots of the old `pickup_slots` setting (the same every day) become rows on every open
    // day (D106). A fresh database has no such setting; the seeder fills it.
    this.defer(async (db) => {
      const rows = await db.from('settings').whereIn('key', ['pickup_slots', 'opening_hours'])
      const oldSlots = rows.find((row) => row.key === 'pickup_slots')?.value as
        OldSlot[] | undefined
      if (!oldSlots) return
      const hours = rows.find((row) => row.key === 'opening_hours')?.value as OldHours | undefined
      const openDays = hours
        ? hours.days.filter((day) => day.isOpen).map((day) => day.day)
        : MONDAY_TO_SATURDAY

      const slots = oldSlots.flatMap((slot) => {
        const times = parseLabel(slot.label)
        return times
          ? [
              {
                startsAt: times[0],
                endsAt: times[1],
                capacity: slot.capacity,
                isActive: slot.isActive,
              },
            ]
          : []
      })

      const now = new Date()
      const inserts = openDays.flatMap((weekday) =>
        slots.map((slot) => ({
          weekday,
          starts_at: slot.startsAt,
          ends_at: slot.endsAt,
          capacity: slot.capacity,
          is_active: slot.isActive,
          created_at: now,
          updated_at: now,
        }))
      )
      if (inserts.length > 0) {
        await db.table(this.tableName).insert(inserts)
      }
      await db.from('settings').where('key', 'pickup_slots').delete()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
