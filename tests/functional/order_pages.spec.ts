import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import { ItemKind } from '#enums/item_kind_enum'
import { OrderAddressKind } from '#enums/order_address_kind_enum'
import { OrderStatus } from '#enums/order_status_enum'
import { Role } from '#enums/role_enum'
import { ZONE } from '#helpers/opening_hours'
import Order from '#models/order'
import OrderAddress from '#models/order_address'
import OrderEvent from '#models/order_event'
import OrderItem from '#models/order_item'
import PickupSlot from '#models/pickup_slot'
import User from '#models/user'
import { fakeWhatsApp } from '../helpers/fake_whatsapp_service.js'
import { visitRedirect } from '../helpers/inertia.js'

function createUser(phone: string, role: Role = Role.CUSTOMER) {
  return User.create({
    fullName: 'Rina Wulandari',
    phone,
    password: 'password123',
    role,
    isActive: true,
  })
}

async function createSampleOrder(
  user: User,
  status: OrderStatus,
  requestKey: string,
  createdAt?: DateTime
) {
  const slot = await PickupSlot.query().where('is_active', true).firstOrFail()
  const order = await Order.create({
    userId: user.id,
    status,
    pickupDate: DateTime.now().setZone(ZONE).plus({ days: 1 }),
    pickupSlotId: slot.id,
    pickupStartsAt: slot.startsAt,
    pickupEndsAt: slot.endsAt,
    requestKey,
    createdAt: createdAt ?? DateTime.now(),
  })
  await OrderAddress.createMany([
    {
      orderId: order.id,
      kind: OrderAddressKind.PICKUP,
      label: 'Rumah',
      recipientName: user.fullName,
      recipientPhone: user.phone,
      addressText: 'Jalan Dipatiukur No. 35',
      details: null,
      lat: -6.881768,
      lng: 107.61421,
      street: 'Jalan Dipatiukur',
      kelurahan: 'Lebakgede',
      kecamatan: 'Coblong',
      city: 'Kota Bandung',
    },
    {
      orderId: order.id,
      kind: OrderAddressKind.DELIVERY,
      label: 'Rumah',
      recipientName: user.fullName,
      recipientPhone: user.phone,
      addressText: 'Jalan Dipatiukur No. 35',
      details: null,
      lat: -6.881768,
      lng: 107.61421,
      street: 'Jalan Dipatiukur',
      kelurahan: 'Lebakgede',
      kecamatan: 'Coblong',
      city: 'Kota Bandung',
    },
  ])
  await OrderItem.create({
    orderId: order.id,
    itemKind: ItemKind.SHOE,
    brand: 'Nike',
    type: 'Air Force 1',
    size: '42',
  })
  await OrderEvent.create({
    orderId: order.id,
    status,
    actorId: user.id,
  })
  return order
}

test.group(
  'Customer order pages /pesanan, /pesanan/:id, cancel (CUST-7, CUST-8, CUST-9, ORD-4)',
  (group) => {
    group.each.setup(async () => {
      await testUtils.db().seed()
      return testUtils.db().wrapInGlobalTransaction()
    })

    test('guests are sent to sign in and staff are refused on /pesanan routes (CUST-7, CUST-9)', async ({
      client,
    }) => {
      const customer = await createUser('6281200000700')
      const order = await createSampleOrder(customer, OrderStatus.AWAITING_PICKUP, 'auth-check')
      const staff = await createUser('6281200000701', Role.STAFF)

      for (const path of ['/pesanan', `/pesanan/${order.id}`]) {
        const guest = await client.get(path).redirects(0)
        guest.assertStatus(302)
        guest.assertHeader('location', '/masuk')

        const refused = await client.get(path).loginAs(staff)
        refused.assertStatus(403)
      }

      const cancelGuest = await client
        .post(`/pesanan/${order.id}/batal`)
        .json({ reason: 'Salah jadwal' })
        .withCsrfToken()
        .redirects(0)
      cancelGuest.assertStatus(302)
      cancelGuest.assertHeader('location', '/masuk')

      const cancelStaff = await client
        .post(`/pesanan/${order.id}/batal`)
        .json({ reason: 'Salah jadwal' })
        .withCsrfToken()
        .loginAs(staff)
      cancelStaff.assertStatus(403)
    })

    test('GET /pesanan lists own orders newest first with status filter and order number search (CUST-9)', async ({
      client,
      assert,
    }) => {
      const owner = await createUser('6281200000702')
      const other = await createUser('6281200000703')

      const active = await createSampleOrder(
        owner,
        OrderStatus.AWAITING_PICKUP,
        'list-active',
        DateTime.now().minus({ hours: 2 })
      )
      const finished = await createSampleOrder(
        owner,
        OrderStatus.COMPLETED,
        'list-finished',
        DateTime.now().minus({ hours: 1 })
      )
      const cancelled = await createSampleOrder(
        owner,
        OrderStatus.CANCELLED,
        'list-cancelled',
        DateTime.now()
      )
      await createSampleOrder(other, OrderStatus.AWAITING_PICKUP, 'list-other')

      const all = await client.get('/pesanan').withInertia().loginAs(owner)
      all.assertStatus(200)
      assert.deepEqual(
        (all.inertiaProps.orders as { id: number }[]).map((row) => row.id),
        [cancelled.id, finished.id, active.id]
      )
      assert.deepEqual(all.inertiaProps.counts, {
        semua: 3,
        aktif: 1,
        selesai: 1,
        dibatalkan: 1,
      })

      const onlyActive = await client.get('/pesanan?status=aktif').withInertia().loginAs(owner)
      assert.deepEqual(
        (onlyActive.inertiaProps.orders as { id: number }[]).map((row) => row.id),
        [active.id]
      )

      const onlyFinished = await client.get('/pesanan?status=selesai').withInertia().loginAs(owner)
      assert.deepEqual(
        (onlyFinished.inertiaProps.orders as { id: number }[]).map((row) => row.id),
        [finished.id]
      )

      const onlyCancelled = await client
        .get('/pesanan?status=dibatalkan')
        .withInertia()
        .loginAs(owner)
      assert.deepEqual(
        (onlyCancelled.inertiaProps.orders as { id: number }[]).map((row) => row.id),
        [cancelled.id]
      )

      const searched = await client
        .get(`/pesanan?q=${encodeURIComponent(active.number())}`)
        .withInertia()
        .loginAs(owner)
      assert.deepEqual(
        (searched.inertiaProps.orders as { id: number }[]).map((row) => row.id),
        [active.id]
      )
    })

    test('GET /pesanan/:id shows own order detail and refuses other customers (CUST-7)', async ({
      client,
      assert,
    }) => {
      const owner = await createUser('6281200000704')
      const other = await createUser('6281200000705')
      const order = await createSampleOrder(owner, OrderStatus.AWAITING_PICKUP, 'detail-own')

      const own = await client.get(`/pesanan/${order.id}`).withInertia().loginAs(owner)
      own.assertStatus(200)
      const prop = own.inertiaProps.order as {
        id: number
        number: string
        canCancel: boolean
        addresses: unknown[]
        items: unknown[]
        events: unknown[]
      }
      assert.equal(prop.id, order.id)
      assert.equal(prop.number, order.number())
      assert.isTrue(prop.canCancel)
      assert.lengthOf(prop.addresses, 2)
      assert.lengthOf(prop.items, 1)
      assert.lengthOf(prop.events, 1)

      const stolen = await client.get(`/pesanan/${order.id}`).loginAs(other)
      stolen.assertStatus(403)
    })

    test('POST /pesanan/:id/batal cancels awaiting_pickup with reason and sends no message (CUST-8, ORD-4)', async ({
      client,
      assert,
    }) => {
      fakeWhatsApp.clear()
      const owner = await createUser('6281200000706')
      const other = await createUser('6281200000707')
      const order = await createSampleOrder(owner, OrderStatus.AWAITING_PICKUP, 'cancel-ok')

      // Another customer cannot cancel it.
      const stolen = await client
        .post(`/pesanan/${order.id}/batal`)
        .withInertia()
        .json({ reason: 'Salah jadwal' })
        .withCsrfToken()
        .loginAs(other)
        .redirects(0)
      stolen.assertStatus(403)

      // Short reason is refused with validation error.
      const tooShort = await client
        .post(`/pesanan/${order.id}/batal`)
        .withInertia()
        .header('Referer', `/pesanan/${order.id}`)
        .json({ reason: 'no' })
        .withCsrfToken()
        .loginAs(owner)
        .redirects(0)
      tooShort.assertStatus(302)
      const errorsPage = await visitRedirect(client, tooShort)
      assert.isDefined((errorsPage.inertiaProps.errors as Record<string, string>)?.reason)

      // Valid cancellation transitions to cancelled, records event with reason, sends no WA message.
      const ok = await client
        .post(`/pesanan/${order.id}/batal`)
        .withInertia()
        .json({ reason: 'Salah jadwal penjemputan' })
        .withCsrfToken()
        .loginAs(owner)
        .redirects(0)
      ok.assertStatus(302)
      ok.assertHeader('location', `/pesanan/${order.id}`)

      await order.refresh()
      assert.equal(order.status, OrderStatus.CANCELLED)
      const events = await OrderEvent.query().where('order_id', order.id).orderBy('id', 'asc')
      assert.lengthOf(events, 2)
      assert.equal(events[1].status, OrderStatus.CANCELLED)
      assert.equal(events[1].note, 'Salah jadwal penjemputan')
      assert.lengthOf(fakeWhatsApp.getDispatchedMessages(), 0)
    })

    test('POST /pesanan/:id/batal refuses orders past awaiting_pickup (CUST-8)', async ({
      client,
    }) => {
      const owner = await createUser('6281200000708')
      const order = await createSampleOrder(owner, OrderStatus.COURIER_EN_ROUTE, 'cancel-late')

      const response = await client
        .post(`/pesanan/${order.id}/batal`)
        .json({ reason: 'Ingin membatalkan' })
        .withCsrfToken()
        .loginAs(owner)
      response.assertStatus(409)
    })
  }
)
