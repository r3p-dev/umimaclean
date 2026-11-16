import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Service from '#models/service'
import ActivityLog from '#models/activity_log'
import { Role } from '#enums/role_enum'
import { ItemKind } from '#enums/item_kind_enum'
import { ServiceType } from '#enums/service_type_enum'
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

test.group('Services & Prices (SVC-1..5, OWN-7, GUEST-1)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('guest is redirected to staff login when opening /admin/layanan', async ({ client }) => {
    const response = await client.get('/admin/layanan').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/staf/masuk')
  })

  test('customer is denied access to /admin/layanan with 403 Forbidden', async ({ client }) => {
    const customer = await createUser('6282111110001', Role.CUSTOMER)
    const response = await client.get('/admin/layanan').loginAs(customer)
    response.assertStatus(403)
  })

  test('staff is denied access to /admin/layanan with 403 Forbidden', async ({ client }) => {
    const staff = await createUser('6281311110002', Role.STAFF)
    const response = await client.get('/admin/layanan').loginAs(staff)
    response.assertStatus(403)
  })

  test('owner opens /admin/layanan and sees seeded services list', async ({ client, assert }) => {
    const owner = await createUser('6281299990003', Role.ADMIN)
    const response = await client.get('/admin/layanan').loginAs(owner).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('admin/services')
    const services = response.inertiaProps.services as Array<{ id: string; name: string }>
    assert.isArray(services)
    assert.isAtLeast(services.length, 22)
  })

  test('owner creates a new service (SVC-1, OWN-7)', async ({ client, assert }) => {
    const owner = await createUser('6281299990004', Role.ADMIN)

    const payload = {
      name: 'Custom Sneaker Customization',
      type: ServiceType.MAIN,
      itemKinds: [ItemKind.SHOE],
      price: 250_000,
      estimatedDays: 7,
      isStartingFrom: true,
      description: 'Layanan kustomisasi desain sepatu sesuai permintaan.',
      isActive: true,
    }

    const response = await client
      .post('/admin/layanan')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .header('x-inertia', 'true')
      .json(payload)

    response.assertStatus(302)
    response.assertHeader('location', '/admin/layanan')

    const created = await Service.query().where('name', payload.name).firstOrFail()
    assert.equal(created.price, 250_000)
    assert.equal(created.type, ServiceType.MAIN)
    assert.deepEqual(created.itemKinds, [ItemKind.SHOE])
    assert.isTrue(created.isStartingFrom)

    const log = await ActivityLog.query()
      .where('userId', owner.id)
      .where('action', 'service.create')
      .firstOrFail()
    assert.equal(log.category, 'service')
    assert.include(log.description, payload.name)
  })

  test('create service fails on invalid input and returns validation errors (D63)', async ({
    client,
    assert,
  }) => {
    const owner = await createUser('6281299990005', Role.ADMIN)

    const payload = {
      name: '',
      type: 'invalid_type',
      itemKinds: [],
      price: -5000,
      estimatedDays: 0,
      isStartingFrom: false,
      description: '',
    }

    const response = await client
      .post('/admin/layanan')
      .header('referer', '/admin/layanan')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .form(payload)

    response.assertStatus(302)
    const redirected = await visitRedirect(client, response)
    redirected.assertInertiaPropsContains({
      errors: {
        name: 'Nama wajib diisi.',
        price: 'Harga tidak boleh kurang dari 0.',
      },
    })
    const errors = redirected.inertiaProps.errors as Record<string, string>
    assert.isDefined(errors.type)
    assert.isDefined(errors.itemKinds)
  })

  test('owner updates an existing service (SVC-1, OWN-7)', async ({ client, assert }) => {
    const owner = await createUser('6281299990006', Role.ADMIN)
    const service = await Service.query().where('name', 'Mild').firstOrFail()

    const updatePayload = {
      name: 'Mild Eco Clean',
      type: ServiceType.MAIN,
      itemKinds: [ItemKind.SHOE],
      price: 65_000,
      estimatedDays: 3,
      isStartingFrom: false,
      description: 'Pencucian ramah lingkungan.',
      isActive: true,
    }

    const response = await client
      .put(`/admin/layanan/${service.id}`)
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .header('x-inertia', 'true')
      .json(updatePayload)

    response.assertStatus(303)
    response.assertHeader('location', '/admin/layanan')

    const updated = await Service.findOrFail(service.id)
    assert.equal(updated.name, 'Mild Eco Clean')
    assert.equal(updated.price, 65_000)

    const log = await ActivityLog.query()
      .where('userId', owner.id)
      .where('action', 'service.update')
      .firstOrFail()
    assert.include(log.description, 'Mild Eco Clean')
    assert.include(log.description, 'Harga: Rp60.000 → Rp65.000')
  })

  test('owner toggles service active/inactive status (SVC-2, OWN-7)', async ({
    client,
    assert,
  }) => {
    const owner = await createUser('6281299990007', Role.ADMIN)
    const service = await Service.query().where('name', 'Medium').firstOrFail()

    const response = await client
      .patch(`/admin/layanan/${service.id}/toggle`)
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .form({ isActive: false })

    response.assertStatus(302)
    response.assertHeader('location', '/admin/layanan')

    const updated = await Service.findOrFail(service.id)
    assert.isFalse(updated.isActive)

    const log = await ActivityLog.query()
      .where('userId', owner.id)
      .where('action', 'service.toggle')
      .firstOrFail()
    assert.include(log.description, 'Menonaktifkan layanan "Medium"')
  })

  test('owner bulk toggles multiple services (OWN-7)', async ({ client, assert }) => {
    const owner = await createUser('6281299990008', Role.ADMIN)
    const services = await Service.query().whereIn('name', ['Hard', 'Kids Shoes']).exec()
    const ids = services.map((s) => s.id)

    const response = await client
      .post('/admin/layanan/bulk-toggle')
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .form({ ids, isActive: false })

    response.assertStatus(302)
    response.assertHeader('location', '/admin/layanan')

    const reloaded = await Service.query().whereIn('id', ids).exec()
    assert.isTrue(reloaded.every((s) => !s.isActive))

    const log = await ActivityLog.query()
      .where('userId', owner.id)
      .where('action', 'service.bulk_toggle')
      .firstOrFail()
    assert.include(log.description, 'Menonaktifkan 2 layanan')
  })

  test('owner soft-deletes a service; deleted service cannot be toggled (SVC-2, OWN-7)', async ({
    client,
    assert,
  }) => {
    const owner = await createUser('6281299990009', Role.ADMIN)
    const service = await Service.query().where('name', 'One Day Service').firstOrFail()

    const response = await client
      .delete(`/admin/layanan/${service.id}`)
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/admin/layanan')

    const deleted = await Service.findOrFail(service.id)
    assert.isNotNull(deleted.deletedAt)
    assert.isFalse(deleted.isActive)

    const log = await ActivityLog.query()
      .where('userId', owner.id)
      .where('action', 'service.delete')
      .firstOrFail()
    assert.isTrue(log.isSensitive)

    // Attempting to toggle or update deleted service results in 404
    const toggleDeleted = await client
      .patch(`/admin/layanan/${service.id}/toggle`)
      .loginAs(owner)
      .withCsrfToken()
      .redirects(0)
      .form({ isActive: true })
    toggleDeleted.assertStatus(404)
  })

  test('landing page GET / renders active services and excludes inactive ones (GUEST-1)', async ({
    client,
    assert,
  }) => {
    const service = await Service.query().where('name', 'Medium').firstOrFail()
    service.isActive = false
    await service.save()

    const response = await client.get('/').withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('home')
    const services = response.inertiaProps.services as Array<{ id: string; name: string }>
    assert.isArray(services)
    const medium = services.find((s: { name: string }) => s.name === 'Medium')
    assert.isUndefined(medium, 'Inactive service must not appear in public landing list')
    const mild = services.find((s: { name: string }) => s.name === 'Mild')
    assert.isDefined(mild, 'Active service must appear in public landing list')
  })
})
