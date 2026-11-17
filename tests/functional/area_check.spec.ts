import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/user'
import { Role } from '#enums/role_enum'

const BUAHBATU = { lat: -6.955631, lng: 107.6539748 }
const CILENGKRANG = { lat: -6.873436, lng: 107.719384 }
const JAKARTA = { lat: -6.175392, lng: 106.827153 }

test.group('Coverage check GET /area/cek (AREA-4, GUEST-1, D80, D94)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    await limiter.clear(['memory'])
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('a point in an active district is covered (AREA-4)', async ({ client }) => {
    const response = await client.get('/area/cek').qs(BUAHBATU).accept('json')
    response.assertStatus(200)
    response.assertBody({ isCovered: true, district: { name: 'Buahbatu', city: 'Kota Bandung' } })
  })

  test('a point in an inactive district is not covered and names it (AREA-4)', async ({
    client,
  }) => {
    const response = await client.get('/area/cek').qs(CILENGKRANG).accept('json')
    response.assertStatus(200)
    response.assertBody({
      isCovered: false,
      district: { name: 'Cilengkrang', city: 'Kabupaten Bandung' },
    })
  })

  test('a point outside every district is not covered (AREA-4)', async ({ client }) => {
    const response = await client.get('/area/cek').qs(JAKARTA).accept('json')
    response.assertStatus(200)
    response.assertBody({ isCovered: false, district: null })
  })

  test('missing or invalid coordinates are refused with 422', async ({ client, assert }) => {
    const missing = await client.get('/area/cek').accept('json')
    missing.assertStatus(422)

    const invalid = await client.get('/area/cek').qs({ lat: 'abc', lng: 200 }).accept('json')
    invalid.assertStatus(422)
    assert.sameMembers(
      invalid.body().errors.map((error: { field: string }) => error.field),
      ['lat', 'lng']
    )
  })

  test('the 61st check within a minute from one IP is refused with the wait time (D80)', async ({
    client,
    assert,
  }) => {
    for (let request = 1; request <= 60; request++) {
      const response = await client.get('/area/cek').qs(BUAHBATU).accept('json')
      response.assertStatus(200)
    }

    const refused = await client.get('/area/cek').qs(BUAHBATU).accept('json')
    refused.assertStatus(429)
    assert.match(
      refused.body().errors[0].message,
      /^Terlalu banyak pengecekan\. Coba lagi dalam \d+ detik\.$/
    )
  })

  test('every role may check a point: the check is public (GUEST-1)', async ({ client }) => {
    for (const role of [Role.CUSTOMER, Role.STAFF, Role.ADMIN]) {
      const user = await User.query().where('role', role).firstOrFail()
      const response = await client.get('/area/cek').qs(BUAHBATU).accept('json').loginAs(user)
      response.assertStatus(200)
      response.assertBodyContains({ isCovered: true })
    }
  })
})

test.group('District shapes for maps (OWN-9, GUEST-1, D95)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('the owner area page gets 64 shapes and no tiles file in tests (OWN-9, MAP-2)', async ({
    client,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const response = await client.get('/admin/pengaturan/area').withInertia().loginAs(owner)
    response.assertStatus(200)
    assert.lengthOf(response.inertiaProps.shapes, 64)
    assert.equal(response.inertiaProps.shapes[0].shape.type, 'MultiPolygon')
    assert.isNull(response.inertiaProps.tilesUrl)
  })

  test('the landing sends the shapes only when its coverage map asks for them (NFR-3)', async ({
    client,
    assert,
  }) => {
    const firstVisit = await client.get('/').withInertia()
    firstVisit.assertStatus(200)
    assert.notProperty(firstVisit.inertiaProps, 'areaShapes')

    const partial = await client.get('/').withInertiaPartialReload('home', ['areaShapes'])
    partial.assertStatus(200)
    assert.lengthOf(partial.inertiaProps.areaShapes, 64)
  })
})
