import { DAY_LONG, DAY_SHORT, MONTH_SHORT, fromIso, toIso } from '~/lib/shared/date'

export const PICKUP_SLOTS = ['09.00–12.00', '12.00–15.00', '15.00–18.00']

export type SlotAvailability = {
  slot: number
  label: string
  isOpen: boolean
  isFull: boolean
}

export type Availability = Record<string, SlotAvailability[]>

export type PickupDay = {
  iso: string
  dayShort: string
  dayLong: string
  dayNumber: number
  month: string
  year: number
  isAvailable: boolean
  isTomorrow: boolean
  fullSlots: number[]
  slots: SlotAvailability[]
}

export function pickupDays(availability: Availability, today = new Date(), count = 5): PickupDay[] {
  const days: PickupDay[] = []
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let offset = 0

  while (days.length < count) {
    if (cursor.getDay() !== 0) {
      const iso = toIso(cursor)
      const slots = availability[iso] ?? []
      const fullSlots = PICKUP_SLOTS.map((_, index) => index).filter((index) => {
        const slot = slots[index]
        return !slot || !slot.isOpen || slot.isFull
      })
      days.push({
        iso,
        dayShort: DAY_SHORT[cursor.getDay()],
        dayLong: DAY_LONG[cursor.getDay()],
        dayNumber: cursor.getDate(),
        month: MONTH_SHORT[cursor.getMonth()],
        year: cursor.getFullYear(),
        isAvailable: offset > 0 && fullSlots.length < PICKUP_SLOTS.length,
        isTomorrow: offset === 1,
        fullSlots,
        slots,
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
  if (style === 'short') {
    return `${DAY_SHORT[date.getDay()]}, ${day} ${month} · ${time}`
  }
  if (style === 'mid') {
    return `${DAY_LONG[date.getDay()]}, ${day} ${month}, ${time}`
  }
  if (style === 'day') {
    return `${DAY_LONG[date.getDay()]}, ${day} ${month} · ${time}`
  }
  return `${DAY_LONG[date.getDay()]}, ${day} ${month} ${date.getFullYear()} · ${time}`
}
