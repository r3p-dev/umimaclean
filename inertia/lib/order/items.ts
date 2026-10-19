export type ItemCounts = { sepatu: number; tas: number; helm: number }

export const EMPTY_ITEMS: ItemCounts = { sepatu: 0, tas: 0, helm: 0 }

export function totalItems(items: ItemCounts) {
  return items.sepatu + items.tas + items.helm
}

export function itemsSummary(items: ItemCounts) {
  const parts = (
    [
      ['Sepatu', items.sepatu],
      ['Tas', items.tas],
      ['Helm', items.helm],
    ] as const
  )
    .filter(([, count]) => count > 0)
    .map(([label, count]) => `${label} ×${count}`)
  return parts.join(', ') || '—'
}
