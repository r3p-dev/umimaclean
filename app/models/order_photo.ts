import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { OrderPhotoSchema } from '#database/schema'
import Order from '#models/order'
import User from '#models/user'

export default class OrderPhoto extends OrderPhotoSchema {
  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => User, { foreignKey: 'takenBy' })
  declare taker: BelongsTo<typeof User>
}
