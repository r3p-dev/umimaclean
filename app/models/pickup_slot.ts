import { column, scope } from '@adonisjs/lucid/orm'
import { PickupSlotSchema } from '#database/schema'

// PostgreSQL returns a `time` as "09:00:00"; the app speaks "09:00" (D103).
const clock = { consume: (value: string) => value.slice(0, 5) }

export default class PickupSlot extends PickupSlotSchema {
  @column(clock)
  declare startsAt: string

  @column(clock)
  declare endsAt: string

  static ordered = scope((query) => {
    query.orderBy('weekday', 'asc').orderBy('starts_at', 'asc')
  })
}
