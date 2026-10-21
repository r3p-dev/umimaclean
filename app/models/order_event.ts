import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { OrderEventSchema } from '#database/schema'
import User from '#models/user'

export default class OrderEvent extends OrderEventSchema {
  @belongsTo(() => User, { foreignKey: 'actorId' })
  declare actor: BelongsTo<typeof User>
}
