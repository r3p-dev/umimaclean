import { ACTIVITY_ROWS } from '~/lib/activity/data'

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

export const ACTIVITY_STAFF = ['Sari Rahayu', 'Dedi Supriadi', 'Agus Firmansyah', 'Wulan Sari']

export const ACTIVITY_FIRST_DAY = 2
export const ACTIVITY_LAST_DAY = 8

export type ActivityIcon =
  'fact_check' | 'flag' | 'inventory_2' | 'login' | 'payments' | 'photo_camera' | 'sync_alt'

export type Activity = {
  id: string
  label: string
  time: string
  staff: string
  icon: ActivityIcon
  action: string
  category: ActivityCategory
  ref: string
  detail: string
  sensitive: boolean
  day: number
}

export const ACTIVITIES: Activity[] = ACTIVITY_ROWS.map(
  ([time, staff, icon, action, category, ref, detail, sensitive, day], index) => ({
    id: `a${index}`,
    label: `${time} · ${staff} · ${action}`,
    time,
    staff,
    icon: icon as ActivityIcon,
    action,
    category: category as ActivityCategory,
    ref,
    detail,
    sensitive: sensitive === 1,
    day,
  })
)

export function activityDate(day: number) {
  return new Date(2026, 9, day)
}

export type ActivityFilters = {
  day: number
  staff: string[]
  categories: ActivityCategory[]
  sensitiveOnly: boolean
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
    (!filters.sensitiveOnly || activity.sensitive) &&
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
  if (filters.sensitiveOnly) parts.push('hanya sensitif')
  if (filters.query.trim()) parts.push(`kata kunci “${filters.query.trim()}”`)
  return parts
}

export const RECENT_ACTIVITY = [
  { who: 'Dedi', what: 'mencatat pembayaran tunai', time: '15.10', ref: 'UMC-8F3K2Q · Rp195.000' },
  { who: 'Sari', what: 'menentukan layanan (3 barang)', time: '13.40', ref: 'UMC-8F3K2Q' },
  { who: 'Agus', what: 'mengunggah bukti antar', time: '12.58', ref: 'UMC-B1V6TS · 2 foto' },
]
