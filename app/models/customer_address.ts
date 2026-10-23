import { belongsTo, scope } from '@adonisjs/lucid/orm'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { CustomerAddressSchema } from '#database/schema'
import User from '#models/user'

export const MAX_ADDRESSES = 3

export default class CustomerAddress extends CustomerAddressSchema {
  static primaryFirst = scope((query) => {
    query.orderBy('is_primary', 'desc').orderBy('id', 'desc')
  })

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  static async countFor(user: User, transaction?: TransactionClientContract) {
    const row = await CustomerAddress.query({ client: transaction })
      .where('user_id', user.id)
      .count('* as total')
      .firstOrFail()

    return Number(row.$extras.total)
  }
}
