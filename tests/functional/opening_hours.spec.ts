import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import User from '#models/user'
import ActivityLog from '#models/activity_log'
import { Role } from '#enums/role_enum'
import { DEFAULT_OPENING_HOURS } from '#services/setting_service'
import { visitRedirect } from '../helpers/inertia.js'

function stamp(moment: DateTime) {
  return moment.toFormat("yyyy-MM-dd'T'HH:mm")
}

function shortSaturday() {
  return {
    days: DEFAULT_OPENING_HOURS.days.map((day) =>
      day.day === 6 ? { ...day, closes: '15:00' } : day
    ),
    closure: { isClosed: false, startsAt: null, endsAt: null, note: null },
  }
}

test.group('Opening hours PUT /admin/pengaturan/jam (OWN-8, GUEST-1)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('the owner saves hours per day, logged, and the landing shows them (OWN-8)', async ({
    client,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const response = await client
      .put('/admin/pengaturan/jam')
      .loginAs(owner)
      .withCsrfToken()
      .json(shortSaturday())
      .redirects(0)
    response.assertStatus(302)

    const log = await ActivityLog.findByOrFail('action', 'settings.hours.update')
    assert.equal(log.userId, owner.id)

    const landing = await client.get('/').withInertia()
    assert.deepEqual(landing.inertiaProps.openingHours.weekly, [
      'Senin–Jumat 09.00–20.00',
      'Sabtu 09.00–15.00',
      'Minggu tutup',
    ])
  })

  test('a temporary closure shows on the landing only while it lasts, with its end and note (GUEST-1, D103)', async ({
    client,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const now = DateTime.now().setZone('Asia/Jakarta')
    const endsAt = now.plus({ days: 3 }).set({ hour: 20, minute: 0 })

    await client
      .put('/admin/pengaturan/jam')
      .loginAs(owner)
      .withCsrfToken()
      .json({
        ...shortSaturday(),
        closure: {
          isClosed: true,
          startsAt: stamp(now.minus({ hours: 1 })),
          endsAt: stamp(endsAt),
          note: 'Renovasi',
        },
      })
    const during = await client.get('/').withInertia()
    assert.deepEqual(during.inertiaProps.openingHours.status, {
      isOpen: false,
      label: `Tutup sementara sampai ${endsAt.setLocale('id').toFormat('cccc')} 20.00`,
      note: 'Renovasi',
    })

    await client
      .put('/admin/pengaturan/jam')
      .loginAs(owner)
      .withCsrfToken()
      .json({
        ...shortSaturday(),
        closure: {
          isClosed: true,
          startsAt: stamp(now.minus({ days: 3 })),
          endsAt: stamp(now.minus({ minutes: 1 })),
          note: 'Renovasi',
        },
      })
    const after = await client.get('/').withInertia()
    assert.notInclude(after.inertiaProps.openingHours.status.label, 'Tutup sementara')
    assert.isNull(after.inertiaProps.openingHours.status.note)
  })

  test('a closure needs a start and an end, the end after the start (OWN-8, D103)', async ({
    client,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const cases = [
      {
        closure: { isClosed: true, startsAt: '2026-11-19T08:00', endsAt: null, note: null },
        message: 'Isi waktu mulai dan selesai tutup sementara.',
      },
      {
        closure: {
          isClosed: true,
          startsAt: '2026-11-19T08:00',
          endsAt: '2026-11-19T08:00',
          note: null,
        },
        message: 'Waktu selesai harus setelah waktu mulai.',
      },
    ]
    for (const { closure, message } of cases) {
      const response = await client
        .put('/admin/pengaturan/jam')
        .header('Referer', '/admin/pengaturan/toko')
        .loginAs(owner)
        .withCsrfToken()
        .json({ ...shortSaturday(), closure })
        .redirects(0)
      const next = await visitRedirect(client, response)
      next.assertInertiaPropsContains({ errors: { closure: message } })
    }
  })

  test('a day that closes before it opens is refused under that day (OWN-8)', async ({
    client,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const hours = shortSaturday()
    hours.days[0] = { ...hours.days[0], opens: '18:00', closes: '09:00' }

    const response = await client
      .put('/admin/pengaturan/jam')
      .header('Referer', '/admin/pengaturan/toko')
      .loginAs(owner)
      .withCsrfToken()
      .json(hours)
      .redirects(0)
    response.assertStatus(302)

    const next = await visitRedirect(client, response)
    next.assertInertiaPropsContains({
      errors: { 'days.0': 'Jam tutup harus setelah jam buka.' },
    })
  })

  test('hours for fewer than seven days are refused', async ({ client, assert }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const hours = shortSaturday()
    const response = await client
      .put('/admin/pengaturan/jam')
      .header('Referer', '/admin/pengaturan/toko')
      .loginAs(owner)
      .withCsrfToken()
      .json({ ...hours, days: hours.days.slice(0, 6) })
      .redirects(0)

    const next = await visitRedirect(client, response)
    assert.property(next.inertiaProps.errors, 'days')
  })

  test('guests are sent to sign in; customers and staff are refused (OWN-8)', async ({
    client,
  }) => {
    const guest = await client
      .put('/admin/pengaturan/jam')
      .withCsrfToken()
      .json(shortSaturday())
      .redirects(0)
    guest.assertStatus(302)
    guest.assertHeader('location', '/staf/masuk')

    for (const role of [Role.CUSTOMER, Role.STAFF]) {
      const user = await User.query().where('role', role).firstOrFail()
      const response = await client
        .put('/admin/pengaturan/jam')
        .loginAs(user)
        .withCsrfToken()
        .json(shortSaturday())
      response.assertStatus(403)
    }
  })
})
