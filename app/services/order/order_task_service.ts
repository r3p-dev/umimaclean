import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import type { OrderTask } from '#enums/order_enum'
import type Order from '#models/order'
import type User from '#models/user'
import { fieldError } from '#validators/shared/field_error'

export const CLAIM_HOURS = 3

export const TASK_TAKEN_MESSAGE = 'Tugas ini sedang ditangani staf lain. Pilih pesanan lain.'

export default class OrderTaskService {
  claimFloor() {
    return DateTime.now().minus({ hours: CLAIM_HOURS })
  }

  isHeldByOther(user: User, order: Order) {
    if (order.claimedBy === null || order.claimedBy === user.id) {
      return false
    }
    return !!order.claimedAt && order.claimedAt > this.claimFloor()
  }

  holds(user: User, order: Order) {
    return order.claimedBy === user.id && !!order.claimedAt && order.claimedAt > this.claimFloor()
  }

  assertAvailable(user: User, order: Order) {
    if (this.isHeldByOther(user, order)) {
      throw fieldError('form', TASK_TAKEN_MESSAGE, 'task.taken')
    }
  }

  async claim(user: User, order: Order, task: OrderTask, transaction: TransactionClientContract) {
    this.assertAvailable(user, order)
    order.useTransaction(transaction)
    order.merge({ claimedBy: user.id, claimedTask: task, claimedAt: DateTime.now() })
    await order.save()
  }

  async clear(order: Order, transaction: TransactionClientContract) {
    order.useTransaction(transaction)
    order.merge({ claimedBy: null, claimedTask: null, claimedAt: null })
    await order.save()
  }

  available(user: User, query: ModelQueryBuilderContract<typeof Order>) {
    return query.where((builder) => {
      builder
        .whereNull('claimed_by')
        .orWhere('claimed_by', user.id)
        .orWhere('claimed_at', '<', this.claimFloor().toJSDate())
    })
  }
}
