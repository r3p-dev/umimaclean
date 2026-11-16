import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import ServiceArea from '#models/service_area'
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

test.group('Service Areas (AREA-1..3, OWN-9)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('guest is redirected to staff login when opening /admin/pengaturan/area', async ({
    client,
  }) => {
    const response = await client.get('/admin/pengaturan/area').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/staf/masuk')
  })

  test('customer is denied access to /admin/pengaturan/area with 403 Forbidden', async ({
    client,
  }) => {
    const customer = await createUser('6282111110011', Role.CUSTOMER)
    const response = await client.get('/admin/pengaturan/area').loginAs(customer)
    response.assertStatus(403)
  })

  test('staff is denied access to /admin/pengaturan/area with 403 Forbidden', async ({
    client,
  }) => {
    const staff = await createUser('6281311110012', Role.STAFF)
    const response = await client.get('/admin/pengaturan/area').loginAs(staff)
    response.assertStatus(403)
  })

  test('owner opens /admin/pengaturan/area and receives all 64 districts', async ({
    client,
    assert,
  }) => {
    const owner = await createUser('6281299990013', Role.ADMIN)
    const response = await client.get('/admin/pengaturan/area').loginAs(owner).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('admin/settings/areas')
    const areas = response.inertiaProps.areas as Array<{ id: number; name: string; city: string }>
    assert.isArray(areas)
    assert.equal(areas.length, 64)
  })

  test('owner toggles district active state and logs activity (AREA-3, OWN-9)', async ({
    client,
    assert,
  }) => {
    const owner = await createUser('6281299990014', Role.ADMIN)
    const area = await ServiceArea.findByOrFail('name', 'Coblong')
    assert.isTrue(area.isActive)

    const response = await client
      .patch(`/admin/pengaturan/area/${area.id}/toggle`)
      .loginAs(owner)
      .withCsrfToken()
      .json({ isActive: false })
      .redirects(0)

    response.assertStatus(302)

    await area.refresh()
    assert.isFalse(area.isActive)

    const log = await ActivityLog.query()
      .where('action', 'area.toggle')
      .where('user_id', owner.id)
      .firstOrFail()
    assert.include(log.description, 'Coblong')
    assert.include(log.description, 'Nonaktif')
  })
})
