import { test } from '@japa/runner'
import { CustomerAddressFactory } from '#database/factories/customer_address_factory'
import { UserFactory } from '#database/factories/user_factory'
import CustomerAddress from '#models/customer_address'
import { addressPayload, post, savedAddress, send, useApp } from '#tests/support/app'

function activeAddresses(userId: number) {
  return CustomerAddress.query().where('user_id', userId).whereNull('deleted_at')
}

test.group('Address book', (group) => {
  const state = useApp(group)

  test('the first address becomes primary automatically', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await post(client, '/profil/alamat', addressPayload()).loginAs(user)

    response.assertHeader('location', '/profil/alamat')
    const address = await CustomerAddress.firstOrFail()
    assert.equal(address.userId, user.id)
    assert.isTrue(address.isPrimary)
  })

  test('returns to the order page when added from there', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await post(client, '/profil/alamat?dari=pesan', addressPayload()).loginAs(user)

    response.assertHeader('location', '/pesan')
  })

  test('allows at most 5 active addresses', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const addresses = await CustomerAddressFactory.merge({ userId: user.id }).createMany(5)

    const full = await post(client, '/profil/alamat', addressPayload()).loginAs(user)
    full.assertStatus(422)
    full.assertBodyContains({ errors: [{ rule: 'addresses.max' }] })

    await send(client, 'delete', `/profil/alamat/${addresses[0].id}`).loginAs(user)
    const room = await post(client, '/profil/alamat', addressPayload()).loginAs(user)
    room.assertStatus(302)
    assert.lengthOf(await activeAddresses(user.id), 5)
  })

  test('keeps exactly one primary address', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const home = await savedAddress(user, { label: 'Rumah', isPrimary: true })
    const office = await savedAddress(user, { label: 'Kantor' })

    await post(client, `/profil/alamat/${office.id}/utama`).loginAs(user)
    await post(client, '/profil/alamat', addressPayload({ label: 'Kos', isPrimary: true })).loginAs(
      user
    )

    const primaries = await activeAddresses(user.id).where('is_primary', true)
    assert.lengthOf(primaries, 1)
    assert.equal(primaries[0].label, 'Kos')
    await home.refresh()
    assert.isFalse(home.isPrimary)
  })

  test('the database refuses a second primary address', async ({ assert }) => {
    const user = await UserFactory.create()
    await savedAddress(user, { isPrimary: true })

    await assert.rejects(() => savedAddress(user, { isPrimary: true }))
  })

  test('deleting the primary promotes the most recently used address', async ({
    client,
    assert,
  }) => {
    const { DateTime } = await import('luxon')
    const user = await UserFactory.create()
    const primary = await savedAddress(user, { isPrimary: true })
    await savedAddress(user, { label: 'Lama', lastUsedAt: DateTime.now().minus({ days: 30 }) })
    const recent = await savedAddress(user, { label: 'Baru', lastUsedAt: DateTime.now() })

    await send(client, 'delete', `/profil/alamat/${primary.id}`).loginAs(user)

    await primary.refresh()
    assert.isNotNull(primary.deletedAt)
    assert.isFalse(primary.isPrimary)
    await recent.refresh()
    assert.isTrue(recent.isPrimary)
  })

  test('rejects a pin outside the free pickup area', async ({ client, assert }) => {
    const user = await UserFactory.create()
    state.geocoder.address = { county: 'Kabupaten Garut', town: 'Tarogong' }

    const response = await post(client, '/profil/alamat', addressPayload()).loginAs(user)

    response.assertBodyContains({ errors: [{ rule: 'area.outside' }] })
    assert.lengthOf(await CustomerAddress.all(), 0)
  })

  test('another customer’s address cannot be opened, changed or deleted', async ({
    client,
    assert,
  }) => {
    const owner = await UserFactory.create()
    const intruder = await UserFactory.create()
    const address = await savedAddress(owner, { isPrimary: true })

    const edit = await client.get(`/profil/alamat/${address.id}/ubah`).loginAs(intruder)
    const update = await send(
      client,
      'put',
      `/profil/alamat/${address.id}`,
      addressPayload({ label: 'Diretas' })
    ).loginAs(intruder)
    const remove = await send(client, 'delete', `/profil/alamat/${address.id}`).loginAs(intruder)
    const primary = await post(client, `/profil/alamat/${address.id}/utama`).loginAs(intruder)

    for (const response of [edit, update, remove, primary]) {
      response.assertStatus(404)
    }
    await address.refresh()
    assert.equal(address.label, 'Rumah')
    assert.isNull(address.deletedAt)
  })
})
