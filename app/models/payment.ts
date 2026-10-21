import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { PaymentSchema } from '#database/schema'
import Order from '#models/order'
import User from '#models/user'

export default class Payment extends PaymentSchema {
  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => User, { foreignKey: 'recordedBy' })
  declare recorder: BelongsTo<typeof User>
}
