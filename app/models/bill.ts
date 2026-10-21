import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { BillSchema } from '#database/schema'
import BillLine from '#models/bill_line'
import User from '#models/user'

export default class Bill extends BillSchema {
  @hasMany(() => BillLine)
  declare lines: HasMany<typeof BillLine>

  @belongsTo(() => User, { foreignKey: 'decidedBy' })
  declare decider: BelongsTo<typeof User>
}
