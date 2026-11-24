import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import CustomerAddress from '#models/customer_address'
import ServiceArea from '#models/service_area'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { OUTSIDE_AREA_MESSAGE, TOO_MANY_ADDRESSES_MESSAGE } from '#services/address_service'
import { visitRedirect } from '../helpers/inertia.js'

// Coblong (Kota Bandung) is active in the seed; Cileunyi is not.
const COBLONG = { lat: -6.881768, lng: 107.61421 }
const CILEUNYI = { lat: -6.925479, lng: 107.742516 }

function createUser(phone: string, role: Role = Role.CUSTOMER) {
  return User.create({
    fullName: 'Rina Wulandari',
    phone,
    password: 'password123',
    role,
    isActive: true,
  })
}

function addressOf(user: User, label: string, isPrimary = false) {
  return CustomerAddress.create({
    userId: user.id,
    label,
    recipientName: 'Rina Wulandari',
    recipientPhone: user.phone,
    addressText: 'Jl. Dipatiukur No. 35, Coblong',
    landmark: null,
    ...COBLONG,
    isPrimary,
  })
}

const FORM = {
  label: 'Rumah',
  recipientName: 'Rina Wulandari',
  recipientPhone: '0812 0000 0301',
  addressText: 'Jl. Dipatiukur No. 35, Coblong',
  landmark: '',
  lat: String(COBLONG.lat),
  lng: String(COBLONG.lng),
}

test.group('Address pages (CUST-2, CUST-3, CUST-14, AREA-4, D82)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('a guest is sent to sign in; staff are refused (CUST-14)', async ({ client }) => {
    const guest = await client.get('/profil/alamat').redirects(0)
    guest.assertStatus(302)
    guest.assertHeader('location', '/masuk')

    const staff = await createUser('6281200000300', Role.STAFF)
    const refused = await client.get('/profil/alamat').loginAs(staff)
    refused.assertStatus(403)
  })

  test('the list shows the primary first and marks a district turned off (CUST-14, D82)', async ({
    client,
    assert,
  }) => {
    const customer = await createUser('6281200000301')
    await addressOf(customer, 'Rumah', true)
    await CustomerAddress.create({
      userId: customer.id,
      label: 'Kos',
      recipientName: 'Sinta',
      recipientPhone: '6281200000999',
      addressText: 'Jl. Raya Cileunyi No. 8, Cileunyi',
      landmark: null,
      ...CILEUNYI,
      isPrimary: false,
    })

    const response = await client.get('/profil/alamat').loginAs(customer).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('customer/addresses/index')
    const { addresses, maxAddresses } = response.inertiaProps as {
      addresses: { label: string; isPrimary: boolean; isCovered: boolean }[]
      maxAddresses: number
    }
    assert.equal(maxAddresses, 3)
    assert.deepEqual(
      addresses.map((address) => [address.label, address.isPrimary, address.isCovered]),
      [
        ['Rumah', true, true],
        ['Kos', false, false],
      ]
    )
  })

  test('the first address is saved as primary with a normalized phone (CUST-2, CUST-3)', async ({
    client,
    assert,
  }) => {
    const customer = await createUser('6281200000302')
    const page = await client.get('/profil/alamat/baru').loginAs(customer).withInertia()
    page.assertInertiaComponent('customer/addresses/form')
    page.assertInertiaPropsContains({ address: null, isFirstAddress: true })

    const response = await client
      .post('/profil/alamat')
      .loginAs(customer)
      .withCsrfToken()
      .redirects(0)
      .form(FORM)

    response.assertHeader('location', '/profil/alamat')
    response.assertFlashMessage('success', 'Alamat disimpan.')
    const saved = await CustomerAddress.findByOrFail('user_id', customer.id)
    assert.isTrue(saved.isPrimary)
    assert.equal(saved.recipientPhone, '6281200000301')
    assert.isNull(saved.landmark)
  })

  test('a pin outside the active areas is refused under the map (AREA-4)', async ({
    client,
    assert,
  }) => {
    const customer = await createUser('6281200000303')

    const response = await client
      .post('/profil/alamat')
      .header('referer', '/profil/alamat/baru')
      .loginAs(customer)
      .withCsrfToken()
      .redirects(0)
      .form({ ...FORM, lat: String(CILEUNYI.lat), lng: String(CILEUNYI.lng) })

    const page = await visitRedirect(client, response)
    page.assertInertiaPropsContains({ errors: { lat: OUTSIDE_AREA_MESSAGE } })
    assert.isNull(await CustomerAddress.findBy('user_id', customer.id))
  })

  test('a fourth address is refused, and the add page sends back to the list (CUST-2)', async ({
    client,
    assert,
  }) => {
    const customer = await createUser('6281200000304')
    await addressOf(customer, 'Rumah', true)
    await addressOf(customer, 'Kantor')
    await addressOf(customer, 'Kos')

    const page = await client.get('/profil/alamat/baru').loginAs(customer).redirects(0)
    page.assertHeader('location', '/profil/alamat')
    page.assertFlashMessage('error', TOO_MANY_ADDRESSES_MESSAGE)

    const response = await client
      .post('/profil/alamat')
      .header('referer', '/profil/alamat/baru')
      .loginAs(customer)
      .withCsrfToken()
      .redirects(0)
      .form({ ...FORM, label: 'Gudang' })
    // Back on the add page, which sends a full list on to the list page with the message.
    response.assertStatus(302)
    assert.lengthOf(await CustomerAddress.query().where('user_id', customer.id), 3)
  })

  test('editing changes the fields and can make the address primary (CUST-14)', async ({
    client,
    assert,
  }) => {
    const customer = await createUser('6281200000305')
    const home = await addressOf(customer, 'Rumah', true)
    const office = await addressOf(customer, 'Kantor')

    const page = await client
      .get(`/profil/alamat/${office.id}/ubah`)
      .loginAs(customer)
      .withInertia()
    page.assertInertiaComponent('customer/addresses/form')
    page.assertInertiaPropsContains({ address: { id: office.id, label: 'Kantor' } })

    const response = await client
      .put(`/profil/alamat/${office.id}`)
      .loginAs(customer)
      .withCsrfToken()
      .redirects(0)
      .form({ ...FORM, label: 'Kantor Pusat', landmark: 'Lobi timur', isPrimary: 'true' })

    response.assertHeader('location', '/profil/alamat')
    await office.refresh()
    await home.refresh()
    assert.equal(office.label, 'Kantor Pusat')
    assert.equal(office.landmark, 'Lobi timur')
    assert.isTrue(office.isPrimary)
    assert.isFalse(home.isPrimary)
  })

  test('"Jadikan utama" moves the primary mark (CUST-2)', async ({ client, assert }) => {
    const customer = await createUser('6281200000306')
    const home = await addressOf(customer, 'Rumah', true)
    const office = await addressOf(customer, 'Kantor')

    const response = await client
      .post(`/profil/alamat/${office.id}/utama`)
      .loginAs(customer)
      .withCsrfToken()
      .redirects(0)

    response.assertFlashMessage('success', 'Kantor jadi alamat utama.')
    await home.refresh()
    await office.refresh()
    assert.isTrue(office.isPrimary)
    assert.isFalse(home.isPrimary)
  })

  test('deleting the primary promotes the newest remaining address (CUST-2)', async ({
    client,
    assert,
  }) => {
    const customer = await createUser('6281200000307')
    const home = await addressOf(customer, 'Rumah', true)
    const office = await addressOf(customer, 'Kantor')
    const room = await addressOf(customer, 'Kos')

    const response = await client
      .delete(`/profil/alamat/${home.id}`)
      .loginAs(customer)
      .withCsrfToken()
      .redirects(0)

    response.assertFlashMessage('success', 'Alamat Rumah dihapus.')
    assert.isNull(await CustomerAddress.find(home.id))
    await office.refresh()
    await room.refresh()
    assert.isTrue(room.isPrimary)
    assert.isFalse(office.isPrimary)
  })

  test('another customer’s address answers 404 on every action (CUST-14)', async ({
    client,
    assert,
  }) => {
    const owner = await createUser('6281200000308')
    const other = await createUser('6281200000309')
    const address = await addressOf(owner, 'Rumah', true)

    const edit = await client.get(`/profil/alamat/${address.id}/ubah`).loginAs(other)
    edit.assertStatus(404)
    const update = await client
      .put(`/profil/alamat/${address.id}`)
      .loginAs(other)
      .withCsrfToken()
      .form(FORM)
    update.assertStatus(404)
    const primary = await client
      .post(`/profil/alamat/${address.id}/utama`)
      .loginAs(other)
      .withCsrfToken()
    primary.assertStatus(404)
    const destroy = await client
      .delete(`/profil/alamat/${address.id}`)
      .loginAs(other)
      .withCsrfToken()
    destroy.assertStatus(404)

    await address.refresh()
    assert.equal(address.label, 'Rumah')
  })
})

test.group('Pin coverage check GET /area/cek-titik (AREA-4, D80, D109)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    await limiter.clear(['memory'])
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('a signed-in user learns whether a pin is covered (AREA-4)', async ({ client }) => {
    const customer = await createUser('6281200000310')

    const inside = await client.get('/area/cek-titik').qs(COBLONG).accept('json').loginAs(customer)
    inside.assertStatus(200)
    inside.assertBody({ isCovered: true, district: { name: 'Coblong', city: 'Kota Bandung' } })

    const turnedOff = await client
      .get('/area/cek-titik')
      .qs(CILEUNYI)
      .accept('json')
      .loginAs(customer)
    turnedOff.assertBody({
      isCovered: false,
      district: { name: 'Cileunyi', city: 'Kabupaten Bandung' },
    })

    const jakarta = await client
      .get('/area/cek-titik')
      .qs({ lat: -6.2, lng: 106.8 })
      .accept('json')
      .loginAs(customer)
    jakarta.assertBody({ isCovered: false, district: null })
  })

  test('staff may check pins too; guests may not (AREA-4)', async ({ client }) => {
    const staff = await createUser('6281200000311', Role.STAFF)
    const allowed = await client.get('/area/cek-titik').qs(COBLONG).accept('json').loginAs(staff)
    allowed.assertStatus(200)

    const guest = await client.get('/area/cek-titik').qs(COBLONG).accept('json')
    guest.assertStatus(401)
  })

  test('the check follows the area switch, not a stored answer (AREA-4)', async ({ client }) => {
    const customer = await createUser('6281200000312')
    await ServiceArea.query().where('name', 'Coblong').update({ is_active: false })

    const response = await client
      .get('/area/cek-titik')
      .qs(COBLONG)
      .accept('json')
      .loginAs(customer)
    response.assertBodyContains({ isCovered: false })
  })

  test('the 61st check in a minute from one IP is refused with the wait time (D80)', async ({
    client,
    assert,
  }) => {
    const customer = await createUser('6281200000313')
    for (let attempt = 0; attempt < 60; attempt++) {
      const response = await client
        .get('/area/cek-titik')
        .qs(COBLONG)
        .accept('json')
        .loginAs(customer)
      response.assertStatus(200)
    }

    const blocked = await client.get('/area/cek-titik').qs(COBLONG).accept('json').loginAs(customer)
    blocked.assertStatus(429)
    assert.match(
      blocked.body().errors[0].message,
      /^Terlalu banyak pengecekan\. Coba lagi dalam \d+ detik\.$/
    )
  })
})
