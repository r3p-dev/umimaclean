import { column, scope } from '@adonisjs/lucid/orm'
import { ServiceSchema } from '#database/schema'
import type { ItemKind } from '#enums/item_kind_enum'

export default class Service extends ServiceSchema {
  @column({
    prepare: (value: ItemKind[] | string) =>
      typeof value === 'string' ? value : JSON.stringify(value),
    consume: (value: unknown) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare itemKinds: ItemKind[]

  static active = scope((query) => {
    query.whereNull('deleted_at').where('is_active', true)
  })

  static available = scope((query) => {
    query.whereNull('deleted_at')
  })

  static ordered = scope((query) => {
    query.orderBy('display_order', 'asc').orderBy('id', 'asc')
  })

  isAvailable(): boolean {
    return this.deletedAt === null
  }
}
