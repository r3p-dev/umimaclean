import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BillLineSchema } from '#database/schema'
import Service from '#models/service'

export default class BillLine extends BillLineSchema {
  @belongsTo(() => Service)
  declare service: BelongsTo<typeof Service>
}
