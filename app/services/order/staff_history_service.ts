import { DateTime } from 'luxon'
import { ActivityAction } from '#enums/activity_enum'
import { OrderSource } from '#enums/order_enum'
import ActivityLog from '#models/activity_log'
import type User from '#models/user'
import { formatClock } from '#transformers/order_transformer'
import { shortName } from '#transformers/task_transformer'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

const ICON: Partial<Record<ActivityAction, 'jemput' | 'antar' | 'proses' | 'toko' | 'skip'>> = {
  [ActivityAction.PICKUP_DONE]: 'jemput',
  [ActivityAction.PICKUP_SKIPPED]: 'skip',
  [ActivityAction.DELIVERY_DONE]: 'antar',
  [ActivityAction.DELIVERY_SKIPPED]: 'skip',
  [ActivityAction.BILL_CREATED]: 'proses',
  [ActivityAction.WASH_DONE]: 'proses',
  [ActivityAction.COLLECTED]: 'proses',
  [ActivityAction.WALK_IN_CREATED]: 'toko',
  [ActivityAction.PAYMENT_RECORDED]: 'toko',
  [ActivityAction.RECEIPT_SENT]: 'toko',
}

const TITLE: Partial<Record<ActivityAction, string>> = {
  [ActivityAction.PICKUP_DONE]: 'Jemput selesai',
  [ActivityAction.PICKUP_SKIPPED]: 'Jemput dilewati',
  [ActivityAction.DELIVERY_DONE]: 'Antar selesai',
  [ActivityAction.DELIVERY_SKIPPED]: 'Antar dilewati',
  [ActivityAction.BILL_CREATED]: 'Diperiksa · tagihan dibuat',
  [ActivityAction.WASH_DONE]: 'Selesai dicuci',
  [ActivityAction.COLLECTED]: 'Diserahkan di toko',
  [ActivityAction.WALK_IN_CREATED]: 'Transaksi toko dibuat',
  [ActivityAction.PAYMENT_RECORDED]: 'Pembayaran dicatat',
  [ActivityAction.RECEIPT_SENT]: 'Struk dikirim',
}

export default class StaffHistoryService {
  async recent(user: User, days = 7) {
    const since = DateTime.now()
      .setZone(SERVICE_ZONE)
      .startOf('day')
      .minus({ days: days - 1 })
    const logs = await ActivityLog.query()
      .where('actor_id', user.id)
      .whereIn('action', Object.keys(ICON))
      .where('created_at', '>=', since.toJSDate())
      .whereNotNull('order_id')
      .preload('order')
      .orderBy('id', 'desc')

    return logs.map((log) => {
      const isSkip = ICON[log.action] === 'skip'
      return {
        id: log.id,
        date: log.createdAt.setZone(SERVICE_ZONE).toISODate()!,
        time: formatClock(log.createdAt),
        icon: ICON[log.action]!,
        title: isSkip ? TITLE[log.action]! : `${TITLE[log.action]} · ${log.detail}`,
        who: shortName(log.order.customerName),
        ref: log.order.publicCode,
        isInStore: log.order.source === OrderSource.STORE,
        note: isSkip ? log.detail : '',
      }
    })
  }
}
