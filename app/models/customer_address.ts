import { belongsTo, scope } from '@adonisjs/lucid/orm'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
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

  static async countFor(user: User, transaction?: TransactionClientContract) {
    const row = await CustomerAddress.query({ client: transaction })
      .where('user_id', user.id)
      .withScopes((scopes) => scopes.active())
      .count('* as total')
      .firstOrFail()

    return Number(row.$extras.total)
  }
}
