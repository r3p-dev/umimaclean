import { FINISHED_STATUSES, OrderStatus } from '#enums/order_enum'
import Order from '#models/order'
import type User from '#models/user'

export const ORDER_FILTERS = ['semua', 'berjalan', 'selesai', 'dibatalkan'] as const
export const ORDERS_PER_PAGE = 10

export type OrderFilter = (typeof ORDER_FILTERS)[number]

export function orderFilterOf(value: unknown): OrderFilter {
  return ORDER_FILTERS.find((filter) => filter === value) ?? 'semua'
}

export function orderSearchTerm(value: unknown) {
  return String(value ?? '')
    .toUpperCase()
    .replace(/^UMC-?/, '')
    .replace(/[^0-9A-Z]/g, '')
    .slice(0, 6)
}

export default class OrderHistoryService {
  #forUser(user: User) {
    return Order.query()
      .where('user_id', user.id)
      .withScopes((scopes) => {
        scopes.withDetails()
        scopes.withHistory()
      })
  }

  latestActive(user: User) {
    return this.#forUser(user)
      .whereNotIn('status', [...FINISHED_STATUSES])
      .orderBy('created_at', 'desc')
      .first()
  }

  recentCompleted(user: User, limit = 3) {
    return this.#forUser(user)
      .where('status', OrderStatus.COMPLETED)
      .orderBy('created_at', 'desc')
      .limit(limit)
  }

  async list(user: User, options: { filter: OrderFilter; search: string; page: number }) {
    const query = this.#forUser(user).orderBy('created_at', 'desc')
    if (options.filter === 'berjalan') {
      query.whereNotIn('status', [...FINISHED_STATUSES])
    }
    if (options.filter === 'selesai') {
      query.where('status', OrderStatus.COMPLETED)
    }
    if (options.filter === 'dibatalkan') {
      query.where('status', OrderStatus.CANCELLED)
    }
    if (options.search) {
      query.whereILike('public_code', `%${options.search}%`)
    }
    const result = await query.paginate(options.page, ORDERS_PER_PAGE)
    return {
      orders: result.all(),
      meta: { currentPage: result.currentPage, lastPage: result.lastPage, total: result.total },
      counts: await this.#filterCounts(user),
    }
  }

  async hasOrders(user: User) {
    return !!(await Order.query().where('user_id', user.id).select('id').first())
  }

  async #filterCounts(user: User): Promise<Record<OrderFilter, number>> {
    const rows = await Order.query()
      .where('user_id', user.id)
      .select('status')
      .count('* as total')
      .groupBy('status')
    const totals = Object.fromEntries(
      rows.map((row) => [row.status, Number(row.$extras.total)])
    ) as Partial<Record<OrderStatus, number>>
    const all = Object.values(totals).reduce((sum, count) => sum + count, 0)
    const completed = totals[OrderStatus.COMPLETED] ?? 0
    const cancelled = totals[OrderStatus.CANCELLED] ?? 0
    return {
      semua: all,
      berjalan: all - completed - cancelled,
      selesai: completed,
      dibatalkan: cancelled,
    }
  }
}
