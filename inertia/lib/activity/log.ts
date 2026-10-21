import { addDays, daysFromToday } from '~/lib/shared/date'

export type ActivityCategory =
  'status' | 'foto' | 'layanan' | 'bayar' | 'barang' | 'batal' | 'harga' | 'masuk'

export const ACTIVITY_CATEGORIES: { value: ActivityCategory; label: string }[] = [
  { value: 'status', label: 'Ubah status' },
  { value: 'foto', label: 'Foto bukti' },
  { value: 'layanan', label: 'Layanan & tagihan' },
  { value: 'bayar', label: 'Pembayaran' },
  { value: 'barang', label: 'Terima barang' },
  { value: 'batal', label: 'Pembatalan' },
  { value: 'harga', label: 'Ubah harga' },
  { value: 'masuk', label: 'Masuk' },
]

export const ACTIVITY_FIRST_DAY = -89
export const ACTIVITY_LAST_DAY = 0

export type ActivityIcon =
  'fact_check' | 'flag' | 'inventory_2' | 'login' | 'payments' | 'photo_camera' | 'sync_alt'

const ICON_OF: Record<ActivityCategory, ActivityIcon> = {
  status: 'sync_alt',
  foto: 'photo_camera',
  layanan: 'fact_check',
  bayar: 'payments',
  barang: 'inventory_2',
  batal: 'flag',
  harga: 'sync_alt',
  masuk: 'login',
}

export type ActivityRow = {
  id: string
  date: string
  time: string
  staff: string
  action: string
  category: ActivityCategory
  ref: string
  detail: string
  isSensitive: boolean
}

export type Activity = ActivityRow & { label: string; icon: ActivityIcon; day: number }

export function activitiesOf(rows: ActivityRow[]): Activity[] {
  return rows.map((row) => ({
    ...row,
    label: `${row.time} · ${row.staff} · ${row.action}`,
    icon: ICON_OF[row.category],
    day: daysFromToday(row.date),
  }))
}

export function activityStaff(list: Activity[]) {
  return [...new Set(list.map((activity) => activity.staff))].sort()
}

export function activityDate(day: number) {
  return addDays(new Date(), day)
}

export type ActivityFilters = {
  day: number
  staff: string[]
  categories: ActivityCategory[]
  isSensitiveOnly: boolean
  query: string
}

export function activityMatches(
  activity: Activity,
  filters: ActivityFilters,
  skip?: 'staff' | 'categories'
) {
  const query = filters.query.trim().toLowerCase()
  return (
    activity.day === filters.day &&
    (skip === 'staff' || !filters.staff.length || filters.staff.includes(activity.staff)) &&
    (skip === 'categories' ||
      !filters.categories.length ||
      filters.categories.includes(activity.category)) &&
    (!filters.isSensitiveOnly || activity.isSensitive) &&
    (!query ||
      `${activity.ref} ${activity.staff} ${activity.action} ${activity.detail}`
        .toLowerCase()
        .includes(query))
  )
}

export function activitySummary(filters: ActivityFilters) {
  const parts: string[] = []
  if (filters.staff.length) {
    parts.push(`staf: ${filters.staff.map((name) => name.split(' ')[0]).join(', ')}`)
  }
  if (filters.categories.length) {
    parts.push(
      `aksi: ${filters.categories
        .map((key) => ACTIVITY_CATEGORIES.find((item) => item.value === key)?.label)
        .join(', ')}`
    )
  }
  if (filters.isSensitiveOnly) {
    parts.push('hanya sensitif')
  }
  if (filters.query.trim()) {
    parts.push(`kata kunci “${filters.query.trim()}”`)
  }
  return parts
}
