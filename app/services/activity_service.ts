import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { ActivityAction } from '#enums/activity_enum'
import ActivityLog from '#models/activity_log'
import type Order from '#models/order'
import type User from '#models/user'

export type ActivityEntry = {
  actor: User | null
  action: ActivityAction
  order?: Order | null
  detail?: string
  isSensitive?: boolean
}

export default class ActivityService {
  async record(entry: ActivityEntry, transaction?: TransactionClientContract) {
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
