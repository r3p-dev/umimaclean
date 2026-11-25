import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import type { ApiClient } from '@japa/api-client'
import PickupSlot from '#models/pickup_slot'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { DateTime } from 'luxon'
import { OrderStatus } from '#enums/order_status_enum'
import { ZONE } from '#helpers/opening_hours'
import Order from '#models/order'
import { visitRedirect } from '../helpers/inertia.js'

async function owner() {
  return User.query().where('role', Role.ADMIN).firstOrFail()
}

async function saveDay(client: ApiClient, weekday: number, slots: unknown[]) {
  return client
    .put(`/admin/pengaturan/slot/${weekday}`)
    .loginAs(await owner())
    .withCsrfToken()
    .json({ slots })
    .redirects(0)
}

function keep(slot: PickupSlot) {
  return {
    id: slot.id,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    capacity: slot.capacity,
    isActive: slot.isActive,
  }
}

async function countOn(weekday: number) {
  const slots = await PickupSlot.query().where('weekday', weekday)
  return slots.length
}

test.group('Pickup slots per weekday /admin/pengaturan/slot (OWN-8, SLOT-2, D106)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('the owner page lists every slot with its weekday and the open days', async ({
    client,
    assert,
  }) => {
    const response = await client
      .get('/admin/pengaturan/slot')
      .withInertia()
      .loginAs(await owner())
    response.assertStatus(200)
    assert.lengthOf(response.inertiaProps.slots, 18)
    assert.deepEqual(response.inertiaProps.slots[0], {
      id: response.inertiaProps.slots[0].id,
      weekday: 1,
      startsAt: '09:00',
      endsAt: '12:00',
      capacity: 6,
      isActive: true,
    })
    assert.deepEqual(response.inertiaProps.openDays, [1, 2, 3, 4, 5, 6])
  })

  test('the owner saves one day; the other days keep their slots (SLOT-2)', async ({
    client,
    assert,
  }) => {
    const response = await saveDay(client, 6, [
      { startsAt: '09:00', endsAt: '12:00', capacity: 8, isActive: true },
    ])
    response.assertStatus(302)

    const saturday = await PickupSlot.query().where('weekday', 6)
    assert.deepEqual(
      saturday.map((slot) => [slot.startsAt, slot.endsAt, slot.capacity]),
      [['09:00', '12:00', 8]]
    )
    assert.equal(await countOn(5), 3)
  })

  test('overlapping slots of one day are refused (SLOT-2)', async ({ client, assert }) => {
    const response = await saveDay(client, 1, [
      { startsAt: '09:00', endsAt: '12:00', capacity: 6, isActive: true },
      { startsAt: '11:00', endsAt: '14:00', capacity: 6, isActive: true },
    ])
    const next = await visitRedirect(client, response)
    next.assertInertiaPropsContains({
      errors: { slots: 'Slot 11.00–14.00 bertabrakan dengan 09.00–12.00.' },
    })
    assert.equal(await countOn(1), 3)
  })

  test('a slot with a pending pickup cannot be deleted; it can be switched off (M5a decision 1)', async ({
    client,
    assert,
  }) => {
    const [morning, noon, afternoon] = await PickupSlot.query()
      .where('weekday', 1)
      .orderBy('starts_at')
    let monday = DateTime.now().setZone(ZONE).plus({ days: 1 })
    while (monday.weekday !== 1) {
      monday = monday.plus({ days: 1 })
    }
    const customer = await User.query().where('role', Role.CUSTOMER).firstOrFail()
    await Order.create({
      userId: customer.id,
      status: OrderStatus.AWAITING_PICKUP,
      pickupDate: monday,
      pickupSlotId: morning.id,
      pickupStartsAt: morning.startsAt,
      pickupEndsAt: morning.endsAt,
      requestKey: 'slot-route-test',
    })

    const refused = await saveDay(client, 1, [keep(noon), keep(afternoon)])
    const next = await visitRedirect(client, refused)
    next.assertInertiaPropsContains({
      errors: {
        slots:
          'Slot Senin 09.00–12.00 masih punya pesanan yang belum dijemput. Slot itu hanya bisa dimatikan atau diubah kapasitasnya.',
      },
    })
    assert.equal(await countOn(1), 3)

    const switchedOff = await saveDay(client, 1, [
      { ...keep(morning), isActive: false },
      keep(noon),
      keep(afternoon),
    ])
    switchedOff.assertStatus(302)
    await morning.refresh()
    assert.isFalse(morning.isActive)
  })

  test('touching slots are fine, but a slot must end after it starts (SLOT-2)', async ({
    client,
  }) => {
    const touching = await saveDay(client, 1, [
      { startsAt: '09:00', endsAt: '12:00', capacity: 6, isActive: true },
      { startsAt: '12:00', endsAt: '15:00', capacity: 6, isActive: true },
    ])
    touching.assertStatus(302)
    const ok = await visitRedirect(client, touching)
    ok.assertInertiaPropsContains({ errors: {} })

    const backwards = await saveDay(client, 1, [
      { startsAt: '15:00', endsAt: '12:00', capacity: 6, isActive: true },
    ])
    const next = await visitRedirect(client, backwards)
    next.assertInertiaPropsContains({
      errors: { 'slots.0': 'Jam selesai harus setelah jam mulai.' },
    })
  })

  test('a closed day cannot get slots (D104)', async ({ client, assert }) => {
    const response = await saveDay(client, 7, [
      { startsAt: '09:00', endsAt: '12:00', capacity: 6, isActive: true },
    ])
    const next = await visitRedirect(client, response)
    next.assertInertiaPropsContains({
      errors: { 'params.weekday': 'Hari ini tutup. Buka dulu di jam operasional.' },
    })
    assert.equal(await countOn(7), 0)
  })

  test('copying a day fills every other open day and never Sunday', async ({ client, assert }) => {
    await saveDay(client, 2, [{ startsAt: '10:00', endsAt: '11:00', capacity: 2, isActive: true }])

    const response = await client
      .post('/admin/pengaturan/slot/2/salin')
      .loginAs(await owner())
      .withCsrfToken()
      .redirects(0)
    response.assertStatus(302)

    for (const weekday of [1, 3, 4, 5, 6]) {
      const slots = await PickupSlot.query().where('weekday', weekday)
      assert.deepEqual(
        slots.map((slot) => [slot.startsAt, slot.endsAt]),
        [['10:00', '11:00']]
      )
    }
    assert.equal(await countOn(7), 0)
  })

  test('guests are sent to sign in; customers and staff are refused', async ({ client }) => {
    const guest = await client.get('/admin/pengaturan/slot').redirects(0)
    guest.assertStatus(302)
    guest.assertHeader('location', '/staf/masuk')

    for (const role of [Role.CUSTOMER, Role.STAFF]) {
      const user = await User.query().where('role', role).firstOrFail()
      const page = await client.get('/admin/pengaturan/slot').loginAs(user)
      page.assertStatus(403)
      const save = await client
        .put('/admin/pengaturan/slot/1')
        .loginAs(user)
        .withCsrfToken()
        .json({ slots: [] })
      save.assertStatus(403)
    }
  })
})
