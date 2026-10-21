import { router } from '@inertiajs/react'
import { urlFor } from '~/client'
import { addDays, toIso } from '~/lib/shared/date'

export type CostCategory = 'Sewa' | 'Gaji' | 'Bahan' | 'Listrik & air' | 'Lainnya'

export const COST_CATEGORIES: CostCategory[] = ['Sewa', 'Gaji', 'Bahan', 'Listrik & air', 'Lainnya']

export type Cost = {
  id: string
  category: CostCategory
  note: string
  amount: number
  date: string
}

export function costTotal(list: Cost[]) {
  return list.reduce((sum, cost) => sum + cost.amount, 0)
}

export function costsForPeriod(list: Cost[], to: Date) {
  const start = toIso(addDays(to, -29))
  const end = toIso(to)
  return list.filter((cost) => cost.date >= start && cost.date <= end)
}

export function costShare(total: number, periodDays: number) {
  const share = Math.min(periodDays, 30)
  return { share, amount: Math.round((total * share) / 30) }
}

type Callbacks = { onSuccess?: () => void; onError?: (errors: Record<string, string>) => void }

export function saveCost(cost: Omit<Cost, 'id'>, id: string | null, callbacks: Callbacks = {}) {
  if (id) {
    router.put(urlFor('admin.costs.update', { id }), cost, { preserveScroll: true, ...callbacks })
  } else {
    router.post(urlFor('admin.costs.store'), cost, { preserveScroll: true, ...callbacks })
  }
}

export function deleteCost(id: string, callbacks: Callbacks = {}) {
  router.delete(urlFor('admin.costs.destroy', { id }), { preserveScroll: true, ...callbacks })
}
