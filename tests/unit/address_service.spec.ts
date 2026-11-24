import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import CustomerAddress from '#models/customer_address'
import ServiceArea from '#models/service_area'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import AddressService from '#services/address_service'
import type { AddressInput } from '#validators/address_validator'
import { loadOsmFixture } from '../helpers/osm.js'

// Coblong (Kota Bandung) is active in the seed; Cileunyi is not.
const COBLONG = { lat: -6.881768, lng: 107.61421 }
const CILEUNYI = { lat: -6.925479, lng: 107.742516 }

function input(label: string, overrides: Partial<AddressInput> = {}): AddressInput {
  return {
    label,
    recipientName: 'Rina Wulandari',
    recipientPhone: '6281200000201',
    addressText: 'Jl. Dipatiukur No. 35, Coblong',
    ...COBLONG,
    ...overrides,
  }
}

function createCustomer(phone = '6281200000201') {
  return User.create({
    fullName: 'Rina Wulandari',
    phone,
    password: 'password123',
    role: Role.CUSTOMER,
    isActive: true,
  })
}

async function labelsOf(service: AddressService, user: User) {
  const addresses = await service.listAddresses(user)
  return addresses.map((address) => [address.label, address.isPrimary])
}

test.group('AddressService (CUST-2, CUST-3, AREA-4, D82)', (group) => {
  // Seeded inside the transaction, so the next unit files start from an empty database.
  group.each.setup(async () => {
    const rollback = await testUtils.db().wrapInGlobalTransaction()
    await testUtils.db().seed()
    return rollback
  })

  test('the first address is primary; a later one only when asked (CUST-2)', async ({ assert }) => {
    const service = await app.container.make(AddressService)
    const customer = await createCustomer()

    await service.createAddress(customer, input('Rumah', { isPrimary: false }))
    await service.createAddress(customer, input('Kantor'))
    assert.deepEqual(await labelsOf(service, customer), [
      ['Rumah', true],
      ['Kantor', false],
    ])

    await service.createAddress(customer, input('Kos', { isPrimary: true }))
    assert.deepEqual(await labelsOf(service, customer), [
      ['Kos', true],
      ['Kantor', false],
      ['Rumah', false],
    ])
  })

  test('a fourth address is refused (CUST-2)', async ({ assert }) => {
    const service = await app.container.make(AddressService)
    const customer = await createCustomer()
    for (const label of ['Rumah', 'Kantor', 'Kos']) {
      await service.createAddress(customer, input(label))
    }

    await assert.rejects(
      () => service.createAddress(customer, input('Gudang')),
      /Validation failure/
    )
    assert.equal(await service.countAddresses(customer), 3)
  })

  test('the area is read from the pin and never changes the typed address (CUST-3, D109)', async ({
    assert,
  }) => {
    const service = await app.container.make(AddressService)
    const customer = await createCustomer()

    const withoutMapData = await service.createAddress(customer, input('Rumah'))
    assert.equal(withoutMapData.addressText, 'Jl. Dipatiukur No. 35, Coblong')
    assert.equal(withoutMapData.kecamatan, 'Coblong')
    assert.equal(withoutMapData.city, 'Kota Bandung')
    assert.isNull(withoutMapData.street)
    assert.isNull(withoutMapData.kelurahan)

    await loadOsmFixture()
    const updated = await service.updateAddress(
      customer,
      withoutMapData.id,
      input('Rumah', { addressText: 'Jalan Dipatiukur No. 35, Lebakgede, Coblong' })
    )
    assert.equal(updated.addressText, 'Jalan Dipatiukur No. 35, Lebakgede, Coblong')
    assert.equal(updated.street, 'Jalan Dipatiukur')
    assert.equal(updated.kelurahan, 'Lebakgede')
  })

  test('a pin outside the active areas is refused when saving (AREA-4)', async ({ assert }) => {
    const service = await app.container.make(AddressService)
    const customer = await createCustomer()

    await assert.rejects(
      () => service.createAddress(customer, input('Rumah', CILEUNYI)),
      /Validation failure/
    )
    const address = await service.createAddress(customer, input('Rumah'))
    await assert.rejects(
      () => service.updateAddress(customer, address.id, input('Rumah', CILEUNYI)),
      /Validation failure/
    )
  })

  test('making another address primary moves the mark; unticking it is ignored (CUST-2)', async ({
    assert,
  }) => {
    const service = await app.container.make(AddressService)
    const customer = await createCustomer()
    const home = await service.createAddress(customer, input('Rumah'))
    const office = await service.createAddress(customer, input('Kantor'))

    await service.makeAddressPrimary(customer, office.id)
    assert.deepEqual(await labelsOf(service, customer), [
      ['Kantor', true],
      ['Rumah', false],
    ])

    await service.updateAddress(customer, office.id, input('Kantor Baru', { isPrimary: false }))
    await service.updateAddress(customer, home.id, input('Rumah'))
    assert.deepEqual(await labelsOf(service, customer), [
      ['Kantor Baru', true],
      ['Rumah', false],
    ])
  })

  test('deleting the primary promotes the newest remaining address (CUST-2)', async ({
    assert,
  }) => {
    const service = await app.container.make(AddressService)
    const customer = await createCustomer()
    const home = await service.createAddress(customer, input('Rumah'))
    await service.createAddress(customer, input('Kantor'))
    const newest = await service.createAddress(customer, input('Kos'))

    await service.deleteAddress(customer, home.id)
    assert.deepEqual(await labelsOf(service, customer), [
      ['Kos', true],
      ['Kantor', false],
    ])

    await service.deleteAddress(customer, newest.id)
    const [last] = await service.listAddresses(customer)
    await service.deleteAddress(customer, last.id)
    assert.deepEqual(await labelsOf(service, customer), [])
  })

  test('another customer’s address is not found', async ({ assert }) => {
    const service = await app.container.make(AddressService)
    const owner = await createCustomer()
    const other = await createCustomer('6281200000202')
    const address = await service.createAddress(owner, input('Rumah'))

    await assert.rejects(() => service.deleteAddress(other, address.id), /Row not found/)
    await assert.rejects(() => service.makeAddressPrimary(other, address.id), /Row not found/)
    assert.equal(await service.countAddresses(owner), 1)
  })

  test('the database allows only one primary address per customer (CUST-2)', async ({ assert }) => {
    const service = await app.container.make(AddressService)
    const customer = await createCustomer()
    await service.createAddress(customer, input('Rumah'))

    await assert.rejects(
      () =>
        CustomerAddress.create({
          userId: customer.id,
          isPrimary: true,
          ...input('Kantor'),
          details: null,
          kecamatan: 'Coblong',
          city: 'Kota Bandung',
        }),
      /customer_addresses_one_primary_per_user/
    )
  })

  test('an address stays saved but shows as outside once its district is turned off (D82)', async ({
    assert,
  }) => {
    const service = await app.container.make(AddressService)
    const customer = await createCustomer()
    await service.createAddress(customer, input('Rumah'))
    const [covered] = await service.listAddresses(customer)
    assert.isTrue(covered.$extras.is_covered)

    await ServiceArea.query().where('name', 'Coblong').update({ is_active: false })

    const [address] = await service.listAddresses(customer)
    assert.equal(address.label, 'Rumah')
    assert.isFalse(address.$extras.is_covered)
  })
})
