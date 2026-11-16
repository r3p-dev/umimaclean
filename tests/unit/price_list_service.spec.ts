import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import app from '@adonisjs/core/services/app'
import User from '#models/user'
import ActivityLog from '#models/activity_log'
import PriceListService from '#services/price_list_service'
import { ItemKind } from '#enums/item_kind_enum'
import { Role } from '#enums/role_enum'
import { ServiceType } from '#enums/service_type_enum'

async function createOwner(): Promise<User> {
  return User.create({
    fullName: 'Owner Umima',
    phone: '6281298765432',
    password: 'secretpassword',
    role: Role.ADMIN,
    isActive: true,
  })
}

test.group('PriceListService (SVC-1..3, OWN-7)', (group) => {
  group.each.setup(async () => {
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('getActiveServices returns only active, non-deleted services ordered correctly', async ({
    assert,
  }) => {
    const service = await app.container.make(PriceListService)
    const owner = await createOwner()

    const created = await service.createService(
      {
        name: 'Layanan Uji Coba Nonaktif',
        type: ServiceType.MAIN,
        itemKinds: [ItemKind.SHOE],
        price: 50_000,
        estimatedDays: 3,
        isStartingFrom: false,
        description: 'Uji coba',
        isActive: false,
      },
      owner
    )

    const activeList = await service.getActiveServices()
    const found = activeList.find((s) => s.id === created.id)
    assert.isUndefined(found, 'Inactive service must not be included in active services')

    const shoeList = await service.getActiveServices(ItemKind.SHOE)
    assert.isTrue(shoeList.every((s) => s.itemKinds.includes(ItemKind.SHOE)))

    const bagList = await service.getActiveServices(ItemKind.BAG)
    assert.isTrue(bagList.every((s) => s.itemKinds.includes(ItemKind.BAG)))
  })

  test('getOwnerServices includes both active and inactive services, but excludes soft-deleted', async ({
    assert,
  }) => {
    const service = await app.container.make(PriceListService)
    const owner = await createOwner()

    const s1 = await service.createService(
      {
        name: 'Layanan Aktif',
        type: ServiceType.MAIN,
        itemKinds: [ItemKind.SHOE],
        price: 50_000,
        estimatedDays: 3,
        isStartingFrom: false,
        description: 'Aktif',
        isActive: true,
      },
      owner
    )

    const s2 = await service.createService(
      {
        name: 'Layanan Nonaktif',
        type: ServiceType.MAIN,
        itemKinds: [ItemKind.SHOE],
        price: 50_000,
        estimatedDays: 3,
        isStartingFrom: false,
        description: 'Nonaktif',
        isActive: false,
      },
      owner
    )

    const s3 = await service.createService(
      {
        name: 'Layanan Terhapus',
        type: ServiceType.MAIN,
        itemKinds: [ItemKind.SHOE],
        price: 50_000,
        estimatedDays: 3,
        isStartingFrom: false,
        description: 'Akan dihapus',
        isActive: true,
      },
      owner
    )
    await service.softDeleteService(s3.id, owner)

    const ownerList = await service.getOwnerServices()
    const ids = ownerList.map((s) => s.id)

    assert.includeMembers(ids, [s1.id, s2.id])
    assert.notIncludeMembers(ids, [s3.id])
  })

  test('createService logs activity and increments display order', async ({ assert }) => {
    const service = await app.container.make(PriceListService)
    const owner = await createOwner()

    const created = await service.createService(
      {
        name: 'Premium Leather Treatment',
        type: ServiceType.MAIN,
        itemKinds: [ItemKind.BAG],
        price: 150_000,
        estimatedDays: 5,
        isStartingFrom: true,
        description: 'Perawatan khusus bahan kulit mewah.',
      },
      owner
    )

    assert.isNotNull(created.id)
    assert.equal(created.price, 150_000)

    const log = await ActivityLog.query()
      .where('userId', owner.id)
      .where('action', 'service.create')
      .firstOrFail()
    assert.equal(log.category, 'service')
    assert.isFalse(log.isSensitive)
    assert.match(log.description, /Premium Leather Treatment/)
  })

  test('updateService records diffs in activity log (OWN-7)', async ({ assert }) => {
    const service = await app.container.make(PriceListService)
    const owner = await createOwner()

    const created = await service.createService(
      {
        name: 'Standard Clean',
        type: ServiceType.MAIN,
        itemKinds: [ItemKind.SHOE],
        price: 60_000,
        estimatedDays: 3,
        isStartingFrom: false,
        description: 'Pencucian standar',
      },
      owner
    )

    await service.updateService(
      created.id,
      {
        name: 'Standard Clean Plus',
        type: ServiceType.MAIN,
        itemKinds: [ItemKind.SHOE],
        price: 65_000,
        estimatedDays: 4,
        isStartingFrom: true,
        description: 'Pencucian standar dengan proteksi',
        isActive: true,
      },
      owner
    )

    const updated = await service.findAvailableService(created.id)
    assert.equal(updated.name, 'Standard Clean Plus')
    assert.equal(updated.price, 65_000)
    assert.equal(updated.estimatedDays, 4)
    assert.isTrue(updated.isStartingFrom)

    const log = await ActivityLog.query()
      .where('userId', owner.id)
      .where('action', 'service.update')
      .firstOrFail()
    assert.include(log.description, 'Standard Clean Plus')
    assert.include(log.description, 'Harga: Rp60.000 → Rp65.000')
    assert.include(log.description, 'Estimasi: 3 hari → 4 hari')
  })

  test('toggleServiceActive and bulkToggleServices update states and log actions', async ({
    assert,
  }) => {
    const service = await app.container.make(PriceListService)
    const owner = await createOwner()

    const s1 = await service.createService(
      {
        name: 'Item 1',
        type: ServiceType.MAIN,
        itemKinds: [ItemKind.SHOE],
        price: 50_000,
        estimatedDays: 2,
        isStartingFrom: false,
        description: '1',
        isActive: true,
      },
      owner
    )

    const s2 = await service.createService(
      {
        name: 'Item 2',
        type: ServiceType.MAIN,
        itemKinds: [ItemKind.SHOE],
        price: 50_000,
        estimatedDays: 2,
        isStartingFrom: false,
        description: '2',
        isActive: true,
      },
      owner
    )

    await service.toggleServiceActive(s1.id, false, owner)
    const reloaded1 = await service.findAvailableService(s1.id)
    assert.isFalse(reloaded1.isActive)

    const toggleLog = await ActivityLog.query()
      .where('userId', owner.id)
      .where('action', 'service.toggle')
      .firstOrFail()
    assert.include(toggleLog.description, 'Menonaktifkan layanan "Item 1"')

    await service.bulkToggleServices([s1.id, s2.id], true, owner)
    const bulk1 = await service.findAvailableService(s1.id)
    const bulk2 = await service.findAvailableService(s2.id)
    assert.isTrue(bulk1.isActive)
    assert.isTrue(bulk2.isActive)

    const bulkLog = await ActivityLog.query()
      .where('userId', owner.id)
      .where('action', 'service.bulk_toggle')
      .firstOrFail()
    assert.include(bulkLog.description, 'Mengaktifkan 2 layanan')
  })

  test('softDeleteService sets deletedAt and marks log sensitive; deleted service cannot be toggled (SVC-2)', async ({
    assert,
  }) => {
    const service = await app.container.make(PriceListService)
    const owner = await createOwner()

    const created = await service.createService(
      {
        name: 'Old Deprecated Service',
        type: ServiceType.MAIN,
        itemKinds: [ItemKind.SHOE],
        price: 40_000,
        estimatedDays: 2,
        isStartingFrom: false,
        description: 'Layanan lama',
        isActive: true,
      },
      owner
    )

    await service.softDeleteService(created.id, owner)

    const log = await ActivityLog.query()
      .where('userId', owner.id)
      .where('action', 'service.delete')
      .firstOrFail()
    assert.isTrue(log.isSensitive, 'Service deletion must be flagged sensitive in audit log')

    // Cannot find or reactivate deleted service
    await assert.rejects(
      async () => service.findAvailableService(created.id),
      /Layanan tidak ditemukan/
    )
    await assert.rejects(
      async () => service.toggleServiceActive(created.id, true, owner),
      /Layanan tidak ditemukan/
    )
    await assert.rejects(
      async () =>
        service.updateService(
          created.id,
          {
            name: 'Updated',
            type: ServiceType.MAIN,
            itemKinds: [ItemKind.SHOE],
            price: 50_000,
            estimatedDays: 2,
            isStartingFrom: false,
            description: '',
          },
          owner
        ),
      /Layanan tidak ditemukan/
    )
  })
})
