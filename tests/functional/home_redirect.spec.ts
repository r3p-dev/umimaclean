import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { Role } from '#enums/role_enum'
import User from '#models/user'

function createUser(phone: string, role: Role) {
  return User.create({
    fullName: 'Rina Wulandari',
    phone,
    password: 'password123',
    role,
    isActive: true,
  })
}

test.group('Landing redirect for signed-in users', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('guests see landing on / while signed-in roles redirect to their home', async ({
    client,
  }) => {
    const guest = await client.get('/').withInertia().redirects(0)
    guest.assertStatus(200)
    guest.assertInertiaComponent('home')

    const customer = await createUser('6281200000801', Role.CUSTOMER)
    const customerRes = await client.get('/').loginAs(customer).redirects(0)
    customerRes.assertStatus(302)
    customerRes.assertHeader('location', '/beranda')

    const staff = await createUser('6281200000802', Role.STAFF)
    const staffRes = await client.get('/').loginAs(staff).redirects(0)
    staffRes.assertStatus(302)
    staffRes.assertHeader('location', '/staf')

    const admin = await createUser('6281200000803', Role.ADMIN)
    const adminRes = await client.get('/').loginAs(admin).redirects(0)
    adminRes.assertStatus(302)
    adminRes.assertHeader('location', '/admin')
  })
})
