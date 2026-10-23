import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { MessageStatus } from '#enums/message_enum'
import { OrderSource, OrderStatus } from '#enums/order_enum'
import { PaymentStatus } from '#enums/payment_enum'
import { orderLink, paymentReminderText } from '#helpers/whatsapp_text'
import Bill from '#models/bill'
import FonnteService from '#services/fonnte_service'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

@inject()
export default class ReminderService {
  constructor(protected fonnte: FonnteService) {}

  async sendDue(now: DateTime = DateTime.now()) {
    const hour = now.setZone(SERVICE_ZONE).hour
    if (hour < 10 || hour >= 15) {
      return 0
    }

    const due = await this.#due(Bill.query(), now).select('id')
    let sent = 0
    for (const { id } of due) {
      const isSent = await db.transaction(async (transaction) => {
        const bill = await this.#due(Bill.query({ client: transaction }), now)
          .where('id', id)
          .forUpdate()
          .skipLocked()
          .preload('order')
          .first()
        if (!bill) {
          return false
        }
        const status = await this.#send(
          bill.order.id,
          bill.order.customerPhone,
          paymentReminderText({
            customerName: bill.order.customerName,
            number: bill.order.number(),
            total: bill.total,
            link: orderLink(bill.order.id),
          })
        )
        if (status === MessageStatus.FAILED) {
          return false
        }
        bill.useTransaction(transaction)
        bill.merge({ reminderCount: bill.reminderCount + 1, lastRemindedAt: now })
        await bill.save()
        return true
      })
      sent += isSent ? 1 : 0
    }
    return sent
  }

  #due(query: ModelQueryBuilderContract<typeof Bill>, now: DateTime) {
    return query
      .whereHas('order', (order) => {
        order
          .where('status', OrderStatus.AWAITING_PAYMENT)
          .where('source', OrderSource.ONLINE)
          .whereDoesntHave('payments', (payments) => {
            payments.where('status', PaymentStatus.PAID)
          })
      })
      .where((reminder) => {
        reminder
          .where((first) => {
            first
              .whereNull('last_reminded_at')
              .where('created_at', '<=', now.minus({ hours: 24 }).toJSDate())
          })
          .orWhere('last_reminded_at', '<=', now.minus({ days: 2 }).toJSDate())
      })
  }

  async #send(orderId: number, phone: string, text: string) {
    if (!phone) {
      return MessageStatus.FAILED
    }
    try {
      const status = await this.fonnte.send(phone, text)
      if (status === MessageStatus.FAILED) {
        logger.warn({ order: orderId }, 'Payment reminder was not sent')
      }
      return status
    } catch (error) {
      logger.error({ err: error, order: orderId }, 'Payment reminder failed')
      return MessageStatus.FAILED
    }
  }
}
