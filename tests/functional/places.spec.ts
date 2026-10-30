import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { UserFactory } from '#database/factories/user_factory'
import type { Point } from '#models/service_area'
import { useApp } from '#tests/support/app'
import { OSM_POINTS } from '#tests/support/osm'

type Suggestion = { id: string; title: string; detail: string; value: string; point: Point }

function query(params: Record<string, string | number>) {
  return new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)]))
}

test.group('Places', (group) => {
  useApp(group)

  test('guests cannot search or look up a point', async ({ client }) => {
    const search = await client
      .get(`/lokasi?${query({ q: 'dipati', ...OSM_POINTS.dipatiukur })}`)
      .header('accept', 'application/json')
    search.assertStatus(401)
    const reverse = await client
      .get(`/lokasi/titik?${query(OSM_POINTS.dipatiukur)}`)
      .header('accept', 'application/json')
    reverse.assertStatus(401)
  })

  test('word prefixes rank first and carry kelurahan, kecamatan and city', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    const response = await client
      .get(`/lokasi?${query({ q: 'dipatiu', ...OSM_POINTS.dipatiukur })}`)
      .loginAs(user)

    response.assertStatus(200)
    const [road, cafe] = response.body() as Suggestion[]
    assert.equal(road.title, 'Jalan Dipatiukur')
    assert.equal(road.detail, 'Lebakgede, Kec. Sukamaju, Kota Contoh')
    assert.equal(road.value, 'Jalan Dipatiukur, Lebakgede, Sukamaju, Kota Contoh')
    assert.closeTo(road.point.lat, OSM_POINTS.dipatiukur.lat, 0.001)
    assert.equal(cafe.title, 'Kopi Dipatiukur')
    assert.equal(cafe.detail, 'Jalan Dipatiukur, Lebakgede, Kec. Sukamaju, Kota Contoh')
  })

  test('typos, street prefixes, house numbers and RT/RW still find the street', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    for (const q of ['dipatiukr', 'dipati ukur', 'Jl. Dipatiukur No. 35, RT 02/RW 05, Lebakgede']) {
      const response = await client
        .get(`/lokasi?${query({ q, ...OSM_POINTS.dipatiukur })}`)
        .loginAs(user)
      assert.equal((response.body() as Suggestion[])[0]?.title, 'Jalan Dipatiukur', q)
    }
  })

  test('results stay inside Bandung Raya', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const response = await client
      .get(`/lokasi?${query({ q: 'dipati', ...OSM_POINTS.dipatiukur })}`)
      .loginAs(user)

    const titles = (response.body() as Suggestion[]).map((place) => place.title)
    assert.includeMembers(titles, ['Jalan Dipatiukur', 'Jalan Dipati Raya'])
    assert.notInclude(titles, 'Jalan Dipatiluar')
  })

  test('equal matches are ordered by distance to the user', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const near = await client
      .get(`/lokasi?${query({ q: 'merdeka', ...OSM_POINTS.merdekaNear })}`)
      .loginAs(user)
    const far = await client
      .get(`/lokasi?${query({ q: 'merdeka', lat: -6.861, lng: 107.651 })}`)
      .loginAs(user)

    const [nearFirst] = near.body() as Suggestion[]
    const [farFirst] = far.body() as Suggestion[]
    assert.equal(nearFirst.title, 'Jalan Merdeka')
    assert.closeTo(nearFirst.point.lat, -6.921, 0.002)
    assert.equal(farFirst.title, 'Jalan Merdeka')
    assert.closeTo(farFirst.point.lat, -6.861, 0.002)
  })

  test('without text it lists named places nearby, nearest first', async ({ client, assert }) => {
    const staff = await UserFactory.apply('staff').create()
    const response = await client.get(`/lokasi?${query(OSM_POINTS.merdekaNear)}`).loginAs(staff)

    response.assertStatus(200)
    assert.deepEqual(
      (response.body() as Suggestion[]).map((place) => place.title),
      ['Jalan Merdeka', 'Taman Merdeka']
    )
  })

  test('a point gets its road, kelurahan, postcode and the BPS kecamatan', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.get(`/lokasi/titik?${query(OSM_POINTS.dipatiukur)}`).loginAs(user)

    response.assertBody({
      address: {
        road: 'Jalan Dipatiukur',
        kelurahan: 'Lebakgede',
        kecamatan: 'Sukamaju',
        city: 'Kota Contoh',
        postcode: '40132',
      },
    })
  })

  test('outside every service area the OSM kecamatan and city are used', async ({ client }) => {
    const owner = await UserFactory.apply('admin').create()
    const inside = await client
      .get(`/lokasi/titik?${query(OSM_POINTS.outsideAreas)}`)
      .loginAs(owner)
    inside.assertBody({
      address: {
        road: 'Jalan Sukaluar',
        kelurahan: 'Desa Luar',
        kecamatan: 'Cibiru Fiksi',
        city: 'Kota Fiksi',
        postcode: '40619',
      },
    })

    const empty = await client.get(`/lokasi/titik?${query(OSM_POINTS.empty)}`).loginAs(owner)
    empty.assertBody({ address: null })
  })

  test('without the osm schema the endpoints answer empty', async ({ client }) => {
    const user = await UserFactory.create()
    await db.rawQuery('ALTER SCHEMA osm RENAME TO osm_hidden')
    try {
      const search = await client
        .get(`/lokasi?${query({ q: 'dipatiukur', ...OSM_POINTS.dipatiukur })}`)
        .loginAs(user)
      search.assertStatus(200)
      search.assertBody([])
      const reverse = await client
        .get(`/lokasi/titik?${query(OSM_POINTS.dipatiukur)}`)
        .loginAs(user)
      reverse.assertBody({ address: null })
    } finally {
      await db.rawQuery('ALTER SCHEMA osm_hidden RENAME TO osm')
    }
  })

  test('each user gets 240 lookups a minute', async ({ client }) => {
    const [user, other] = await UserFactory.createMany(2)
    const url = `/lokasi/titik?${query(OSM_POINTS.dipatiukur)}`
    for (let count = 0; count < 240; count++) {
      const response = await client.get(url).loginAs(user)
      response.assertStatus(200)
    }

    const blocked = await client.get(url).header('accept', 'application/json').loginAs(user)
    blocked.assertStatus(429)
    const fresh = await client.get(url).loginAs(other)
    fresh.assertStatus(200)
  })

  test('rejects an overlong query or a missing point', async ({ client }) => {
    const user = await UserFactory.create()
    const long = await client
      .get(`/lokasi?${query({ q: 'a'.repeat(301), ...OSM_POINTS.dipatiukur })}`)
      .header('accept', 'application/json')
      .loginAs(user)
    long.assertStatus(422)
    const missing = await client
      .get('/lokasi?q=dipati')
      .header('accept', 'application/json')
      .loginAs(user)
    missing.assertStatus(422)
  })
})
