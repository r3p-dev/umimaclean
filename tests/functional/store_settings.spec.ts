import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Setting from '#models/setting'
import ActivityLog from '#models/activity_log'
import { Role } from '#enums/role_enum'
import { visitRedirect } from '../helpers/inertia.js'

function createUser(phone: string, role: Role) {
  return User.create({
    fullName: 'Test User',
    phone,
    password: 'password123',
    role,
    isActive: true,
  })
}

test.group('Store Settings & Pickup Slots (OWN-8, SLOT-2)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('/admin/pengaturan redirects to /admin/pengaturan/toko', async ({ client }) => {
    const owner = await createUser('6281299990020', Role.ADMIN)
    const response = await client.get('/admin/pengaturan').loginAs(owner).redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/admin/pengaturan/toko')
  })

  test('guest is redirected to staff login when opening /admin/pengaturan/toko', async ({
    client,
  }) => {
    const response = await client.get('/admin/pengaturan/toko').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/staf/masuk')
  })

  test('customer is denied access to /admin/pengaturan/toko with 403 Forbidden', async ({
    client,
  }) => {
    const customer = await createUser('6282111110021', Role.CUSTOMER)
    const response = await client.get('/admin/pengaturan/toko').loginAs(customer)
    response.assertStatus(403)
  })

  test('staff is denied access to /admin/pengaturan/toko with 403 Forbidden', async ({
    client,
  }) => {
    const staff = await createUser('6281311110022', Role.STAFF)
    const response = await client.get('/admin/pengaturan/toko').loginAs(staff)
    response.assertStatus(403)
  })

  test('owner opens /admin/pengaturan/toko and receives store settings and pickup slots', async ({
    client,
    assert,
  }) => {
    const owner = await createUser('6281299990023', Role.ADMIN)
    const response = await client.get('/admin/pengaturan/toko').loginAs(owner).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('admin/settings/store')
    const slots = response.inertiaProps.slots as Array<{ id: string; label: string }>
    assert.isArray(slots)
    assert.equal(slots.length, 3)
  })

  test('owner updates store info and logs activity (OWN-8)', async ({ client, assert }) => {
    const owner = await createUser('6281299990024', Role.ADMIN)

    const payload = {
      name: 'Umima Clean Workshop Buahbatu',
      whatsapp: '081234567890',
      address: 'Jl. Margacinta No. 132B, Buahbatu, Kota Bandung',
    }

    const response = await client
      .put('/admin/pengaturan/toko')
      .loginAs(owner)
      .withCsrfToken()
      .json(payload)
      .redirects(0)

    response.assertStatus(302)

    const row = await Setting.findByOrFail('key', 'store')
    const stored = (typeof row.value === 'string' ? JSON.parse(row.value) : row.value) as Record<
      string,
      unknown
    >
    assert.equal(stored.name, 'Umima Clean Workshop Buahbatu')
    assert.equal(stored.whatsapp, '6281234567890')

    const log = await ActivityLog.query()
      .where('action', 'settings.store.update')
      .where('user_id', owner.id)
      .firstOrFail()
    assert.include(log.description, 'Umima Clean Workshop Buahbatu')
  })

  test('store info update rejects invalid inputs', async ({ client }) => {
    const owner = await createUser('6281299990025', Role.ADMIN)

    const response = await client
      .put('/admin/pengaturan/toko')
      .loginAs(owner)
      .withCsrfToken()
      .json({
        name: '',
        whatsapp: 'invalid-phone',
        address: 'short',
      })
      .redirects(0)

    response.assertStatus(302)
  })

  test('owner updates pickup slots and logs activity (SLOT-2)', async ({ client, assert }) => {
    const owner = await createUser('6281299990026', Role.ADMIN)

    const payload = {
      slots: [
        { id: 'slot-1', label: '09.00–12.00', capacity: 10, isActive: true },
        { id: 'slot-2', label: '12.00–15.00', capacity: 8, isActive: true },
        { id: 'slot-3', label: '15.00–18.00', capacity: 5, isActive: false },
      ],
      pickupDays: [6, 2, 4],
    }

    const response = await client
      .put('/admin/pengaturan/slot')
      .loginAs(owner)
      .withCsrfToken()
      .json(payload)
      .redirects(0)

    response.assertStatus(302)

    const row = await Setting.findByOrFail('key', 'pickup_slots')
    const stored = (typeof row.value === 'string' ? JSON.parse(row.value) : row.value) as Array<{
      id: string
      capacity: number
      isActive: boolean
    }>
    assert.equal(stored[0].capacity, 10)
    assert.isFalse(stored[2].isActive)

    const log = await ActivityLog.query()
      .where('action', 'settings.slots.update')
      .where('user_id', owner.id)
      .firstOrFail()
    assert.include(log.description, '3 slot')

    const days = await Setting.findByOrFail('key', 'pickup_days')
    assert.deepEqual(days.value, [2, 4, 6])
    const daysLog = await ActivityLog.findByOrFail('action', 'settings.pickup_days.update')
    assert.equal(daysLog.description, 'Memperbarui hari penjemputan (Selasa, Kamis, Sabtu)')
  })

  test('pickup slots update rejects capacity over 20 or under 1', async ({ client }) => {
    const owner = await createUser('6281299990027', Role.ADMIN)

    const response = await client
      .put('/admin/pengaturan/slot')
      .loginAs(owner)
      .withCsrfToken()
      .json({
        slots: [{ id: 'slot-1', label: '09.00–12.00', capacity: 25, isActive: true }],
        pickupDays: [1],
      })
      .redirects(0)

    response.assertStatus(302)
  })

  test('the owner page gets the pickup days, Monday to Saturday by default (SLOT-1, D103)', async ({
    client,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const response = await client.get('/admin/pengaturan/toko').withInertia().loginAs(owner)
    assert.deepEqual(response.inertiaProps.pickupDays, [1, 2, 3, 4, 5, 6])
  })

  test('saving without any pickup day is refused with its message (SLOT-1)', async ({
    client,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const response = await client
      .put('/admin/pengaturan/slot')
      .loginAs(owner)
      .withCsrfToken()
      .json({
        slots: [{ id: 'slot-1', label: '09.00–12.00', capacity: 6, isActive: true }],
        pickupDays: [],
      })
      .redirects(0)

    const next = await visitRedirect(client, response)
    next.assertInertiaPropsContains({
      errors: { pickupDays: 'Pilih minimal satu hari penjemputan.' },
    })
    const days = await Setting.findByOrFail('key', 'pickup_days')
    assert.deepEqual(days.value, [1, 2, 3, 4, 5, 6])
  })
})
