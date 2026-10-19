import { createSharedStore } from '~/lib/shared/shared_store'

export type CostCategory = 'Sewa' | 'Gaji' | 'Bahan' | 'Listrik & air' | 'Lainnya'

export const COST_CATEGORIES: CostCategory[] = ['Sewa', 'Gaji', 'Bahan', 'Listrik & air', 'Lainnya']

export type Cost = {
  id: string
  category: CostCategory
  note: string
  amount: number
  date: string
}

export const costs = createSharedStore<Cost[]>('local', 'umima:operating-costs', () => [
  { id: 'c1', category: 'Sewa', note: 'Sewa ruko Oktober', amount: 3000000, date: '1 Okt' },
  { id: 'c2', category: 'Gaji', note: 'Gaji 3 staf (porsi Okt)', amount: 3500000, date: '1 Okt' },
  { id: 'c3', category: 'Bahan', note: 'Sabun, sikat, deodorizer', amount: 700000, date: '3 Okt' },
])

export function costTotal(list: Cost[]) {
  return list.reduce((sum, cost) => sum + cost.amount, 0)
}

export function costShare(total: number, periodDays: number) {
  const share = Math.min(periodDays, 30)
  return { share, amount: Math.round((total * share) / 30) }
}

export function saveCost(cost: Omit<Cost, 'id'>, id: string | null) {
  costs.set((list) =>
    id
      ? list.map((item) => (item.id === id ? { ...item, ...cost } : item))
      : [...list, { ...cost, id: `c${Date.now()}` }]
  )
}

export function deleteCost(id: string) {
  costs.set((list) => list.filter((item) => item.id !== id))
}
