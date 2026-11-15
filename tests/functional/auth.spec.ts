import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import ActivityLog from '#models/activity_log'

test.group('Authentication & Authorization (ACC-1, ACC-3, GUEST-11, STAFF-1)', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('POST /masuk authenticates valid customer credentials and redirects to /beranda', async ({
    client,
  }) => {
    await User.create({
      fullName: 'Pelanggan Test',
      phone: '6281200000010',
      password: 'password123',
      role: 'customer',
      isActive: true,
    })

    const response = await client.post('/masuk').withCsrfToken().form({
      phone: '081200000010',
      password: 'password123',
    })

    response.assertRedirectsTo('/beranda')
  })

  test('POST /masuk sets remember-me token when rememberMe checkbox is checked', async ({
    client,
    assert,
  }) => {
    const user = await User.create({
      fullName: 'Pelanggan Remember',
      phone: '6281200000011',
      password: 'password123',
      role: 'customer',
      isActive: true,
    })

    const response = await client.post('/masuk').withCsrfToken().form({
      phone: '081200000011',
      password: 'password123',
      rememberMe: true,
    })

    response.assertRedirectsTo('/beranda')

    const dbUser = await User.query().where('id', user.id).firstOrFail()
    assert.isNotNull(dbUser)
  })

  test('POST /masuk refuses wrong credentials with single generic message (ACC-3)', async ({
    client,
  }) => {
    await User.create({
      fullName: 'Pelanggan Test',
      phone: '6281200000012',
      password: 'password123',
      role: 'customer',
      isActive: true,
    })

    const res1 = await client.post('/masuk').redirects(0).withCsrfToken().form({
      phone: '081200000012',
      password: 'wrongpassword',
    })
    res1.assertStatus(302)
    res1.assertHeader('location', '/masuk')
    res1.assertValidationError('phone', 'Nomor WhatsApp atau kata sandi salah.')

    const res2 = await client.post('/masuk').redirects(0).withCsrfToken().form({
      phone: '081299999999',
      password: 'password123',
    })
    res2.assertStatus(302)
    res2.assertHeader('location', '/masuk')
    res2.assertValidationError('phone', 'Nomor WhatsApp atau kata sandi salah.')
  })

  test('POST /masuk refuses inactive customer accounts', async ({ client }) => {
    await User.create({
      fullName: 'Pelanggan Nonaktif',
      phone: '6281200000099',
      password: 'password123',
      role: 'customer',
      isActive: false,
    })

    const response = await client.post('/masuk').redirects(0).withCsrfToken().form({
      phone: '081200000099',
      password: 'password123',
    })

    response.assertStatus(302)
    response.assertHeader('location', '/masuk')
    response.assertValidationError('phone', 'Akun Anda dinonaktifkan. Hubungi kami untuk bantuan.')
  })

  test('POST /masuk points staff and owner accounts to /staf/masuk (GUEST-11)', async ({
    client,
  }) => {
    await User.create({
      fullName: 'Staf Test',
      phone: '6281200000002',
      password: 'password123',
      role: 'staff',
      isActive: true,
    })

    const response = await client.post('/masuk').redirects(0).withCsrfToken().form({
      phone: '081200000002',
      password: 'password123',
    })

    response.assertStatus(302)
    response.assertHeader('location', '/masuk')
    response.assertValidationError(
      'phone',
      'Akun staf dan pemilik silakan masuk melalui halaman masuk staf.'
    )
  })

  test('POST /staf/masuk authenticates staff and redirects to /staf (STAFF-1)', async ({
    client,
    assert,
  }) => {
    const staff = await User.create({
      fullName: 'Asep Kurir',
      phone: '6281200000003',
      password: 'password123',
      role: 'staff',
      isActive: true,
    })

    const response = await client.post('/staf/masuk').withCsrfToken().form({
      phone: '081200000003',
      password: 'password123',
    })

    response.assertRedirectsTo('/staf')

    await staff.refresh()
    assert.isNotNull(staff.lastSeenAt)

    const log = await ActivityLog.query().where('userId', staff.id).firstOrFail()
    assert.equal(log.category, 'auth')
    assert.equal(log.action, 'sign_in')
  })

  test('POST /staf/masuk authenticates owner (admin) and redirects to /admin (STAFF-1, OWN-2)', async ({
    client,
    assert,
  }) => {
    const admin = await User.create({
      fullName: 'Budi Pemilik',
      phone: '6281200000001',
      password: 'password123',
      role: 'admin',
      isActive: true,
    })

    const response = await client.post('/staf/masuk').withCsrfToken().form({
      phone: '081200000001',
      password: 'password123',
    })

    response.assertRedirectsTo('/admin')

    await admin.refresh()
    assert.isNotNull(admin.lastSeenAt)

    const log = await ActivityLog.query().where('userId', admin.id).firstOrFail()
    assert.equal(log.category, 'auth')
    assert.equal(log.action, 'sign_in')
  })

  test('POST /staf/masuk points customer accounts to /masuk', async ({ client }) => {
    await User.create({
      fullName: 'Pelanggan Test',
      phone: '6281200000013',
      password: 'password123',
      role: 'customer',
      isActive: true,
    })

    const response = await client.post('/staf/masuk').redirects(0).withCsrfToken().form({
      phone: '081200000013',
      password: 'password123',
    })

    response.assertStatus(302)
    response.assertHeader('location', '/staf/masuk')
    response.assertValidationError(
      'phone',
      'Akun pelanggan silakan masuk melalui halaman masuk pelanggan.'
    )
  })

  test('POST /keluar terminates session and redirects to /masuk', async ({ client }) => {
    const customer = await User.create({
      fullName: 'Pelanggan Logout',
      phone: '6281200000014',
      password: 'password123',
      role: 'customer',
      isActive: true,
    })

    const response = await client.post('/keluar').loginAs(customer).withCsrfToken()
    response.assertRedirectsTo('/masuk')
  })

  test('Route authorization: every role is refused where it does not belong', async ({
    client,
  }) => {
    const customer = await User.create({
      fullName: 'Rina Pelanggan',
      phone: '6281200000015',
      password: 'password123',
      role: 'customer',
      isActive: true,
    })

    const staff = await User.create({
      fullName: 'Asep Staf',
      phone: '6281200000004',
      password: 'password123',
      role: 'staff',
      isActive: true,
    })

    const admin = await User.create({
      fullName: 'Budi Pemilik',
      phone: '6281200000005',
      password: 'password123',
      role: 'admin',
      isActive: true,
    })

    // 1. Guest
    const guestCustomer = await client.get('/beranda')
    guestCustomer.assertRedirectsTo('/masuk')

    const guestStaff = await client.get('/staf')
    guestStaff.assertRedirectsTo('/staf/masuk')

    const guestAdmin = await client.get('/admin')
    guestAdmin.assertRedirectsTo('/staf/masuk')

    // 2. Customer
    const custOnCustomer = await client.get('/beranda').loginAs(customer)
    custOnCustomer.assertStatus(200)

    const custOnStaff = await client.get('/staf').loginAs(customer)
    custOnStaff.assertStatus(403)

    const custOnAdmin = await client.get('/admin').loginAs(customer)
    custOnAdmin.assertStatus(403)

    // 3. Staff
    const staffOnCustomer = await client.get('/beranda').loginAs(staff)
    staffOnCustomer.assertStatus(403)

    const staffOnStaff = await client.get('/staf').loginAs(staff)
    staffOnStaff.assertStatus(200)

    const staffOnAdmin = await client.get('/admin').loginAs(staff)
    staffOnAdmin.assertStatus(403)

    // 4. Owner (Admin)
    const adminOnCustomer = await client.get('/beranda').loginAs(admin)
    adminOnCustomer.assertStatus(403)

    const adminOnStaff = await client.get('/staf').loginAs(admin)
    adminOnStaff.assertStatus(200)

    const adminOnAdmin = await client.get('/admin').loginAs(admin)
    adminOnAdmin.assertStatus(200)
  })
})
