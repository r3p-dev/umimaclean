import { useState } from 'react'

export type SortDir = 'asc' | 'desc'

export type SortState = { key: string; dir: SortDir }

export type TableColumn<T> = {
  key: string
  value: (row: T) => string | number
  dir?: SortDir
}

export type TableRow = { id: string; label?: string }

export const PAGE_SIZES = [10, 25, 50]

function compare(a: string | number, b: string | number) {
  if (typeof a === 'string' || typeof b === 'string') {
    return String(a).localeCompare(String(b), 'id', { numeric: true, sensitivity: 'base' })
  }
  return a - b
}

export function useDataTable<T extends TableRow>(
  rows: T[],
  columns: TableColumn<T>[],
  options: { unit: string; sortKey?: string; sortDir?: SortDir; size?: number }
) {
  const [selected, setSelected] = useState<string[]>([])
  const [sort, setSort] = useState<SortState | null>(null)
  const [requestedPage, setPage] = useState(1)
  const [size, setSizeState] = useState(options.size ?? 10)

  const sortKey = sort?.key ?? options.sortKey
  const sortDir = sort?.dir ?? options.sortDir ?? 'asc'
  const column = columns.find((item) => item.key === sortKey)
  const sorted = rows.slice()
  if (column) {
    sorted.sort((a, b) => {
      const result = compare(column.value(a), column.value(b))
      return sortDir === 'asc' ? result : -result
    })
  }

  const ids = new Set(sorted.map((row) => row.id))
  const valid = selected.filter((id) => ids.has(id))
  if (valid.length !== selected.length) setSelected(valid)
  const selectedSet = new Set(valid)

  const pages = Math.max(1, Math.ceil(sorted.length / size))
  const page = Math.min(Math.max(1, requestedPage), pages)
  const start = (page - 1) * size
  const pageRows = sorted.slice(start, start + size)
  const onPage = pageRows.filter((row) => selectedSet.has(row.id)).length
  const allState: boolean | 'indeterminate' =
    pageRows.length > 0 && onPage === pageRows.length ? true : onPage > 0 ? 'indeterminate' : false

  const low = Math.max(1, Math.min(page - 2, pages - 4))
  const high = Math.min(pages, low + 4)
  const pageNumbers: number[] = []
  for (let number = low; number <= high; number++) pageNumbers.push(number)

  return {
    rows: pageRows,
    sorted,
    total: sorted.length,
    unit: options.unit,
    isSelected: (id: string) => selectedSet.has(id),
    selectedRows: sorted.filter((row) => selectedSet.has(row.id)),
    selectedCount: valid.length,
    allState,
    canSelectAll: allState === true && valid.length < sorted.length,
    toggle(id: string) {
      setSelected(selectedSet.has(id) ? valid.filter((item) => item !== id) : [...valid, id])
    },
    toggleAll() {
      const pageIds = pageRows.map((row) => row.id)
      setSelected(
        allState === true
          ? valid.filter((id) => !pageIds.includes(id))
          : Array.from(new Set([...valid, ...pageIds]))
      )
    },
    selectAll() {
      setSelected(sorted.map((row) => row.id))
    },
    clear() {
      setSelected([])
    },
    sortKey,
    sortDir,
    sortBy(key: string) {
      const target = columns.find((item) => item.key === key)
      const active = key === sortKey
      setSort({ key, dir: active ? (sortDir === 'asc' ? 'desc' : 'asc') : (target?.dir ?? 'asc') })
      setPage(1)
    },
    setSort(next: SortState) {
      setSort(next)
      setPage(1)
    },
    ariaSort(key: string): 'ascending' | 'descending' | 'none' {
      return key === sortKey ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
    },
    page,
    pages,
    pageNumbers,
    setPage,
    resetPage() {
      setPage(1)
    },
    size,
    setSize(next: number) {
      setSizeState(next)
      setPage(1)
    },
    rangeText: sorted.length
      ? `${start + 1}–${start + pageRows.length} dari ${sorted.length} ${options.unit}`
      : `0 ${options.unit}`,
  }
}

export type DataTable<T extends TableRow> = ReturnType<typeof useDataTable<T>>
