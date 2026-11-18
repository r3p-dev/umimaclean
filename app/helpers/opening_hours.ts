import { DateTime } from 'luxon'
import type { OpeningHoursSetting } from '#services/setting_service'

// ISO weekday 1 (Monday) to 7 (Sunday), as Luxon numbers them.
export const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export type OpeningStatus = { isOpen: boolean; label: string; note: string | null }

const ZONE = 'Asia/Jakarta'
// Local Jakarta time as stored in the setting: "2026-11-19T20:00". Such stamps sort as strings.
const STAMP = "yyyy-MM-dd'T'HH:mm"

function displayTime(time: string) {
  return time.replace(':', '.')
}

function dayHours(hours: OpeningHoursSetting, weekday: number) {
  return hours.days.find((day) => day.day === weekday)
}

// The closure only counts between its start and its end (OWN-8, D103).
function isInClosure(closure: OpeningHoursSetting['closure'], stamp: string) {
  return (
    closure.isClosed &&
    closure.startsAt !== null &&
    closure.endsAt !== null &&
    closure.startsAt <= stamp &&
    stamp < closure.endsAt
  )
}

// "pukul 20.00" today, "besok …" or "Kamis …" within a week, with the date further ahead.
function when(moment: DateTime, today: DateTime, timeWord: 'pukul ' | '') {
  const daysAhead = moment.startOf('day').diff(today.startOf('day'), 'days').days
  const time = moment.toFormat('HH.mm')
  if (daysAhead === 0) return `pukul ${time}`
  if (daysAhead === 1) return `besok ${timeWord}${time}`
  const day = moment.setLocale('id').toFormat(daysAhead <= 6 ? 'cccc' : 'cccc, d LLLL')
  return `${day} ${timeWord}${time}`
}

// Where `now` stands against the temporary closure, for the owner's settings page (OWN-8).
export type ClosurePhase = 'upcoming' | 'active' | 'ended'

export function closurePhase(hours: OpeningHoursSetting, now: DateTime): ClosurePhase | null {
  const { closure } = hours
  if (!closure.isClosed || !closure.startsAt || !closure.endsAt) return null
  const nowStamp = now.setZone(ZONE).toFormat(STAMP)
  if (nowStamp < closure.startsAt) return 'upcoming'
  return nowStamp < closure.endsAt ? 'active' : 'ended'
}

// Whether the shop is open at `now`, said the way the landing shows it (OWN-8, GUEST-1).
export function openingStatus(hours: OpeningHoursSetting, now: DateTime): OpeningStatus {
  const local = now.setZone(ZONE)
  const nowStamp = local.toFormat(STAMP)
  const { closure } = hours

  if (isInClosure(closure, nowStamp)) {
    const endsAt = DateTime.fromISO(closure.endsAt!, { zone: ZONE })
    const label = `Tutup sementara sampai ${when(endsAt, local, '')}`
    return { isOpen: false, label, note: closure.note }
  }

  // Search past the end of a closure that has not started yet, so it is skipped as a whole.
  const closureDays =
    closure.isClosed && closure.endsAt
      ? Math.ceil(DateTime.fromISO(closure.endsAt, { zone: ZONE }).diff(local, 'days').days)
      : 0
  for (let daysAhead = 0; daysAhead <= Math.max(closureDays, 0) + 7; daysAhead++) {
    const date = local.plus({ days: daysAhead })
    const day = dayHours(hours, date.weekday)
    if (!day?.isOpen) continue
    const iso = date.toISODate()
    const closesAt = `${iso}T${day.closes}`
    let opensAt = `${iso}T${day.opens}`
    if (daysAhead === 0 && opensAt <= nowStamp) opensAt = nowStamp
    if (isInClosure(closure, opensAt)) opensAt = closure.endsAt!
    if (opensAt >= closesAt) continue

    if (opensAt === nowStamp) {
      const closingStamp =
        closure.isClosed && closure.startsAt && nowStamp < closure.startsAt
          ? [closesAt, closure.startsAt].sort()[0]
          : closesAt
      return {
        isOpen: true,
        label: `Buka · tutup pukul ${displayTime(closingStamp.slice(11))}`,
        note: null,
      }
    }
    const opening = DateTime.fromISO(opensAt, { zone: ZONE })
    return { isOpen: false, label: `Tutup · buka ${when(opening, local, 'pukul ')}`, note: null }
  }
  return { isOpen: false, label: 'Tutup', note: null }
}

// The dates from `from` to `to` (inclusive, Asia/Jakarta) on which a pickup can be booked: the shop
// opens that weekday, the weekday has an active slot (D106), and no temporary closure touches its
// hours (SLOT-1, D104).
// shortcut: a closure covering part of a day removes the whole day; per-slot checks come with M5a.
export function pickupDates(
  hours: OpeningHoursSetting,
  weekdaysWithSlots: ReadonlySet<number>,
  from: DateTime,
  to: DateTime
) {
  const { closure } = hours
  const last = to.setZone(ZONE).toISODate()!
  const dates: string[] = []
  for (
    let date = from.setZone(ZONE).startOf('day');
    date.toISODate()! <= last;
    date = date.plus({ days: 1 })
  ) {
    const iso = date.toISODate()!
    const day = dayHours(hours, date.weekday)
    if (!day?.isOpen || !weekdaysWithSlots.has(date.weekday)) continue
    const isTouchedByClosure =
      closure.isClosed &&
      closure.startsAt !== null &&
      closure.endsAt !== null &&
      closure.startsAt < `${iso}T${day.closes}` &&
      closure.endsAt > `${iso}T${day.opens}`
    if (!isTouchedByClosure) dates.push(iso)
  }
  return dates
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
