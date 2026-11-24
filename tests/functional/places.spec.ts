import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { DIPATIUKUR, loadOsmFixture } from '../helpers/osm.js'

function createUser(phone: string, role: Role = Role.CUSTOMER) {
  return User.create({
    fullName: 'Rina Wulandari',
    phone,
    password: 'password123',
    role,
    isActive: true,
  })
}

test.group('Place search and street label GET /tempat, /tempat/titik (MAP-1, D80)', (group) => {
  group.each.setup(async () => {
    await limiter.clear(['memory'])
    const rollback = await testUtils.db().wrapInGlobalTransaction()
    await loadOsmFixture()
    return rollback
  })

  test('a signed-in user finds a street typed with a space (MAP-1)', async ({ client, assert }) => {
    const customer = await createUser('6281200000401')

    const response = await client
      .get('/tempat')
      .qs({ q: 'dipati ukur', ...DIPATIUKUR })
      .accept('json')
      .loginAs(customer)

    response.assertStatus(200)
    const body = response.body()
    assert.isTrue(body.isAvailable)
    assert.equal(body.places[0].name, 'Jalan Dipatiukur')
    assert.equal(body.places[0].detail, 'Lebakgede, Kec. Coblong')
  })

  test('staff may search too; a request without a search is refused (MAP-1)', async ({
    client,
    assert,
  }) => {
    const staff = await createUser('6281200000402', Role.STAFF)

    const withoutSearch = await client.get('/tempat').qs(DIPATIUKUR).accept('json').loginAs(staff)
    withoutSearch.assertStatus(422)

    const response = await client
      .get('/tempat')
      .qs({ q: 'dipatiukur', ...DIPATIUKUR })
      .accept('json')
      .loginAs(staff)
    response.assertStatus(200)
    assert.equal(response.body().places[0].name, 'Jalan Dipatiukur')
  })

  test('the label names the street and kelurahan under the pin (MAP-1)', async ({ client }) => {
    const customer = await createUser('6281200000403')

    const response = await client
      .get('/tempat/titik')
      .qs(DIPATIUKUR)
      .accept('json')
      .loginAs(customer)

    response.assertStatus(200)
    response.assertBody({ street: 'Jalan Dipatiukur', kelurahan: 'Lebakgede' })
  })

  test('guests may not search or read labels (MAP-1)', async ({ client }) => {
    const search = await client
      .get('/tempat')
      .qs({ q: 'dipatiukur', ...DIPATIUKUR })
      .accept('json')
    search.assertStatus(401)
    const label = await client.get('/tempat/titik').qs(DIPATIUKUR).accept('json')
    label.assertStatus(401)
  })

  test('a search shorter than 3 letters is refused (MAP-1)', async ({ client }) => {
    const customer = await createUser('6281200000404')

    const response = await client
      .get('/tempat')
      .qs({ q: 'ab', ...DIPATIUKUR })
      .accept('json')
      .loginAs(customer)

    response.assertStatus(422)
  })

  test('the 31st search in a minute is refused with the wait time; labels have their own count (D80)', async ({
    client,
    assert,
  }) => {
    const customer = await createUser('6281200000405')
    const other = await createUser('6281200000406')
    for (let attempt = 0; attempt < 30; attempt++) {
      const response = await client
        .get('/tempat')
        .qs({ q: 'dipatiukur', ...DIPATIUKUR })
        .accept('json')
        .loginAs(customer)
      response.assertStatus(200)
    }

    const blocked = await client
      .get('/tempat')
      .qs({ q: 'dipatiukur', ...DIPATIUKUR })
      .accept('json')
      .loginAs(customer)
    blocked.assertStatus(429)
    assert.match(
      blocked.body().errors[0].message,
      /^Terlalu banyak pencarian\. Coba lagi dalam \d+ detik\.$/
    )

    const label = await client.get('/tempat/titik').qs(DIPATIUKUR).accept('json').loginAs(customer)
    label.assertStatus(200)
    const otherUser = await client
      .get('/tempat')
      .qs({ q: 'dipatiukur', ...DIPATIUKUR })
      .accept('json')
      .loginAs(other)
    otherUser.assertStatus(200)
  })
})

test.group('Place search without OSM data (MAP-1, NFR-4)', (group) => {
  group.each.setup(async () => {
    await limiter.clear(['memory'])
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('search says it is unavailable and the label is empty (MAP-1)', async ({ client }) => {
    const customer = await createUser('6281200000407')

    const search = await client
      .get('/tempat')
      .qs({ q: 'dipatiukur', ...DIPATIUKUR })
      .accept('json')
      .loginAs(customer)
    search.assertBody({ isAvailable: false, places: [] })

    const label = await client.get('/tempat/titik').qs(DIPATIUKUR).accept('json').loginAs(customer)
    label.assertBody({ street: null, kelurahan: null })
  })
})
