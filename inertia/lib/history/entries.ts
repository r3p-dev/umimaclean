import { DAY_SHORT, daysFromToday, formatDayMonth, fromIso } from '~/lib/shared/date'

export type HistoryKind = 'jemput' | 'antar' | 'proses' | 'toko'

export type HistoryIcon = HistoryKind | 'skip'

export type HistoryPeriod = 'today' | 'yday' | 'week'

export type HistoryEntry = {
  id: number
  date: string
  time: string
  icon: HistoryIcon
  title: string
  who: string
  ref: string
  isInStore: boolean
  note: string
}

export const HISTORY_KINDS: { key: HistoryKind; label: string }[] = [
  { key: 'jemput', label: 'Jemput' },
  { key: 'antar', label: 'Antar' },
  { key: 'proses', label: 'Proses' },
  { key: 'toko', label: 'Toko' },
]

export const HISTORY_TILES: { key: HistoryKind; label: string }[] = [
  { key: 'jemput', label: 'Jemput selesai' },
  { key: 'antar', label: 'Antar selesai' },
  { key: 'proses', label: 'Diperiksa & dicuci' },
  { key: 'toko', label: 'Transaksi toko' },
]

export const HISTORY_PERIODS: { key: HistoryPeriod; label: string }[] = [
  { key: 'today', label: 'Hari ini' },
  { key: 'yday', label: 'Kemarin' },
  { key: 'week', label: '7 hari' },
]

export function kindOf(entry: HistoryEntry): HistoryKind {
  return entry.icon === 'skip' ? 'jemput' : entry.icon
}

function inPeriod(entry: HistoryEntry, period: HistoryPeriod) {
  const age = -daysFromToday(entry.date)
  return period === 'week' ? age <= 6 : age === (period === 'today' ? 0 : 1)
}

export function dayLabel(iso: string) {
  const age = -daysFromToday(iso)
  const date = fromIso(iso)
  const prefix = age === 0 ? 'Hari ini · ' : age === 1 ? 'Kemarin · ' : ''
  return `${prefix}${DAY_SHORT[date.getDay()]} ${formatDayMonth(date)}`
}

export function staffHistory(entries: HistoryEntry[], period: HistoryPeriod, kinds: HistoryKind[]) {
  const matches = (entry: HistoryEntry) => !kinds.length || kinds.includes(kindOf(entry))
  const list = entries.filter((entry) => inPeriod(entry, period) && matches(entry))
  const dates = [...new Set(list.map((entry) => entry.date))]
  const days = dates.map((date) => ({
    day: date,
    label: dayLabel(date),
    entries: list.filter((entry) => entry.date === date),
  }))

  return {
    days,
    empty: days.length === 0,
    tiles: HISTORY_TILES.map((tile) => ({
      ...tile,
      count: entries.filter((entry) => inPeriod(entry, period) && entry.icon === tile.key).length,
    })),
    periodCounts: Object.fromEntries(
      HISTORY_PERIODS.map((item) => [
        item.key,
        entries.filter((entry) => inPeriod(entry, item.key) && matches(entry)).length,
      ])
    ) as Record<HistoryPeriod, number>,
    kindCounts: Object.fromEntries(
      HISTORY_KINDS.map((item) => [
        item.key,
        entries.filter((entry) => inPeriod(entry, period) && kindOf(entry) === item.key).length,
      ])
    ) as Record<HistoryKind, number>,
  }
}
