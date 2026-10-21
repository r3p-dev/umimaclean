export type ItemCategory = 'Sepatu' | 'Tas' | 'Helm'

export type ServiceOption = { id: number; name: string; price: number }

export type CategoryCatalog = { base: ServiceOption[]; adds: ServiceOption[] }

export type Catalog = Record<string, CategoryCatalog>

export type Selection = { main: number | null; addons: number[] }

export function selectionLines(catalog: CategoryCatalog | undefined, selection: Selection) {
  if (!catalog) {
    return []
  }
  const base = catalog.base.find((option) => option.id === selection.main)
  const adds = catalog.adds.filter((option) => selection.addons.includes(option.id))
  return base ? [base, ...adds] : adds
}

export function selectionTotal(catalog: CategoryCatalog | undefined, selection: Selection) {
  return selectionLines(catalog, selection).reduce((sum, option) => sum + option.price, 0)
}
