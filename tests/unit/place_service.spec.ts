import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import PlaceService from '#services/place_service'
import { DIPATIUKUR, loadOsmFixture } from '../helpers/osm.js'

const FAR_AWAY = { lat: -6.2, lng: 106.8 }

async function namesFound(text: string) {
  const places = await new PlaceService().searchPlaces(text, DIPATIUKUR)
  return (places ?? []).map((place) => place.name)
}

test.group('PlaceService with OSM data (MAP-1)', (group) => {
  group.each.setup(async () => {
    const rollback = await testUtils.db().wrapInGlobalTransaction()
    await loadOsmFixture()
    return rollback
  })

  test('search tolerates spaces, typos and generic words', async ({ assert }) => {
    for (const typed of ['dipati ukur', 'Jl. Dipatiukr', 'dipatiukur']) {
      const [first] = await namesFound(typed)
      assert.equal(first, 'Jalan Dipatiukur', typed)
    }
    assert.deepEqual(await namesFound('gang sukaluyu'), ['Gang Sukaluyu'])
    assert.include(await namesFound('dipatiukur'), 'Hotel NEO Dipatiukur')
  })

  test('a result carries its point and the kelurahan and kecamatan around it', async ({
    assert,
  }) => {
    const [road] = (await new PlaceService().searchPlaces('dipatiukur', DIPATIUKUR)) ?? []
    assert.match(road.id, /^road-\d+$/)
    assert.equal(road.detail, 'Lebakgede, Kec. Coblong')
    assert.closeTo(road.lat, DIPATIUKUR.lat, 0.001)
    assert.closeTo(road.lng, DIPATIUKUR.lng, 0.001)
  })

  test('nothing matches a name that is not there', async ({ assert }) => {
    assert.deepEqual(await namesFound('braga'), [])
  })

  test('nearby places are ordered by distance from the pin', async ({ assert }) => {
    const places = (await new PlaceService().findNearbyPlaces(DIPATIUKUR)) ?? []
    assert.equal(places[0].name, 'Jalan Dipatiukur')
    assert.notInclude(
      places.map((place) => place.name),
      'Gang Sukaluyu'
    )
  })

  test('the label under a pin names the street and the kelurahan', async ({ assert }) => {
    const service = new PlaceService()
    assert.deepEqual(await service.describePoint(DIPATIUKUR), {
      street: 'Jalan Dipatiukur',
      kelurahan: 'Lebakgede',
    })
    assert.deepEqual(await service.describePoint(FAR_AWAY), { street: null, kelurahan: null })
  })
})

test.group('PlaceService without OSM data (MAP-1, NFR-4)', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('every method answers null, so the pin is placed by hand', async ({ assert }) => {
    const service = new PlaceService()
    assert.isFalse(await service.isAvailable())
    assert.isNull(await service.searchPlaces('dipatiukur', DIPATIUKUR))
    assert.isNull(await service.findNearbyPlaces(DIPATIUKUR))
    assert.isNull(await service.describePoint(DIPATIUKUR))
  })
})
