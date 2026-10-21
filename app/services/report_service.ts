import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { ActivityActionLabel, ActivityCategoryOf } from '#enums/activity_enum'
import { CostCategoryLabel } from '#enums/cost_enum'
import { ItemKindLabel, type ItemKind } from '#enums/order_enum'
import ActivityLog from '#models/activity_log'
import OperatingCost from '#models/operating_cost'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

export const REPORT_MAX_DAYS = 400

type DayRow = [
  date: string,
  revenue: number,
  transactions: number,
  items: number,
  online: number,
  storeQris: number,
  cash: number,
  edc: number,
]

type ServiceRow = [date: string, name: string, category: string, items: number, revenue: number]

const LOCAL_DAY = `(p.paid_at at time zone '${SERVICE_ZONE}')::date`

export default class ReportService {
  today() {
    return DateTime.now().setZone(SERVICE_ZONE).startOf('day')
  }

  async range() {
    const today = this.today()
    const earliest = await db
      .from('payments as p')
      .where('p.status', 'paid')
      .select(db.raw(`to_char(min(${LOCAL_DAY}), 'YYYY-MM-DD') as day`))
      .first()
    const first = earliest?.day ? DateTime.fromISO(earliest.day, { zone: SERVICE_ZONE }) : today
    const floor = today.minus({ days: REPORT_MAX_DAYS - 1 })
    const start = DateTime.min(first.startOf('day'), today.minus({ days: 29 }))
    return { start: DateTime.max(start, floor), end: today }
  }

  async days(): Promise<{ start: string; end: string; days: DayRow[] }> {
    const { start, end } = await this.range()
    const result = await db.rawQuery<{ rows: Record<string, string>[] }>(
      `with series as (
        select generate_series(?::date, ?::date, interval '1 day')::date as day
      ), paid as (
        select ${LOCAL_DAY} as day, p.amount, p.method, p.channel, p.order_id
        from payments p where p.status = 'paid'
      )
      select to_char(s.day, 'YYYY-MM-DD') as day,
        coalesce(sum(paid.amount), 0) as revenue,
        count(paid.order_id) as transactions,
        coalesce(sum((select count(*) from order_items i where i.order_id = paid.order_id)), 0) as items,
        coalesce(sum(paid.amount) filter (where paid.channel = 'online'), 0) as online,
        coalesce(sum(paid.amount) filter (where paid.channel = 'counter' and paid.method = 'qris'), 0) as store_qris,
        coalesce(sum(paid.amount) filter (where paid.method = 'cash'), 0) as cash,
        coalesce(sum(paid.amount) filter (where paid.method = 'card'), 0) as edc
      from series s left join paid on paid.day = s.day
      group by s.day order by s.day`,
      [start.toISODate(), end.toISODate()]
    )
    return {
      start: start.toISODate()!,
      end: end.toISODate()!,
      days: result.rows.map((row) => [
        row.day,
        Number(row.revenue),
        Number(row.transactions),
        Number(row.items),
        Number(row.online),
        Number(row.store_qris),
        Number(row.cash),
        Number(row.edc),
      ]),
    }
  }

  async services(start: string): Promise<ServiceRow[]> {
    const result = await db.rawQuery<{ rows: Record<string, string>[] }>(
      `select to_char(${LOCAL_DAY}, 'YYYY-MM-DD') as day, l.name, i.kind,
        count(*) as items, sum(l.price) as revenue
      from payments p
      join bills b on b.order_id = p.order_id
      join bill_lines l on l.bill_id = b.id
      join order_items i on i.id = l.order_item_id
      where p.status = 'paid' and ${LOCAL_DAY} >= ?::date
      group by 1, 2, 3`,
      [start]
    )
    return result.rows.map((row) => [
      row.day,
      row.name,
      ItemKindLabel[row.kind as ItemKind] ?? row.kind,
      Number(row.items),
      Number(row.revenue),
    ])
  }

  async costs() {
    const costs = await OperatingCost.query().orderBy('spent_on', 'desc').orderBy('id', 'desc')
    return costs.map((cost) => ({
      id: String(cost.id),
      category: CostCategoryLabel[cost.category],
      note: cost.note,
      amount: cost.amount,
      date: cost.spentOn.toISODate()!,
    }))
  }

  async activity(limit?: number) {
    const query = ActivityLog.query()
      .where('created_at', '>=', this.today().minus({ days: 90 }).toJSDate())
      .preload('actor')
      .preload('order')
      .orderBy('id', 'desc')
    if (limit) {
      query.limit(limit)
    }
    const logs = await query
    return logs.map((log) => {
      const local = log.createdAt.setZone(SERVICE_ZONE)
      return {
        id: String(log.id),
        date: local.toISODate()!,
        time: local.toFormat('HH.mm'),
        staff: log.actor?.name ?? 'Sistem',
        action: ActivityActionLabel[log.action],
        category: ActivityCategoryOf[log.action],
        ref: log.order?.publicCode ?? '—',
        detail: log.detail,
        isSensitive: log.isSensitive,
      }
    })
  }
}
