import { DAY_LONG, DAY_SHORT, MONTH_SHORT, fromIso, toIso } from '~/lib/shared/date'

export const PICKUP_SLOTS = ['09.00–12.00', '12.00–15.00', '15.00–18.00']

const FULL_SLOTS_BY_INDEX: Record<number, number[]> = { 1: [2], 3: [0] }

export type PickupDay = {
  iso: string
  dayShort: string
  dayLong: string
  dayNumber: number
  month: string
  year: number
  available: boolean
  isTomorrow: boolean
  fullSlots: number[]
}

export function pickupDays(today = new Date(), count = 5): PickupDay[] {
  const days: PickupDay[] = []
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let offset = 0

  while (days.length < count) {
    if (cursor.getDay() !== 0) {
      days.push({
        iso: toIso(cursor),
        dayShort: DAY_SHORT[cursor.getDay()],
        dayLong: DAY_LONG[cursor.getDay()],
        dayNumber: cursor.getDate(),
        month: MONTH_SHORT[cursor.getMonth()],
        year: cursor.getFullYear(),
        available: offset > 0,
        isTomorrow: offset === 1,
        fullSlots: FULL_SLOTS_BY_INDEX[days.length] ?? [],
      })
    }
    cursor.setDate(cursor.getDate() + 1)
    offset += 1
  }

  return days
}

export function firstOpenSlot(day: PickupDay) {
  return PICKUP_SLOTS.findIndex((_, index) => !day.fullSlots.includes(index))
}

export function formatSchedule(iso: string, slot: number, style: 'short' | 'mid' | 'day' | 'long') {
  const date = fromIso(iso)
  const day = date.getDate()
  const month = MONTH_SHORT[date.getMonth()]
  const time = PICKUP_SLOTS[slot]
  if (style === 'short') return `${DAY_SHORT[date.getDay()]}, ${day} ${month} · ${time}`
  if (style === 'mid') return `${DAY_LONG[date.getDay()]}, ${day} ${month}, ${time}`
  if (style === 'day') return `${DAY_LONG[date.getDay()]}, ${day} ${month} · ${time}`
  return `${DAY_LONG[date.getDay()]}, ${day} ${month} ${date.getFullYear()} · ${time}`
}
