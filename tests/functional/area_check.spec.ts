import { test } from '@japa/runner'
import type { ApiClient } from '@japa/api-client'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/user'
import { Role } from '#enums/role_enum'

async function check(client: ApiClient, q: string) {
  return client.get('/area/cek').qs({ q }).accept('json')
}

test.group('Coverage check by kecamatan name GET /area/cek (GUEST-1, D80, D100)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    await limiter.clear(['memory'])
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('an active kecamatan is served, whatever its case or a "Kec." prefix (GUEST-1)', async ({
    client,
  }) => {
    for (const q of ['Coblong', 'coblong', 'Kec. Coblong', 'kecamatan coblong']) {
      const response = await check(client, q)
      response.assertStatus(200)
      response.assertBody({ area: { name: 'Coblong', city: 'Kota Bandung', isCovered: true } })
    }
  })

  test('small typos and spaces are forgiven (GUEST-1)', async ({ client }) => {
    const typo = await check(client, 'coblog')
    typo.assertBodyContains({ area: { name: 'Coblong' } })

    const spaced = await check(client, 'bojong soang')
    spaced.assertBody({
      area: { name: 'Bojongsoang', city: 'Kabupaten Bandung', isCovered: true },
    })
  })

  test('an inactive kecamatan is named as not yet served (GUEST-1)', async ({ client }) => {
    const response = await check(client, 'Cileunyi')
    response.assertBody({
      area: { name: 'Cileunyi', city: 'Kabupaten Bandung', isCovered: false },
    })
  })

  test('a name too far from every kecamatan finds nothing instead of guessing', async ({
    client,
  }) => {
    for (const q of ['Jakarta', 'Bandung']) {
      const response = await check(client, q)
      response.assertStatus(200)
      response.assertBody({ area: null })
    }
  })

  test('a missing or too short name is refused with 422', async ({ client }) => {
    const missing = await client.get('/area/cek').accept('json')
    missing.assertStatus(422)

    const short = await check(client, 'ab')
    short.assertStatus(422)
  })

  test('the 61st check within a minute from one IP is refused with the wait time (D80)', async ({
    client,
    assert,
  }) => {
    for (let request = 1; request <= 60; request++) {
      const response = await check(client, 'Coblong')
      response.assertStatus(200)
    }

    const refused = await check(client, 'Coblong')
    refused.assertStatus(429)
    assert.match(
      refused.body().errors[0].message,
      /^Terlalu banyak pengecekan\. Coba lagi dalam \d+ detik\.$/
    )
  })

  test('every role may check a name: the check is public (GUEST-1)', async ({ client }) => {
    for (const role of [Role.CUSTOMER, Role.STAFF, Role.ADMIN]) {
      const user = await User.query().where('role', role).firstOrFail()
      const response = await client
        .get('/area/cek')
        .qs({ q: 'Coblong' })
        .accept('json')
        .loginAs(user)
      response.assertStatus(200)
    }
  })
})

test.group('District shapes for the owner map (OWN-9, D95)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('the owner area page gets 64 shapes, no tiles file and no warning in tests (OWN-9, MAP-2)', async ({
    client,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const response = await client.get('/admin/pengaturan/area').withInertia().loginAs(owner)
    response.assertStatus(200)
    assert.lengthOf(response.inertiaProps.shapes, 64)
    assert.equal(response.inertiaProps.shapes[0].shape.type, 'MultiPolygon')
    assert.isNull(response.inertiaProps.tilesUrl)
    assert.isNull(response.inertiaProps.devWarning)
  })

  test('the landing no longer loads district shapes', async ({ client, assert }) => {
    const landing = await client.get('/').withInertia()
    assert.notProperty(landing.inertiaProps, 'areaShapes')
  })
})
