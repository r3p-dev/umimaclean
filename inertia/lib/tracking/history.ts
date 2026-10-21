export const ORDER_FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'berjalan', label: 'Berjalan' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'dibatalkan', label: 'Dibatalkan' },
] as const

export type OrderFilter = (typeof ORDER_FILTERS)[number]['key']

export type HistoryMeta = { currentPage: number; lastPage: number; total: number }

export function historyQuery(filter: OrderFilter, search: string, page = 1) {
  const params = new URLSearchParams()
  if (filter !== 'semua') {
    params.set('status', filter)
  }
  if (search) {
    params.set('q', search)
  }
  if (page > 1) {
    params.set('page', String(page))
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}
