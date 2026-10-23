import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { ActivityAction } from '#enums/activity_enum'
import { MessagePurpose, MessageStatus } from '#enums/message_enum'
import { PaymentStatus } from '#enums/payment_enum'
import { Role } from '#enums/role_enum'
import ActivityLog from '#models/activity_log'
import User from '#models/user'
import WhatsappMessage from '#models/whatsapp_message'
import NotificationService from '#services/notification_service'
import { maskPhone } from '#services/phone_service'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

export const REMINDER_COOLDOWN_DAYS = 7

type CustomerRow = {
  id: number
  name: string
  phone: string
  created_at: Date
  last_paid: Date | null
  first_paid: Date | null
  orders: string
  spend: string
  address_text: string | null
}

function isoDate(value: Date) {
  return DateTime.fromJSDate(value).setZone(SERVICE_ZONE).toISODate()!
}

@inject()
export default class CustomerInsightService {
  constructor(protected notifications: NotificationService) {}

  async customers() {
    const result = await db.rawQuery<{ rows: CustomerRow[] }>(
      `select u.id, u.name, u.phone, u.created_at,
        max(p.paid_at) as last_paid, min(p.paid_at) as first_paid,
        count(distinct p.order_id) as orders, coalesce(sum(p.amount), 0) as spend,
        (select a.address_text from customer_addresses a
          where a.user_id = u.id and a.deleted_at is null and a.is_primary limit 1) as address_text
      from users u
      left join orders o on o.user_id = u.id
      left join payments p on p.order_id = o.id and p.status = ?
      where u.role = ?
      group by u.id
      order by last_paid desc nulls last`,
      [PaymentStatus.PAID, Role.CUSTOMER]
    )
    const reminded = await this.#remindedRecently()
    const today = DateTime.now().setZone(SERVICE_ZONE).startOf('day')

    return result.rows.map((row) => {
      const last = row.last_paid ?? row.created_at
      const first = row.first_paid ?? row.created_at
      const parts = (row.address_text ?? '').split(',').map((part) => part.trim())
      return {
        id: String(row.id),
        label: row.name,
        name: row.name,
        phone: maskPhone(row.phone),
        area: parts.length >= 2 ? parts[parts.length - 2] : '—',
        last: isoDate(last),
        first: isoDate(first),
        orders: Number(row.orders),
        spend: Number(row.spend),
        days: Math.max(
          0,
          Math.floor(
            today.diff(DateTime.fromJSDate(last).setZone(SERVICE_ZONE).startOf('day'), 'days').days
          )
        ),
        isNew: today.diff(DateTime.fromJSDate(first), 'days').days <= 30,
        hasPaid: row.last_paid !== null,
        isReminded: reminded.has(row.id),
      }
    })
  }

  async remind(owner: User, ids: number[], message: string) {
    const reminded = await this.#remindedRecently()
    const customers = await User.query().whereIn('id', ids).where('role', Role.CUSTOMER)
    const result = { sent: 0, logged: 0, failed: 0, skipped: 0 }
    for (const customer of customers) {
      if (reminded.has(customer.id)) {
        result.skipped += 1
        continue
      }
      const status = await this.notifications.toUser(
        customer,
        MessagePurpose.REMINDER,
        message.replaceAll('{nama}', customer.firstName())
      )
      if (status === MessageStatus.SENT) {
        result.sent += 1
      } else if (status === MessageStatus.LOGGED) {
        result.logged += 1
      } else {
        result.failed += 1
      }
    }
    await ActivityLog.record({
      actor: owner,
      action: ActivityAction.REMINDER_SENT,
      detail: `${result.sent} terkirim, ${result.failed} gagal, ${result.skipped} dilewati`,
    })
    return result
  }

  async #remindedRecently() {
    const rows = await WhatsappMessage.query()
      .where('purpose', MessagePurpose.REMINDER)
      .whereNot('status', MessageStatus.FAILED)
      .where('created_at', '>=', DateTime.now().minus({ days: REMINDER_COOLDOWN_DAYS }).toJSDate())
      .whereNotNull('user_id')
      .select('user_id')
    return new Set(rows.map((row) => row.userId!))
  }
}
