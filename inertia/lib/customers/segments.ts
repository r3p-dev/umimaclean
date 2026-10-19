import { CUSTOMER_ROWS } from '~/lib/customers/data'
import { DATA_END } from '~/lib/reports/period'
import { dayDiff, fromIso } from '~/lib/shared/date'
import { createSharedStore } from '~/lib/shared/shared_store'

export type Segment = 'inactive' | 'active' | 'new'

export const SEGMENT_TABS: { key: Segment; label: string }[] = [
  { key: 'inactive', label: 'Tidak aktif' },
  { key: 'active', label: 'Aktif' },
  { key: 'new', label: 'Baru (30 hari)' },
]

export const THRESHOLDS = [30, 60, 90, 180]

export const DEFAULT_REMINDER =
  'Halo {nama}, sudah lama sepatu, tas, atau helmnya tidak dirawat di Umima. Mau dijemput minggu ini? Balas “JEMPUT” untuk pesan. 🙏'

export type Customer = {
  id: string
  label: string
  name: string
  phone: string
  area: string
  last: Date
  first: Date
  orders: number
  spend: number
  days: number
  isNew: boolean
}

export const CUSTOMERS: Customer[] = CUSTOMER_ROWS.map(
  ([name, phone, area, lastPaid, firstPaid, orders, spend], index) => {
    const last = fromIso(lastPaid)
    const first = fromIso(firstPaid)
    return {
      id: `c${index}`,
      label: name,
      name,
      phone,
      area,
      last,
      first,
      orders,
      spend,
      days: dayDiff(last, DATA_END),
      isNew: dayDiff(first, DATA_END) <= 30,
    }
  }
)

export function inSegment(customer: Customer, segment: Segment, threshold: number) {
  if (segment === 'inactive') return customer.days >= threshold
  if (segment === 'active') return customer.days < threshold
  return customer.isNew
}

export function segmentLabel(customer: Customer, threshold: number) {
  if (customer.days >= threshold) return `Tidak aktif (≥ ${threshold} hari)`
  return customer.isNew ? 'Baru' : 'Aktif'
}

export function inactiveCount(threshold: number) {
  return CUSTOMERS.filter((customer) => customer.days >= threshold).length
}

export const reminders = createSharedStore<string[]>('local', 'umima:customer-reminders', () => [])

export function markReminded(ids: string[]) {
  reminders.set((list) => Array.from(new Set([...list, ...ids])))
}
