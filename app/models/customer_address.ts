import { belongsTo, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { CustomerAddressSchema } from '#database/schema'
import User from '#models/user'

export const MAX_ACTIVE_ADDRESSES = 5

export default class CustomerAddress extends CustomerAddressSchema {
  static active = scope((query) => {
    query.whereNull('deleted_at')
  })

  static primaryFirst = scope((query) => {
    query
      .orderBy('is_primary', 'desc')
      .orderByRaw('last_used_at desc nulls last')
      .orderBy('id', 'desc')
  })

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
