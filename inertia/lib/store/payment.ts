import { formatRupiah } from '~/lib/shared/format'
import { DAY_SHORT, formatDayMonth } from '~/lib/shared/date'
import { inspectionState, inspectionSummary } from '~/lib/processing/inspection'
import { findInspectionOrder } from '~/lib/processing/orders'
import {
  clockTime,
  workday,
  type PaymentMethod,
  type StorePayment,
  type Workday,
} from '~/lib/staff/workday'

export const PAYMENT_METHODS: { key: PaymentMethod; label: string }[] = [
  { key: 'qris', label: 'QRIS' },
  { key: 'cash', label: 'Tunai' },
  { key: 'edc', label: 'EDC' },
]

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  qris: 'QRIS',
  cash: 'Tunai',
  edc: 'EDC',
}

export function storeBill(day: Workday, number: string) {
  const order = findInspectionOrder(day, number)
  if (!order || order.source !== 'toko') return null
  const state = inspectionState(day, order)
  const summary = inspectionSummary(order, state)
  return {
    order,
    saved: summary.saved,
    items: summary.items.filter((item) => item.lines.length > 0),
    total: summary.total,
    payment: day.payments[number] ?? null,
  }
}

export function parseRupiah(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  return digits ? Number(digits) : null
}

export function formatRupiahInput(value: number | null) {
  return value === null ? '' : formatRupiah(value)
}

export function paymentStamp(date = new Date()) {
  return `${DAY_SHORT[date.getDay()]}, ${formatDayMonth(date, true)} · ${clockTime(date)}`
}

export function recordPayment(number: string, payment: Omit<StorePayment, 'paidAt' | 'stamp'>) {
  workday.set((day) => ({
    ...day,
    payments: {
      ...day.payments,
      [number]: { ...payment, paidAt: clockTime(), stamp: paymentStamp() },
    },
  }))
}

export function cancelPayment(number: string) {
  workday.set((day) => {
    const payments = { ...day.payments }
    delete payments[number]
    return { ...day, payments }
  })
}

export function qrisReference() {
  const alphabet = '0123456789ABCDEF'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return 'QR-' + Array.from(bytes, (byte) => alphabet[byte % 16]).join('')
}
