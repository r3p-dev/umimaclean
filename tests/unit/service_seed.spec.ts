import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Service from '#models/service'
import { ItemKind } from '#enums/item_kind_enum'
import { ServiceType } from '#enums/service_type_enum'
import { SEEDED_SERVICES } from '#database/seeders/service_seeder'

test.group('Service Seed (SVC-1..5, shared.md §1)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('seeded catalog contains exactly 22 services matching PRD table (SVC-5)', async ({
    assert,
  }) => {
    const services = await Service.query().withScopes((scopes) => {
      scopes.available()
      scopes.ordered()
    })

    assert.equal(services.length, 22)
    assert.equal(SEEDED_SERVICES.length, 22)

    for (const expected of SEEDED_SERVICES) {
      const found = services.find((s) => s.name === expected.name)
      assert.isDefined(found, `Service "${expected.name}" must exist in the database`)
      assert.equal(found!.type, expected.type, `Service "${expected.name}" type mismatch`)
      assert.equal(found!.price, expected.price, `Service "${expected.name}" price mismatch`)
      assert.equal(
        found!.estimatedDays,
        expected.estimatedDays,
        `Service "${expected.name}" estimated days mismatch`
      )
      assert.equal(
        found!.isStartingFrom,
        expected.isStartingFrom,
        `Service "${expected.name}" starting from flag mismatch`
      )
      assert.deepEqual(
        found!.itemKinds,
        expected.itemKinds,
        `Service "${expected.name}" item kinds mismatch`
      )
      assert.isTrue(found!.isActive, `Service "${expected.name}" must be initially active`)
      assert.isNull(found!.deletedAt, `Service "${expected.name}" must not be soft-deleted`)
    }
  })

  test('bag rows are seeded as two separate services each for kanvas and kulit', async ({
    assert,
  }) => {
    const allServices = await Service.query().withScopes((scopes) => scopes.available())
    const bagServices = allServices.filter((s) => s.itemKinds.includes(ItemKind.BAG))

    assert.equal(bagServices.length, 8) // 4 sizes × 2 materials (kanvas & kulit)
    const sizes = ['Small', 'Medium', 'Large', 'X-Large']

    for (const size of sizes) {
      const kanvas = bagServices.find((s) => s.name === `Tas ${size} · kanvas`)
      const kulit = bagServices.find((s) => s.name === `Tas ${size} · kulit`)

      assert.isDefined(kanvas, `Tas ${size} · kanvas must exist`)
      assert.isDefined(kulit, `Tas ${size} · kulit must exist`)
      assert.isTrue(kulit!.price > kanvas!.price, 'Kulit price must be higher than kanvas')
    }
  })

  test('helmet services are restricted to helmet item kind only (SVC-4)', async ({ assert }) => {
    const allServices = await Service.query().withScopes((scopes) => scopes.available())
    const helmetServices = allServices.filter((s) => s.itemKinds.includes(ItemKind.HELMET))

    assert.equal(helmetServices.length, 2)
    const names = helmetServices.map((s) => s.name)
    assert.deepEqual(names, ['Helmet Spa Reguler', 'Helmet Spa Premium'])

    for (const service of helmetServices) {
      assert.deepEqual(
        service.itemKinds,
        [ItemKind.HELMET],
        'Helmet service must apply only to helmets'
      )
      assert.equal(service.type, ServiceType.MAIN)
      assert.match(
        service.description,
        /Khusus bawa langsung ke toko/i,
        'Helmet service description must note shop-only restriction (SVC-4)'
      )
    }
  })

  test('main and addon service types are strictly separated', async ({ assert }) => {
    const mainServices = await Service.query().where('type', ServiceType.MAIN)
    const addonServices = await Service.query().where('type', ServiceType.ADDON)

    assert.equal(mainServices.length, 18)
    assert.equal(addonServices.length, 4)

    const addonNames = addonServices.map((s) => s.name)
    assert.includeMembers(addonNames, [
      'Unyellowing',
      'Sepatu putih / mummy',
      'Nubuck / suede',
      'One Day Service',
    ])
  })
})
