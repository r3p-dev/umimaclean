import { belongsTo, column, hasMany, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { OrderSchema } from '#database/schema'
import { ORDER_TRANSITIONS, OrderStatus, PICKUP_PENDING_STATUSES } from '#enums/order_status_enum'
import OrderAddress from '#models/order_address'
import OrderEvent from '#models/order_event'
import OrderItem from '#models/order_item'
import User from '#models/user'

// PostgreSQL returns a `time` as "09:00:00"; the app speaks "09:00" (D103).
const clock = { consume: (value: string) => value.slice(0, 5) }

export default class Order extends OrderSchema {
  @column(clock)
  declare pickupStartsAt: string

  @column(clock)
  declare pickupEndsAt: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => OrderAddress)
  declare addresses: HasMany<typeof OrderAddress>

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @hasMany(() => OrderEvent)
  declare events: HasMany<typeof OrderEvent>

  // Orders that take a place in their slot (SLOT-3): a cancelled order frees its place, a skipped
  // pickup keeps it (M5a decision 5).
  static holdingSlotPlace = scope((query) => {
    query.whereNot('status', OrderStatus.CANCELLED)
  })

  // Orders whose pickup has not happened yet (M5a decision 1).
  static pickupPending = scope((query) => {
    query.whereIn('status', [...PICKUP_PENDING_STATUSES])
  })

  // ORD-1: the id, zero-padded, everywhere the order is named.
  number() {
    return `UMC-${String(this.id).padStart(5, '0')}`
  }

  // ORD-3.
  canTransitionTo(status: OrderStatus) {
    return ORDER_TRANSITIONS[this.status].includes(status)
  }
}
