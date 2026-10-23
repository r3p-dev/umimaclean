import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { BillSchema } from '#database/schema'
import BillLine from '#models/bill_line'
import Order from '#models/order'
import User from '#models/user'

export default class Bill extends BillSchema {
  @hasMany(() => BillLine)
  declare lines: HasMany<typeof BillLine>

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => User, { foreignKey: 'decidedBy' })
  declare decider: BelongsTo<typeof User>
}
