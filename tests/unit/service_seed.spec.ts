import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Service from '#models/service'
import { ItemKind } from '#enums/item_kind_enum'
import { ServiceType } from '#enums/service_type_enum'
import { SEEDED_SERVICES } from '#database/seeders/service_seeder'

/**
 * Expected initial catalog derived strictly from docs/PRD/shared.md §1 (SVC-5).
 * The table in shared.md §1 specifies 18 rows, with bag rows explicitly noted
 * as two services each (kanvas and kulit), yielding exactly 22 services.
 */
interface PrdServiceRow {
  name: string
  type: ServiceType
  itemKinds: ItemKind[]
  price: number
  estimatedDays: number
  isStartingFrom: boolean
}

const PRD_SHARED_SERVICES: readonly PrdServiceRow[] = [
  {
    name: 'Mild',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 60_000,
    estimatedDays: 3,
    isStartingFrom: false,
  },
  {
    name: 'Medium',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 65_000,
    estimatedDays: 3,
    isStartingFrom: false,
  },
  {
    name: 'Hard',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 70_000,
    estimatedDays: 4,
    isStartingFrom: false,
  },
  {
    name: 'Premium for Suede',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 120_000,
    estimatedDays: 5,
    isStartingFrom: true,
  },
  {
    name: 'Kids Shoes',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 40_000,
    estimatedDays: 3,
    isStartingFrom: true,
  },
  {
    name: 'Just for Her',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 45_000,
    estimatedDays: 3,
    isStartingFrom: false,
  },
  {
    name: 'Premium Repaint',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 150_000,
    estimatedDays: 7,
    isStartingFrom: true,
  },
  {
    name: 'Midsole Repaint / Recolour',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.SHOE],
    price: 180_000,
    estimatedDays: 7,
    isStartingFrom: false,
  },
  {
    name: 'Unyellowing',
    type: ServiceType.ADDON,
    itemKinds: [ItemKind.SHOE],
    price: 30_000,
    estimatedDays: 2,
    isStartingFrom: true,
  },
  {
    name: 'Sepatu putih / mummy',
    type: ServiceType.ADDON,
    itemKinds: [ItemKind.SHOE],
    price: 10_000,
    estimatedDays: 0,
    isStartingFrom: false,
  },
  {
    name: 'Nubuck / suede',
    type: ServiceType.ADDON,
    itemKinds: [ItemKind.SHOE],
    price: 10_000,
    estimatedDays: 0,
    isStartingFrom: false,
  },
  {
    name: 'One Day Service',
    type: ServiceType.ADDON,
    itemKinds: [ItemKind.SHOE],
    price: 10_000,
    estimatedDays: 0,
    isStartingFrom: false,
  },
  {
    name: 'Tas Small · kanvas',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 40_000,
    estimatedDays: 3,
    isStartingFrom: false,
  },
  {
    name: 'Tas Small · kulit',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 60_000,
    estimatedDays: 4,
    isStartingFrom: false,
  },
  {
    name: 'Tas Medium · kanvas',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 55_000,
    estimatedDays: 3,
    isStartingFrom: false,
  },
  {
    name: 'Tas Medium · kulit',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 75_000,
    estimatedDays: 4,
    isStartingFrom: false,
  },
  {
    name: 'Tas Large · kanvas',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 70_000,
    estimatedDays: 4,
    isStartingFrom: false,
  },
  {
    name: 'Tas Large · kulit',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 85_000,
    estimatedDays: 5,
    isStartingFrom: false,
  },
  {
    name: 'Tas X-Large · kanvas',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 85_000,
    estimatedDays: 5,
    isStartingFrom: false,
  },
  {
    name: 'Tas X-Large · kulit',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.BAG],
    price: 100_000,
    estimatedDays: 5,
    isStartingFrom: false,
  },
  {
    name: 'Helmet Spa Reguler',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.HELMET],
    price: 35_000,
    estimatedDays: 2,
    isStartingFrom: false,
  },
  {
    name: 'Helmet Spa Premium',
    type: ServiceType.MAIN,
    itemKinds: [ItemKind.HELMET],
    price: 70_000,
    estimatedDays: 3,
    isStartingFrom: false,
  },
]

test.group('Service Seed (SVC-1..5, shared.md §1)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('seeder definition matches PRD table row-by-row in exact order (SVC-5)', ({ assert }) => {
    assert.equal(SEEDED_SERVICES.length, PRD_SHARED_SERVICES.length)

    for (const [index, expected] of PRD_SHARED_SERVICES.entries()) {
      const actual = SEEDED_SERVICES[index]

      assert.equal(actual.name, expected.name, `Row ${index} name mismatch`)
      assert.equal(actual.type, expected.type, `Row ${index} (${expected.name}) type mismatch`)
      assert.deepEqual(
        actual.itemKinds,
        expected.itemKinds,
        `Row ${index} (${expected.name}) itemKinds mismatch`
      )
      assert.equal(actual.price, expected.price, `Row ${index} (${expected.name}) price mismatch`)
      assert.equal(
        actual.estimatedDays,
        expected.estimatedDays,
        `Row ${index} (${expected.name}) estimatedDays mismatch`
      )
      assert.equal(
        actual.isStartingFrom,
        expected.isStartingFrom,
        `Row ${index} (${expected.name}) isStartingFrom mismatch`
      )
    }
  })

  test('seeded database records match PRD table row-by-row in exact display order (SVC-5)', async ({
    assert,
  }) => {
    const services = await Service.query().withScopes((scopes) => {
      scopes.available()
      scopes.ordered()
    })

    assert.equal(services.length, PRD_SHARED_SERVICES.length)

    for (const [index, expected] of PRD_SHARED_SERVICES.entries()) {
      const actual = services[index]

      assert.equal(actual.displayOrder, index, `Service "${actual.name}" display order mismatch`)
      assert.equal(actual.name, expected.name, `Index ${index} name mismatch`)
      assert.equal(actual.type, expected.type, `Service "${expected.name}" type mismatch`)
      assert.deepEqual(
        actual.itemKinds,
        expected.itemKinds,
        `Service "${expected.name}" itemKinds mismatch`
      )
      assert.equal(actual.price, expected.price, `Service "${expected.name}" price mismatch`)
      assert.equal(
        actual.estimatedDays,
        expected.estimatedDays,
        `Service "${expected.name}" estimatedDays mismatch`
      )
      assert.equal(
        actual.isStartingFrom,
        expected.isStartingFrom,
        `Service "${expected.name}" starting from flag mismatch`
      )
      assert.isTrue(actual.isActive, `Service "${expected.name}" must be initially active`)
      assert.isNull(actual.deletedAt, `Service "${expected.name}" must not be soft-deleted`)
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
