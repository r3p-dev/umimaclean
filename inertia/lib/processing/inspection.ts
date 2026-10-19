import { formatRupiah } from '~/lib/shared/format'
import {
  SERVICE_CATALOG,
  selectionLines,
  selectionTotal,
  type Selection,
} from '~/lib/processing/catalog'
import type { ProcessOrder } from '~/lib/processing/orders'
import { clockTime, workday, type InspectionState, type Workday } from '~/lib/staff/workday'

export const INSPECTION_FLOW = [
  'Barang diterima',
  'Periksa barang',
  'Tentukan layanan',
  'Set harga',
  'Simpan',
]

export function inspectionState(day: Workday, order: ProcessOrder): InspectionState {
  return (
    day.inspections[order.number] ?? {
      selections: order.initial,
      notes: Object.fromEntries(order.items.map((item) => [item.id, item.note])),
      savedAt: null,
    }
  )
}

export function inspectionStarted(day: Workday, order: ProcessOrder) {
  return Boolean(day.inspections[order.number]) || Object.keys(order.initial).length > 0
}

export function inspectionSummary(order: ProcessOrder, state: InspectionState) {
  const items = order.items.map((item, index) => {
    const selection = state.selections[item.id]
    const lines = selectionLines(item.category, selection)
    const subtotal = selectionTotal(item.category, selection)
    return {
      ...item,
      label: `Barang ${String(index + 1).padStart(2, '0')}`,
      selection: selection ?? { base: null, adds: [] },
      catalog: SERVICE_CATALOG[item.category],
      note: state.notes[item.id] ?? item.note,
      lines,
      subtotal,
      missing: !selection?.base,
      servicesText: lines.map((line) => line.name).join(' + ') || 'Belum ada layanan',
    }
  })
  const total = items.reduce((sum, item) => sum + item.subtotal, 0)
  const missing = items.filter((item) => item.missing).length
  return {
    items,
    total,
    totalText: formatRupiah(total),
    missing,
    filled: items.length - missing,
    saved: Boolean(state.savedAt),
  }
}

function update(order: ProcessOrder, change: (state: InspectionState) => InspectionState) {
  workday.set((day) => {
    const current = inspectionState(day, order)
    if (current.savedAt) return day
    return { ...day, inspections: { ...day.inspections, [order.number]: change(current) } }
  })
}

function withSelection(
  state: InspectionState,
  itemId: string,
  change: (selection: Selection) => Selection
) {
  const current = state.selections[itemId] ?? { base: null, adds: [] }
  return { ...state, selections: { ...state.selections, [itemId]: change(current) } }
}

export function chooseBase(order: ProcessOrder, itemId: string, name: string) {
  update(order, (state) =>
    withSelection(state, itemId, (selection) => ({ ...selection, base: name }))
  )
}

export function toggleAddOn(order: ProcessOrder, itemId: string, name: string) {
  update(order, (state) =>
    withSelection(state, itemId, (selection) => ({
      ...selection,
      adds: selection.adds.includes(name)
        ? selection.adds.filter((item) => item !== name)
        : [...selection.adds, name],
    }))
  )
}

export function setItemNote(order: ProcessOrder, itemId: string, note: string) {
  update(order, (state) => ({ ...state, notes: { ...state.notes, [itemId]: note } }))
}

export function saveInspection(order: ProcessOrder) {
  update(order, (state) => ({ ...state, savedAt: clockTime() }))
}

export function reopenInspection(order: ProcessOrder) {
  workday.set((day) => {
    const inspections = { ...day.inspections }
    delete inspections[order.number]
    const payments = { ...day.payments }
    delete payments[order.number]
    return { ...day, inspections, payments }
  })
}
