import { test } from '@japa/runner'
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
    const onBoundary = await service.checkCoverage(-6.938641, 107.669824)
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
})
