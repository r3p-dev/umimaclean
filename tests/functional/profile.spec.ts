import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { visitRedirect } from '../helpers/inertia.js'

function createUser(phone: string, role: Role) {
  return User.create({
    fullName: 'Rina Wulandari',
    phone,
    password: 'password123',
    role,
    isActive: true,
  })
}

test.group('Profile pages (CUST-12, OWN-13, STAFF-16, ACC-4)', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('customer sees the profile with the number of active devices (CUST-12, ACC-4)', async ({
    client,
  }) => {
    const customer = await createUser('6281200000101', Role.CUSTOMER)

    const response = await client.get('/profil').loginAs(customer).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('customer/profile/show')
    response.assertInertiaPropsContains({ deviceCount: 1 })
  })

  test('customer opens the edit page (CUST-12)', async ({ client }) => {
    const customer = await createUser('6281200000102', Role.CUSTOMER)

    const response = await client.get('/profil/ubah').loginAs(customer).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('customer/profile/edit')
  })

  test('customer changes their name (CUST-12)', async ({ client, assert }) => {
    const customer = await createUser('6281200000103', Role.CUSTOMER)

    const response = await client
      .put('/profil')
      .loginAs(customer)
      .withCsrfToken()
      .redirects(0)
      .form({ name: '  Rina Putri  ' })

    response.assertHeader('location', '/profil')
    response.assertFlashMessage('success', 'Nama diperbarui.')
    await customer.refresh()
    assert.equal(customer.fullName, 'Rina Putri')
  })

  test('a name shorter than 2 characters is refused (CUST-12)', async ({ client, assert }) => {
    const customer = await createUser('6281200000104', Role.CUSTOMER)

    const response = await client
      .put('/profil')
      .header('referer', '/profil/ubah')
      .loginAs(customer)
      .withCsrfToken()
      .redirects(0)
      .form({ name: 'R' })

    const page = await visitRedirect(client, response)
    page.assertInertiaComponent('customer/profile/edit')
    page.assertInertiaPropsContains({ errors: { name: 'Minimal 2 karakter.' } })
    await customer.refresh()
    assert.equal(customer.fullName, 'Rina Wulandari')
  })

  test('staff sees their profile with account security (STAFF-16, ACC-4)', async ({ client }) => {
    const staff = await createUser('6281200000105', Role.STAFF)

    const response = await client.get('/staf/profil').loginAs(staff).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('staff/profile')
    response.assertInertiaPropsContains({ deviceCount: 1 })
  })

  test('owner sees their profile, and can use the staff profile too (OWN-13)', async ({
    client,
  }) => {
    const owner = await createUser('6281200000106', Role.ADMIN)

    const ownerPage = await client.get('/admin/profil').loginAs(owner).withInertia()
    ownerPage.assertStatus(200)
    ownerPage.assertInertiaComponent('admin/profile')
    ownerPage.assertInertiaPropsContains({ deviceCount: 1 })

    const staffPage = await client.get('/staf/profil').loginAs(owner).withInertia()
    staffPage.assertStatus(200)
    staffPage.assertInertiaComponent('staff/profile')
  })

  test('every role is refused on the profile pages it does not belong to', async ({ client }) => {
    const customer = await createUser('6281200000107', Role.CUSTOMER)
    const staff = await createUser('6281200000108', Role.STAFF)
    const owner = await createUser('6281200000109', Role.ADMIN)

    for (const url of ['/profil', '/profil/ubah', '/profil/nomor']) {
      const asGuest = await client.get(url)
      asGuest.assertRedirectsTo('/masuk')
      const asStaff = await client.get(url).loginAs(staff)
      asStaff.assertStatus(403)
      const asOwner = await client.get(url).loginAs(owner)
      asOwner.assertStatus(403)
    }

    const guestOnStaff = await client.get('/staf/profil')
    guestOnStaff.assertRedirectsTo('/staf/masuk')
    const customerOnStaff = await client.get('/staf/profil').loginAs(customer)
    customerOnStaff.assertStatus(403)
    const guestOnOwner = await client.get('/admin/profil')
    guestOnOwner.assertRedirectsTo('/staf/masuk')
    const customerOnOwner = await client.get('/admin/profil').loginAs(customer)
    customerOnOwner.assertStatus(403)
    const staffOnOwner = await client.get('/admin/profil').loginAs(staff)
    staffOnOwner.assertStatus(403)

    const staffRename = await client
      .put('/profil')
      .loginAs(staff)
      .withCsrfToken()
      .form({ name: 'Nama Baru' })
    staffRename.assertStatus(403)

    const ownerPhone = await client
      .post('/profil/nomor')
      .loginAs(owner)
      .withCsrfToken()
      .form({ phone: '081200000199' })
    ownerPhone.assertStatus(403)
  })
})
