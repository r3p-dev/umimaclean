import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { closurePhase, openingStatus, pickupDates, weeklyHours } from '#helpers/opening_hours'
import { DEFAULT_OPENING_HOURS, type OpeningHoursSetting } from '#services/setting_service'

// 2026-11-18 is a Wednesday, 2026-11-21 a Saturday.
function at(isoLocalTime: string) {
  return DateTime.fromISO(isoLocalTime, { zone: 'Asia/Jakarta' })
}

// Every weekday has an active slot unless a test says otherwise.
const EVERY_DAY = new Set([1, 2, 3, 4, 5, 6, 7])

function closed(startsAt: string, endsAt: string, note: string | null = null): OpeningHoursSetting {
  return { ...DEFAULT_OPENING_HOURS, closure: { isClosed: true, startsAt, endsAt, note } }
}

test.group('Opening hours (OWN-8, GUEST-1)', () => {
  test('open during the hours of the day, with the closing time', ({ assert }) => {
    assert.deepEqual(openingStatus(DEFAULT_OPENING_HOURS, at('2026-11-18T10:00')), {
      isOpen: true,
      label: 'Buka · tutup pukul 20.00',
      note: null,
    })
  })

  test('closed before opening, at closing time, and on the eve of a closed Sunday', ({
    assert,
  }) => {
    assert.equal(
      openingStatus(DEFAULT_OPENING_HOURS, at('2026-11-18T08:00')).label,
      'Tutup · buka pukul 09.00'
    )
    assert.equal(
      openingStatus(DEFAULT_OPENING_HOURS, at('2026-11-18T20:00')).label,
      'Tutup · buka besok pukul 09.00'
    )
    assert.equal(
      openingStatus(DEFAULT_OPENING_HOURS, at('2026-11-21T21:00')).label,
      'Tutup · buka Senin pukul 09.00'
    )
  })

  test('the time is read in Asia/Jakarta whatever the server zone', ({ assert }) => {
    const utcMorning = DateTime.fromISO('2026-11-18T03:30', { zone: 'utc' })
    assert.isTrue(openingStatus(DEFAULT_OPENING_HOURS, utcMorning).isOpen)
  })

  test('a temporary closure shows only between its start and its end, with its note (D103)', ({
    assert,
  }) => {
    const renovation = closed('2026-11-18T08:00', '2026-11-20T20:00', 'Renovasi')
    assert.deepEqual(openingStatus(renovation, at('2026-11-18T10:00')), {
      isOpen: false,
      label: 'Tutup sementara sampai Jumat 20.00',
      note: 'Renovasi',
    })
    assert.equal(
      openingStatus(renovation, at('2026-11-19T10:00')).label,
      'Tutup sementara sampai besok 20.00'
    )
    assert.equal(
      openingStatus(renovation, at('2026-11-20T10:00')).label,
      'Tutup sementara sampai pukul 20.00'
    )
    assert.equal(
      openingStatus(closed('2026-11-18T08:00', '2026-12-03T20:00'), at('2026-11-18T10:00')).label,
      'Tutup sementara sampai Kamis, 3 Desember 20.00'
    )
  })

  test('the normal schedule resumes by itself once the closure ends (D103)', ({ assert }) => {
    const morning = closed('2026-11-19T00:00', '2026-11-19T12:00')
    assert.isFalse(openingStatus(morning, at('2026-11-19T11:59')).isOpen)
    assert.deepEqual(openingStatus(morning, at('2026-11-19T12:00')), {
      isOpen: true,
      label: 'Buka · tutup pukul 20.00',
      note: null,
    })
    assert.isTrue(
      openingStatus(closed('2026-11-18T08:00', '2026-11-20T20:00'), at('2026-11-21T10:00')).isOpen
    )
  })

  test('before a closure starts, the hours say when the shop really closes and opens (D103)', ({
    assert,
  }) => {
    const afternoon = closed('2026-11-18T15:00', '2026-11-20T20:00')
    assert.equal(openingStatus(afternoon, at('2026-11-18T10:00')).label, 'Buka · tutup pukul 15.00')
    assert.equal(openingStatus(afternoon, at('2026-11-18T07:00')).label, 'Tutup · buka pukul 09.00')
    assert.equal(
      openingStatus(closed('2026-11-19T00:00', '2026-11-20T20:00'), at('2026-11-18T21:00')).label,
      'Tutup · buka Sabtu pukul 09.00'
    )
  })

  test('a closure switched off is ignored, whatever its dates', ({ assert }) => {
    const hours = closed('2026-11-18T08:00', '2026-11-20T20:00')
    hours.closure.isClosed = false
    assert.isTrue(openingStatus(hours, at('2026-11-18T10:00')).isOpen)
  })

  test('closed every day says only that it is closed', ({ assert }) => {
    const neverOpen: OpeningHoursSetting = {
      ...DEFAULT_OPENING_HOURS,
      days: DEFAULT_OPENING_HOURS.days.map((day) => ({ ...day, isOpen: false })),
    }
    assert.equal(openingStatus(neverOpen, at('2026-11-18T10:00')).label, 'Tutup')
  })

  test('the week is summarised in runs of equal hours', ({ assert }) => {
    assert.deepEqual(weeklyHours(DEFAULT_OPENING_HOURS), [
      'Senin–Sabtu 09.00–20.00',
      'Minggu tutup',
    ])

    const shortSaturday: OpeningHoursSetting = {
      ...DEFAULT_OPENING_HOURS,
      days: DEFAULT_OPENING_HOURS.days.map((day) =>
        day.day === 6 ? { ...day, closes: '15:00' } : day
      ),
    }
    assert.deepEqual(weeklyHours(shortSaturday), [
      'Senin–Jumat 09.00–20.00',
      'Sabtu 09.00–15.00',
      'Minggu tutup',
    ])
  })

  test('pickup dates are the open weekdays between two dates, inclusive (SLOT-1, D104)', ({
    assert,
  }) => {
    assert.deepEqual(
      pickupDates(DEFAULT_OPENING_HOURS, EVERY_DAY, at('2026-11-19T00:00'), at('2026-11-25T23:59')),
      ['2026-11-19', '2026-11-20', '2026-11-21', '2026-11-23', '2026-11-24', '2026-11-25']
    )

    const closedMonday: OpeningHoursSetting = {
      ...DEFAULT_OPENING_HOURS,
      days: DEFAULT_OPENING_HOURS.days.map((day) =>
        day.day === 1 ? { ...day, isOpen: false } : day
      ),
    }
    assert.notInclude(
      pickupDates(closedMonday, EVERY_DAY, at('2026-11-23T08:00'), at('2026-11-24T08:00')),
      '2026-11-23'
    )
  })

  test('a temporary closure removes every date whose hours it touches (SLOT-1, D104)', ({
    assert,
  }) => {
    const from = at('2026-11-18T00:00')
    const to = at('2026-11-21T00:00')
    assert.deepEqual(
      pickupDates(closed('2026-11-19T00:00', '2026-11-20T12:00'), EVERY_DAY, from, to),
      ['2026-11-18', '2026-11-21']
    )
    // Ending as the shop opens, or starting as it closes, leaves the day bookable.
    assert.deepEqual(
      pickupDates(closed('2026-11-18T20:00', '2026-11-19T09:00'), EVERY_DAY, from, to),
      ['2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21']
    )
    const switchedOff = closed('2026-11-19T00:00', '2026-11-20T12:00')
    switchedOff.closure.isClosed = false
    assert.lengthOf(pickupDates(switchedOff, EVERY_DAY, from, to), 4)
  })

  test('pickup dates are counted in Asia/Jakarta whatever the zone of the bounds', ({ assert }) => {
    // 2026-11-21T18:00 UTC is already Sunday 01:00 in Jakarta, a closed day.
    const utc = DateTime.fromISO('2026-11-21T18:00', { zone: 'utc' })
    assert.deepEqual(pickupDates(DEFAULT_OPENING_HOURS, EVERY_DAY, utc, utc), [])
  })

  test('the closure is upcoming, active or ended around its window (OWN-8)', ({ assert }) => {
    const renovation = closed('2026-11-19T08:00', '2026-11-20T20:00')
    assert.equal(closurePhase(renovation, at('2026-11-19T07:59')), 'upcoming')
    assert.equal(closurePhase(renovation, at('2026-11-19T08:00')), 'active')
    assert.equal(closurePhase(renovation, at('2026-11-20T20:00')), 'ended')
    assert.isNull(closurePhase(DEFAULT_OPENING_HOURS, at('2026-11-19T10:00')))
  })

  test('a weekday without an active slot is not a pickup date (SLOT-1, D106)', ({ assert }) => {
    const noThursday = new Set([1, 2, 3, 5, 6])
    assert.deepEqual(
      pickupDates(
        DEFAULT_OPENING_HOURS,
        noThursday,
        at('2026-11-18T00:00'),
        at('2026-11-20T00:00')
      ),
      ['2026-11-18', '2026-11-20']
    )
  })
})
