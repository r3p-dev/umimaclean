import type { ItemCounts } from '~/lib/order/items'

export type ItemCategory = 'Sepatu' | 'Tas' | 'Helm'

export const CATEGORY_KEY: Record<ItemCategory, keyof ItemCounts> = {
  Sepatu: 'sepatu',
  Tas: 'tas',
  Helm: 'helm',
}

export type ServiceOption = { name: string; price: number }

export const SERVICE_CATALOG: Record<
  ItemCategory,
  { base: ServiceOption[]; adds: ServiceOption[] }
> = {
  Sepatu: {
    base: [
      { name: 'Cuci Reguler', price: 35000 },
      { name: 'Deep Clean', price: 45000 },
    ],
    adds: [
      { name: 'Whitening', price: 10000 },
      { name: 'Unyellowing sol', price: 20000 },
      { name: 'Leather conditioning', price: 10000 },
      { name: 'Waterproofing', price: 15000 },
    ],
  },
  Tas: {
    base: [
      { name: 'Cuci Tas Kecil', price: 40000 },
      { name: 'Cuci Tas Besar', price: 65000 },
    ],
    adds: [
      { name: 'Perawatan kulit', price: 20000 },
      { name: 'Waterproofing', price: 15000 },
    ],
  },
  Helm: {
    base: [
      { name: 'Helm Half-face', price: 35000 },
      { name: 'Helm Full-face', price: 50000 },
    ],
    adds: [{ name: 'Anti-bau', price: 8000 }],
  },
}

export type Selection = { base: string | null; adds: string[] }

export function selectionLines(category: ItemCategory, selection: Selection | undefined) {
  if (!selection) return []
  const catalog = SERVICE_CATALOG[category]
  const base = catalog.base.find((option) => option.name === selection.base)
  const adds = catalog.adds.filter((option) => selection.adds.includes(option.name))
  return base ? [base, ...adds] : adds
}

export function selectionTotal(category: ItemCategory, selection: Selection | undefined) {
  return selectionLines(category, selection).reduce((sum, option) => sum + option.price, 0)
}
