import { test } from '@japa/runner'
import { readFile } from 'node:fs/promises'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'
import ServiceArea from '#models/service_area'
import AreaService from '#services/area_service'
import User from '#models/user'
import { Role } from '#enums/role_enum'

const EXPECTED_KAB_BANDUNG_ACTIVE = [
  'Margaasih',
  'Margahayu',
  'Dayeuhkolot',
  'Bojongsoang',
  'Baleendah',
  'Katapang',
  'Soreang',
  'Pameungpeuk',
  'Banjaran',
  'Cangkuang',
]

// A vertex the two districts share and no third district touches, so it lies exactly on
// their common border (a literal coordinate is only as exact as its decimals).
async function sharedBorderVertex(firstName: string, secondName: string) {
  const { rows } = await db.rawQuery(
    `SELECT ST_Y(vertex.geom) AS lat, ST_X(vertex.geom) AS lng
     FROM service_areas first_area
     JOIN service_areas second_area ON second_area.name = ?
     CROSS JOIN LATERAL ST_DumpPoints(first_area.boundary) AS vertex
     WHERE first_area.name = ?
       AND ST_Intersects(vertex.geom, second_area.boundary)
       AND NOT EXISTS (
         SELECT 1 FROM service_areas other_area
         WHERE other_area.id NOT IN (first_area.id, second_area.id)
           AND ST_Intersects(vertex.geom, other_area.boundary)
       )
     ORDER BY vertex.path
     LIMIT 1`,
    [secondName, firstName]
  )
  return rows[0] as { lat: number; lng: number }
}

test.group('Service Areas & Point-in-Polygon Check (AREA-1..4)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('seeds exactly 64 districts across the 3 designated regions (AREA-1)', async ({
    assert,
  }) => {
    const areas = await ServiceArea.all()
    assert.equal(areas.length, 64)

    const bandung = areas.filter((a) => a.city === 'Kota Bandung')
    const cimahi = areas.filter((a) => a.city === 'Kota Cimahi')
    const kabBandung = areas.filter((a) => a.city === 'Kabupaten Bandung')

    assert.equal(bandung.length, 30, 'Kota Bandung must have exactly 30 districts')
    assert.equal(cimahi.length, 3, 'Kota Cimahi must have exactly 3 districts')
    assert.equal(kabBandung.length, 31, 'Kabupaten Bandung must have exactly 31 districts')
  })

  test('initial active set matches AREA-2 rules exactly', async ({ assert }) => {
    const bandung = await ServiceArea.query().where('city', 'Kota Bandung')
    assert.isTrue(
      bandung.every((a) => a.isActive),
      'All Kota Bandung districts must be active'
    )

    const cimahi = await ServiceArea.query().where('city', 'Kota Cimahi')
    assert.isTrue(
      cimahi.every((a) => a.isActive),
      'All Kota Cimahi districts must be active'
    )

    const kabBandung = await ServiceArea.query().where('city', 'Kabupaten Bandung')
    const activeKab = kabBandung.filter((a) => a.isActive).map((a) => a.name)
    const inactiveKab = kabBandung.filter((a) => !a.isActive).map((a) => a.name)

    assert.equal(activeKab.length, 10, 'Kabupaten Bandung must have exactly 10 active districts')
    assert.deepEqual(
      activeKab.sort((a, b) => a.localeCompare(b)),
      [...EXPECTED_KAB_BANDUNG_ACTIVE].sort((a, b) => a.localeCompare(b)),
      'Active districts in Kabupaten Bandung must match AREA-2'
    )

    assert.isTrue(inactiveKab.includes('Cilengkrang'), 'Cilengkrang must start inactive per AREA-2')
    assert.equal(inactiveKab.length, 21, 'Kabupaten Bandung must have 21 inactive districts')

    const totalActive = await ServiceArea.query().where('is_active', true)
    assert.equal(totalActive.length, 43, 'Total active districts must be 30 + 3 + 10 = 43')
  })

  test('point-in-polygon service evaluates active, inactive, outside, and boundary coordinates (AREA-4)', async ({
    assert,
  }) => {
    const service = new AreaService()

    // 1. Point inside an active district (Buahbatu, Kota Bandung)
    const insideActive = await service.checkCoverage(-6.955631, 107.6539748)
    assert.isTrue(insideActive.isCovered)
    assert.isNotNull(insideActive.district)
    assert.equal(insideActive.district?.name, 'Buahbatu')
    assert.equal(insideActive.district?.city, 'Kota Bandung')

    // 2. Point inside an inactive district (Cilengkrang, Kabupaten Bandung)
    const insideInactive = await service.checkCoverage(-6.873436, 107.719384)
    assert.isFalse(insideInactive.isCovered)
    assert.isNotNull(insideInactive.district)
    assert.equal(insideInactive.district?.name, 'Cilengkrang')
    assert.isFalse(insideInactive.district?.isActive)

    // 3. Point completely outside covered regions (Jakarta)
    const outside = await service.checkCoverage(-6.175392, 106.827153)
    assert.isFalse(outside.isCovered)
    assert.isNull(outside.district)

    // 4. Point on polygon boundary (shared edge between Buahbatu and Rancasari districts)
    const border = await sharedBorderVertex('Buahbatu', 'Rancasari')
    const onBoundary = await service.checkCoverage(border.lat, border.lng)
    assert.isTrue(onBoundary.isCovered)
    assert.isNotNull(onBoundary.district)
    assert.include(['Buahbatu', 'Rancasari'], onBoundary.district!.name)
  })

  test('toggling a district changes subsequent coverage check immediately and logs activity (AREA-3, OWN-9)', async ({
    assert,
  }) => {
    const service = new AreaService()
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()

    const buahbatu = await ServiceArea.findByOrFail('name', 'Buahbatu')
    assert.isTrue(buahbatu.isActive)

    // Owner deactivates Buahbatu
    const updated = await service.toggleArea(buahbatu.id, owner, false)
    assert.isFalse(updated.isActive)

    // Point in Buahbatu is now not covered
    const checkAfterToggle = await service.checkCoverage(-6.955631, 107.6539748)
    assert.isFalse(checkAfterToggle.isCovered)
    assert.equal(checkAfterToggle.district?.name, 'Buahbatu')
    assert.isFalse(checkAfterToggle.district?.isActive)

    // Reactivate Buahbatu
    await service.toggleArea(buahbatu.id, owner, true)
    const checkReactivated = await service.checkCoverage(-6.955631, 107.6539748)
    assert.isTrue(checkReactivated.isCovered)
  })

  test('a point exactly on the border of an active and an inactive district counts as covered (AREA-4)', async ({
    assert,
  }) => {
    const { lat, lng } = await sharedBorderVertex('Cibiru', 'Cileunyi')

    const matches = await ServiceArea.query()
      .whereRaw('ST_Intersects(boundary, ST_SetSRID(ST_MakePoint(?, ?), 4326))', [lng, lat])
      .orderBy('name', 'asc')
    assert.deepEqual(
      matches.map((area) => [area.name, area.isActive]),
      [
        ['Cibiru', true],
        ['Cileunyi', false],
      ]
    )

    const result = await new AreaService().checkCoverage(lat, lng)
    assert.isTrue(result.isCovered)
    assert.equal(result.district?.name, 'Cibiru')
  })

  test('the committed OSM clip polygon covers every service area, a smaller one does not (D88)', async ({
    assert,
  }) => {
    const clip = JSON.parse(await readFile('maps/clip_polygon.geojson', 'utf8'))
    assert.deepEqual(
      await ServiceArea.findNamesOutside(JSON.stringify(clip.features[0].geometry)),
      []
    )

    const centralBandung = {
      type: 'Polygon',
      coordinates: [
        [
          [107.55, -6.95],
          [107.65, -6.95],
          [107.65, -6.88],
          [107.55, -6.88],
          [107.55, -6.95],
        ],
      ],
    }
    const outside = await ServiceArea.findNamesOutside(JSON.stringify(centralBandung))
    assert.isNotEmpty(outside)
    assert.include(outside, 'Ciwidey')
  })

  test('display shapes keep the 64 districts gap-free and within 150 m of the real borders (D95)', async ({
    assert,
  }) => {
    const shapes = await new AreaService().getAreaShapes()
    assert.lengthOf(shapes, 64)

    const { rows } = await db.rawQuery(
      `WITH display AS (
         SELECT (feature ->> 'id')::int AS id, ST_SetSRID(ST_GeomFromGeoJSON(feature ->> 'shape'), 4326) AS shape
         FROM jsonb_array_elements(?::jsonb) AS feature
       )
       SELECT
         count(*) FILTER (WHERE NOT ST_IsValid(display.shape))::int AS invalid_shapes,
         max(ST_HausdorffDistance(ST_Transform(area.boundary, 32748), ST_Transform(display.shape, 32748))) AS max_metres,
         (SELECT count(*)::int FROM (SELECT ST_CoverageInvalidEdges(shape) OVER () AS edges FROM display) checked
          WHERE edges IS NOT NULL) AS invalid_edges
       FROM display
       JOIN service_areas area ON area.id = display.id`,
      [JSON.stringify(shapes.map((area) => ({ id: area.id, shape: area.$extras.shape })))]
    )
    assert.equal(rows[0].invalid_shapes, 0)
    assert.equal(rows[0].invalid_edges, 0)
    assert.isAtMost(rows[0].max_metres, 150)
  })
})
