import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { OrderItemSchema } from '#database/schema'
import BillLine from '#models/bill_line'

export default class OrderItem extends OrderItemSchema {
  @hasMany(() => BillLine)
  declare lines: HasMany<typeof BillLine>
}
