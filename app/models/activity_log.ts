import { belongsTo } from '@adonisjs/lucid/orm'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { ActivityLogSchema } from '#database/schema'
import type { ActivityAction } from '#enums/activity_enum'
import Order from '#models/order'
import User from '#models/user'

type ActivityEntry = {
  actor: User | null
  action: ActivityAction
  order?: Order | null
  detail?: string
  isSensitive?: boolean
}

export default class ActivityLog extends ActivityLogSchema {
  @belongsTo(() => User, { foreignKey: 'actorId' })
  declare actor: BelongsTo<typeof User>

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  static forOrder(order: Order) {
    return ActivityLog.query().where('order_id', order.id).preload('actor').orderBy('id', 'desc')
  }

  static async record(entry: ActivityEntry, transaction?: TransactionClientContract) {
    if (!entry.actor || entry.actor.isCustomer()) {
      return null
    }

    return ActivityLog.create(
      {
        actorId: entry.actor.id,
        orderId: entry.order?.id ?? null,
        action: entry.action,
        detail: entry.detail ?? '',
        isSensitive: entry.isSensitive ?? false,
      },
      { client: transaction }
    )
  }
}
