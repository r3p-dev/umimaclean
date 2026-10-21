import { formatRupiah } from '~/lib/shared/format'
import { toIso } from '~/lib/shared/date'

export type ServiceDayRow = [
  date: string,
  name: string,
  category: string,
  items: number,
  revenue: number,
]

export type ServiceRank = 'items' | 'revenue'

export const TOP_SERVICE_COUNT = 6

export function topServices(rows: ServiceDayRow[], from: Date, to: Date, rank: ServiceRank) {
  const start = toIso(from)
  const end = toIso(to)
  const totals = new Map<
    string,
    { name: string; category: string; items: number; revenue: number }
  >()
  for (const [date, name, category, items, revenue] of rows) {
    if (date < start || date > end) {
      continue
    }
    const key = `${name}·${category}`
    const current = totals.get(key) ?? { name, category, items: 0, revenue: 0 }
    current.items += items
    current.revenue += revenue
    totals.set(key, current)
  }
  const all = [...totals.values()].map((row) => ({ ...row, id: row.name, label: row.name }))
  const itemsTotal = all.reduce((sum, row) => sum + row.items, 0) || 1
  const top = all
    .sort((left, right) =>
      rank === 'revenue' ? right.revenue - left.revenue : right.items - left.items
    )
    .slice(0, TOP_SERVICE_COUNT)
  const largest = Math.max(1, ...top.map((row) => row.items))
  return {
    total: all.length,
    rows: top.map((row) => ({
      ...row,
      share: Math.round((row.items / itemsTotal) * 100),
      bar: (row.items / largest) * 100,
      revenueText: formatRupiah(row.revenue),
    })),
  }
}

export type ServiceRow = ReturnType<typeof topServices>['rows'][number]
