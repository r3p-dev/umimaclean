export const CostCategory = {
  RENT: 'rent',
  SALARY: 'salary',
  SUPPLIES: 'supplies',
  UTILITIES: 'utilities',
  OTHER: 'other',
} as const

export const CostCategoryLabel = {
  [CostCategory.RENT]: 'Sewa',
  [CostCategory.SALARY]: 'Gaji',
  [CostCategory.SUPPLIES]: 'Bahan',
  [CostCategory.UTILITIES]: 'Listrik & air',
  [CostCategory.OTHER]: 'Lainnya',
} as const

export type CostCategory = (typeof CostCategory)[keyof typeof CostCategory]
