import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { OrderAddressSchema } from '#database/schema'
import Order from '#models/order'

export default class OrderAddress extends OrderAddressSchema {
  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>
}
