import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { ActivityLogSchema } from '#database/schema'
import Order from '#models/order'
import User from '#models/user'

export default class ActivityLog extends ActivityLogSchema {
  @belongsTo(() => User, { foreignKey: 'actorId' })
  declare actor: BelongsTo<typeof User>

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>
}
