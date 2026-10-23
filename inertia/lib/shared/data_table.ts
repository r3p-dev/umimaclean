import { useState } from 'react'

export type SortDirection = 'asc' | 'desc'

type SortState = { key: string; direction: SortDirection }

type TableColumn<T> = {
  key: string
  value: (row: T) => string | number
  direction?: SortDirection
}

export type TableRow = { id: string; label?: string }

export const PAGE_SIZES = [10, 25, 50]

function compare(left: string | number, right: string | number) {
  if (typeof left === 'string' || typeof right === 'string') {
    return String(left).localeCompare(String(right), 'id', { numeric: true, sensitivity: 'base' })
  }
  return left - right
}

export function useDataTable<T extends TableRow>(
  rows: T[],
  columns: TableColumn<T>[],
  options: { unit: string; sortKey?: string; sortDirection?: SortDirection; size?: number }
) {
  const [selected, setSelected] = useState<string[]>([])
  const [sort, setSort] = useState<SortState | null>(null)
  const [requestedPage, setPage] = useState(1)
  const [size, setSizeState] = useState(options.size ?? 10)

  const sortKey = sort?.key ?? options.sortKey
  const sortDirection = sort?.direction ?? options.sortDirection ?? 'asc'
  const column = columns.find((item) => item.key === sortKey)
  const sorted = rows.slice()
  if (column) {
    sorted.sort((left, right) => {
      const result = compare(column.value(left), column.value(right))
      return sortDirection === 'asc' ? result : -result
    })
  }

  const ids = new Set(sorted.map((row) => row.id))
  const valid = selected.filter((id) => ids.has(id))
  if (valid.length !== selected.length) {
    setSelected(valid)
  }
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
  for (let number = low; number <= high; number++) {
    pageNumbers.push(number)
  }

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
    sortDirection,
    sortBy(key: string) {
      const target = columns.find((item) => item.key === key)
      const isActive = key === sortKey
      setSort({
        key,
        direction: isActive
          ? sortDirection === 'asc'
            ? 'desc'
            : 'asc'
          : (target?.direction ?? 'asc'),
      })
      setPage(1)
    },
    setSort(next: SortState) {
      setSort(next)
      setPage(1)
    },
    ariaSort(key: string): 'ascending' | 'descending' | 'none' {
      return key === sortKey ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'
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
