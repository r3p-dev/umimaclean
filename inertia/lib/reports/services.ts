import { formatRupiah } from '~/lib/shared/format'
import type { Totals } from '~/lib/reports/period'

const SERVICE_MIX: [name: string, category: string, weight: number, price: number][] = [
  ['Deep Clean', 'Sepatu', 112, 55000],
  ['Cuci Reguler', 'Sepatu', 98, 35000],
  ['Deep Clean + Unyellowing', 'Sepatu', 41, 75000],
  ['Helm Full-face', 'Helm', 30, 50000],
  ['Helm Half-face', 'Helm', 26, 35000],
  ['Cuci Tas Besar', 'Tas', 24, 65000],
  ['Cuci Tas Kecil', 'Tas', 22, 40000],
  ['Perawatan Kulit', 'Tas', 11, 85000],
]

export type ServiceRank = 'items' | 'revenue'

export const TOP_SERVICE_COUNT = 6

export function topServices(current: Totals, rank: ServiceRank) {
  const weights = SERVICE_MIX.reduce((sum, [, , weight]) => sum + weight, 0)
  const all = SERVICE_MIX.map(([name, category, weight, price]) => {
    const items = Math.round((current.items * weight) / weights)
    return { id: name, label: name, name, category, items, revenue: items * price }
  })
  const itemsTotal = all.reduce((sum, row) => sum + row.items, 0) || 1
  const top = all
    .sort((a, b) => (rank === 'revenue' ? b.revenue - a.revenue : b.items - a.items))
    .slice(0, TOP_SERVICE_COUNT)
  const largest = Math.max(...top.map((row) => row.items)) || 1
  return {
    total: SERVICE_MIX.length,
    rows: top.map((row) => ({
      ...row,
      share: Math.round((row.items / itemsTotal) * 100),
      bar: (row.items / largest) * 100,
      revenueText: formatRupiah(row.revenue),
    })),
  }
}

export type ServiceRow = ReturnType<typeof topServices>['rows'][number]
