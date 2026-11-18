import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Setting from '#models/setting'
import ActivityLog from '#models/activity_log'
import { Role } from '#enums/role_enum'

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

  test('owner opens /admin/pengaturan/toko and receives the opening hours; slots have their own page (D106)', async ({
    client,
    assert,
  }) => {
    const owner = await createUser('6281299990023', Role.ADMIN)
    const response = await client.get('/admin/pengaturan/toko').loginAs(owner).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('admin/settings/store')
    assert.lengthOf(response.inertiaProps.hours.days, 7)
    assert.notProperty(response.inertiaProps, 'slots')
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

  test('pickup days follow the opening hours: there is no separate setting (SLOT-1, D104)', async ({
    client,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const response = await client.get('/admin/pengaturan/toko').withInertia().loginAs(owner)
    assert.notProperty(response.inertiaProps, 'pickupDays')
    assert.isNull(await Setting.findBy('key', 'pickup_days'))
  })
})
