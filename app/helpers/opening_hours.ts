import { DateTime } from 'luxon'
import type { OpeningHoursSetting } from '#services/setting_service'

// ISO weekday 1 (Monday) to 7 (Sunday), as Luxon numbers them.
const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export type OpeningStatus = { isOpen: boolean; label: string; note: string | null }

function displayTime(time: string) {
  return time.replace(':', '.')
}

function dayHours(hours: OpeningHoursSetting, weekday: number) {
  return hours.days.find((day) => day.day === weekday)
}

// Whether the shop is open at `now`, said the way the landing shows it (OWN-8, GUEST-1).
export function openingStatus(hours: OpeningHoursSetting, now: DateTime): OpeningStatus {
  const local = now.setZone('Asia/Jakarta')
  const today = local.toISODate()!
  const { closure } = hours

  if (closure.isClosed && (!closure.until || today <= closure.until)) {
    const until = closure.until
      ? ` sampai ${DateTime.fromISO(closure.until).setLocale('id').toFormat('cccc, d LLLL')}`
      : ''
    return { isOpen: false, label: `Tutup sementara${until}`, note: closure.note }
  }

  const time = local.toFormat('HH:mm')
  const todayHours = dayHours(hours, local.weekday)
  if (todayHours?.isOpen && todayHours.opens <= time && time < todayHours.closes) {
    return {
      isOpen: true,
      label: `Buka · tutup pukul ${displayTime(todayHours.closes)}`,
      note: null,
    }
  }
  if (todayHours?.isOpen && time < todayHours.opens) {
    return {
      isOpen: false,
      label: `Tutup · buka pukul ${displayTime(todayHours.opens)}`,
      note: null,
    }
  }

  for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
    const day = local.plus({ days: daysAhead })
    const next = dayHours(hours, day.weekday)
    if (next?.isOpen) {
      const when = daysAhead === 1 ? 'besok' : DAY_NAMES[day.weekday - 1]
      return {
        isOpen: false,
        label: `Tutup · buka ${when} pukul ${displayTime(next.opens)}`,
        note: null,
      }
    }
  }
  return { isOpen: false, label: 'Tutup', note: null }
}

// One line per run of days with the same hours: "Senin–Sabtu 09.00–20.00", "Minggu tutup".
export function weeklyHours(hours: OpeningHoursSetting) {
  const lines: string[] = []
  const days = [...hours.days].sort((first, second) => first.day - second.day)
  let start = 0
  for (let index = 1; index <= days.length; index++) {
    const current = days[index]
    const first = days[start]
    const isSameHours =
      current &&
      current.isOpen === first.isOpen &&
      (!current.isOpen || (current.opens === first.opens && current.closes === first.closes))
    if (isSameHours) {
      continue
    }
    const last = days[index - 1]
    const range =
      first.day === last.day
        ? DAY_NAMES[first.day - 1]
        : `${DAY_NAMES[first.day - 1]}–${DAY_NAMES[last.day - 1]}`
    lines.push(
      first.isOpen
        ? `${range} ${displayTime(first.opens)}–${displayTime(first.closes)}`
        : `${range} tutup`
    )
    start = index
  }
  return lines
}
