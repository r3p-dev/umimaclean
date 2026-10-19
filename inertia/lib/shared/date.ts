export const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
export const DAY_LONG = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
export const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
]

export function toIso(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export function fromIso(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDate(iso: string, style: 'short' | 'long' | 'full') {
  const date = fromIso(iso)
  const dayMonth = `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`
  if (style === 'short') return `${DAY_SHORT[date.getDay()]}, ${dayMonth}`
  if (style === 'long') return `${DAY_LONG[date.getDay()]}, ${dayMonth}`
  return `${dayMonth} ${date.getFullYear()}`
}

export function formatClock(date: Date) {
  const time = `${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')}`
  return `${formatDate(toIso(date), 'short')} · ${time}`
}

export function daysFromToday(iso: string, today = new Date()) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((fromIso(iso).getTime() - start.getTime()) / 86400000)
}

export function formatDayMonth(date: Date, withYear = false) {
  const text = `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`
  return withYear ? `${text} ${date.getFullYear()}` : text
}

export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function dayDiff(from: Date, to: Date) {
  return Math.round(
    (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
      86400000
  )
}

export function isWeekend(date: Date) {
  return date.getDay() === 0 || date.getDay() === 6
}
