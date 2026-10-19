import { DAY_SHORT, addDays, formatDayMonth } from '~/lib/shared/date'

export type HistoryKind = 'jemput' | 'antar' | 'proses' | 'toko'

export type HistoryIcon = HistoryKind | 'skip'

export type HistoryPeriod = 'today' | 'yday' | 'week'

export type HistoryEntry = {
  day: 'today' | 'yday'
  time: string
  icon: HistoryIcon
  title: string
  who: string
  ref: string
  store: boolean
  note: string
}

const ENTRIES: HistoryEntry[] = [
  {
    day: 'today',
    time: '15.10',
    icon: 'toko',
    title: 'Transaksi toko · lunas Tunai Rp75.000',
    who: 'Andi P.',
    ref: 'UMC-T6M1QA',
    store: true,
    note: '',
  },
  {
    day: 'today',
    time: '14.22',
    icon: 'antar',
    title: 'Antar selesai · diterima Bu Sri',
    who: 'Fajar N.',
    ref: 'UMC-B1V6TS',
    store: false,
    note: 'Foto bukti antar terkirim',
  },
  {
    day: 'today',
    time: '12.05',
    icon: 'skip',
    title: 'Jemput dilewati',
    who: 'Hendra W.',
    ref: 'UMC-G5C1RT',
    store: false,
    note: 'Pelanggan tidak bisa dihubungi · admin menjadwalkan ulang',
  },
  {
    day: 'today',
    time: '10.24',
    icon: 'jemput',
    title: 'Jemput selesai · 3 barang',
    who: 'Laras P.',
    ref: 'UMC-K2R7LP',
    store: false,
    note: 'Foto bukti jemput terkirim',
  },
  {
    day: 'today',
    time: '08.40',
    icon: 'proses',
    title: 'Foto hasil cuci · otomatis ke Antar',
    who: 'Maya S.',
    ref: 'UMC-N5D9JC',
    store: false,
    note: '',
  },
  {
    day: 'yday',
    time: '16.55',
    icon: 'antar',
    title: 'Antar selesai · diterima pelanggan',
    who: 'Dewi A.',
    ref: 'UMC-J7X2AB',
    store: true,
    note: '',
  },
  {
    day: 'yday',
    time: '13.12',
    icon: 'proses',
    title: 'Periksa barang · 2 barang, Rp110.000',
    who: 'Bima S.',
    ref: 'UMC-W8E3HN',
    store: true,
    note: '',
  },
  {
    day: 'yday',
    time: '09.30',
    icon: 'jemput',
    title: 'Jemput selesai · 2 barang',
    who: 'Citra L.',
    ref: 'UMC-P4Q9ZD',
    store: false,
    note: '',
  },
]

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
  return period === 'week' || entry.day === period
}

export function dayLabel(day: 'today' | 'yday', today = new Date()) {
  const date = day === 'today' ? today : addDays(today, -1)
  const prefix = day === 'today' ? 'Hari ini' : 'Kemarin'
  return `${prefix} · ${DAY_SHORT[date.getDay()]} ${formatDayMonth(date)}`
}

export function staffHistory(period: HistoryPeriod, kinds: HistoryKind[]) {
  const matches = (entry: HistoryEntry) => !kinds.length || kinds.includes(kindOf(entry))
  const list = ENTRIES.filter((entry) => inPeriod(entry, period) && matches(entry))
  const days = (['today', 'yday'] as const)
    .map((day) => ({
      day,
      label: dayLabel(day),
      entries: list.filter((entry) => entry.day === day),
    }))
    .filter((group) => group.entries.length > 0)

  return {
    days,
    empty: days.length === 0,
    tiles: HISTORY_TILES.map((tile) => ({
      ...tile,
      count: ENTRIES.filter((entry) => inPeriod(entry, period) && entry.icon === tile.key).length,
    })),
    periodCounts: Object.fromEntries(
      HISTORY_PERIODS.map((item) => [
        item.key,
        ENTRIES.filter((entry) => inPeriod(entry, item.key) && matches(entry)).length,
      ])
    ) as Record<HistoryPeriod, number>,
    kindCounts: Object.fromEntries(
      HISTORY_KINDS.map((item) => [
        item.key,
        ENTRIES.filter((entry) => inPeriod(entry, period) && kindOf(entry) === item.key).length,
      ])
    ) as Record<HistoryKind, number>,
  }
}
