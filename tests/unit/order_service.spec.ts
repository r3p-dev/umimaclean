import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import { BagSize } from '#enums/bag_size_enum'
import { ItemKind } from '#enums/item_kind_enum'
import { OrderAddressKind } from '#enums/order_address_kind_enum'
import { OrderStatus } from '#enums/order_status_enum'
import { Role } from '#enums/role_enum'
import { ZONE } from '#helpers/opening_hours'
import CustomerAddress from '#models/customer_address'
import Order from '#models/order'
import OrderAddress from '#models/order_address'
import OrderEvent from '#models/order_event'
import OrderItem from '#models/order_item'
import PickupSlot from '#models/pickup_slot'
import User from '#models/user'
import AreaService from '#services/area_service'
import OrderService, { SLOT_FULL_MESSAGE } from '#services/order_service'
import WhatsAppService from '#services/whatsapp_service'
import type { OrderDraft } from '#validators/order_validator'
import { fakeWhatsApp } from '../helpers/fake_whatsapp_service.js'
import { validationMessagesOf } from '../helpers/validation.js'

// A fixed "now" far from today, so the dates never meet real orders: Monday 7 January 2030, 10.00.
// The customer can choose Tuesday 8 to Monday 14 January, except Sunday 13 (SLOT-1).
const NOW = DateTime.fromISO('2030-01-07T10:00', { zone: ZONE })
const TUESDAY = '2030-01-08'
// Coblong (Kota Bandung) is active in the seed; Cileunyi is not.
const COBLONG = { lat: -6.881768, lng: 107.61421 }
const CILEUNYI = { lat: -6.925479, lng: 107.742516 }

function createCustomer(phone: string, fullName = 'Rina Wulandari') {
  return User.create({
    fullName,
    phone,
    password: 'password123',
    role: Role.CUSTOMER,
    isActive: true,
  })
}

function createAddress(customer: User, label: string, point = COBLONG) {
  return CustomerAddress.create({
    userId: customer.id,
    label,
    recipientName: customer.fullName,
    recipientPhone: customer.phone,
    addressText: 'Jalan Dipatiukur No. 35, Lebakgede, Coblong',
    details: 'Pagar hitam',
    ...point,
    street: 'Jalan Dipatiukur',
    kelurahan: 'Lebakgede',
    kecamatan: point === COBLONG ? 'Coblong' : 'Cileunyi',
    city: point === COBLONG ? 'Kota Bandung' : 'Kabupaten Bandung',
    isPrimary: label === 'Rumah',
  })
}

function slotOn(weekday: number, startsAt = '09:00') {
  return PickupSlot.query().where('weekday', weekday).where('starts_at', startsAt).firstOrFail()
}

function draftFor(address: CustomerAddress, slot: PickupSlot, overrides: Partial<OrderDraft> = {}) {
  return {
    items: [
      { itemKind: ItemKind.SHOE, brand: 'Nike', type: 'Air Force 1', size: '42' },
      { itemKind: ItemKind.BAG, type: 'Ransel kanvas', size: BagSize.MEDIUM },
    ],
    pickupAddressId: address.id,
    deliveryAddressId: address.id,
    pickupDate: DateTime.fromISO(TUESDAY),
    pickupSlotId: slot.id,
    note: 'Telepon dulu',
    ...overrides,
  } satisfies OrderDraft
}

test.group(
  'OrderService.placeOnlineOrder (CUST-4, CUST-6, SLOT-1, SLOT-3, AREA-4, MSG-1.1)',
  (group) => {
    // Seeded inside the transaction, so the next unit files start from an empty database.
    group.each.setup(async () => {
      const rollback = await testUtils.db().wrapInGlobalTransaction()
      await testUtils.db().seed()
      fakeWhatsApp.clear()
      return rollback
    })

    test('an order starts at awaiting_pickup with its copies, items, first event and message', async ({
      assert,
    }) => {
      const service = await app.container.make(OrderService)
      const customer = await createCustomer('6281200000601')
      const home = await createAddress(customer, 'Rumah')
      const office = await createAddress(customer, 'Kantor')
      const slot = await slotOn(2)

      const order = await service.placeOnlineOrder(
        customer,
        draftFor(home, slot, { deliveryAddressId: office.id }),
        'key-1',
        NOW
      )

      assert.equal(order.status, OrderStatus.AWAITING_PICKUP)
      assert.equal(order.pickupDate.toISODate(), TUESDAY)
      assert.deepEqual(
        [order.pickupSlotId, order.pickupStartsAt, order.pickupEndsAt],
        [slot.id, '09:00', '12:00']
      )
      assert.equal(order.note, 'Telepon dulu')
      const addresses = await OrderAddress.query()
        .where('order_id', order.id)
        .orderBy('kind', 'desc')
      assert.deepEqual(
        addresses.map((address) => [
          address.kind,
          address.label,
          address.addressText,
          address.kecamatan,
        ]),
        [
          [OrderAddressKind.PICKUP, 'Rumah', home.addressText, 'Coblong'],
          [OrderAddressKind.DELIVERY, 'Kantor', office.addressText, 'Coblong'],
        ]
      )
      const items = await OrderItem.query().where('order_id', order.id).orderBy('id')
      assert.deepEqual(
        items.map((item) => [item.itemKind, item.brand, item.type, item.size]),
        [
          [ItemKind.SHOE, 'Nike', 'Air Force 1', '42'],
          [ItemKind.BAG, null, 'Ransel kanvas', 'M'],
        ]
      )
      const events = await OrderEvent.query().where('order_id', order.id)
      assert.deepEqual(
        events.map((event) => [event.status, event.actorId]),
        [[OrderStatus.AWAITING_PICKUP, customer.id]]
      )
      assert.deepEqual(
        fakeWhatsApp
          .getDispatchedMessages(customer.phone)
          .map((message) => [message.kind, message.text]),
        [
          [
            'order_received',
            `Halo Rina Wulandari, pesanan ${order.number()} sudah kami terima. Penjemputan: Selasa, 8 Jan 2030, 09.00–12.00.`,
          ],
        ]
      )
    })

    test('editing or deleting the saved address later never changes the order (CUST-4)', async ({
      assert,
    }) => {
      const service = await app.container.make(OrderService)
      const customer = await createCustomer('6281200000602')
      const home = await createAddress(customer, 'Rumah')
      const order = await service.placeOnlineOrder(
        customer,
        draftFor(home, await slotOn(2)),
        'key-1',
        NOW
      )

      await home.merge({ addressText: 'Alamat baru', recipientName: 'Orang lain' }).save()
      await home.delete()

      const copies = await OrderAddress.query().where('order_id', order.id)
      assert.lengthOf(copies, 2)
      for (const copy of copies) {
        assert.equal(copy.addressText, 'Jalan Dipatiukur No. 35, Lebakgede, Coblong')
        assert.equal(copy.recipientName, 'Rina Wulandari')
      }
    })

    test('a full slot is refused; a cancelled order frees its place, a skipped one keeps it (SLOT-3)', async ({
      assert,
    }) => {
      const service = await app.container.make(OrderService)
      const first = await createCustomer('6281200000603')
      const second = await createCustomer('6281200000604')
      const firstHome = await createAddress(first, 'Rumah')
      const secondHome = await createAddress(second, 'Rumah')
      const slot = await slotOn(2)
      await slot.merge({ capacity: 1 }).save()

      const taken = await service.placeOnlineOrder(first, draftFor(firstHome, slot), 'key-1', NOW)
      assert.deepEqual(
        await validationMessagesOf(() =>
          service.placeOnlineOrder(second, draftFor(secondHome, slot), 'key-2', NOW)
        ),
        [{ field: 'pickupSlotId', message: SLOT_FULL_MESSAGE, rule: 'slotFull' }]
      )

      // Back from courier_en_route after a skipped pickup: still holds the place (M5a decision 5).
      await taken.merge({ status: OrderStatus.AWAITING_PICKUP }).save()
      await assert.rejects(() =>
        service.placeOnlineOrder(second, draftFor(secondHome, slot), 'key-3', NOW)
      )

      await taken.merge({ status: OrderStatus.CANCELLED }).save()
      const placed = await service.placeOnlineOrder(
        second,
        draftFor(secondHome, slot),
        'key-4',
        NOW
      )
      assert.equal(placed.pickupSlotId, slot.id)
    })

    test('a date outside tomorrow to 7 days ahead, a Sunday, a switched-off slot or another weekday are refused (SLOT-1, SLOT-3)', async ({
      assert,
    }) => {
      const service = await app.container.make(OrderService)
      const customer = await createCustomer('6281200000605')
      const home = await createAddress(customer, 'Rumah')
      const tuesdaySlot = await slotOn(2)

      for (const date of ['2030-01-07', '2030-01-13', '2030-01-15']) {
        const messages = await validationMessagesOf(() =>
          service.placeOnlineOrder(
            customer,
            draftFor(home, tuesdaySlot, { pickupDate: DateTime.fromISO(date) }),
            `key-${date}`,
            NOW
          )
        )
        assert.equal(messages[0].field, 'pickupDate', date)
      }

      const wednesdaySlot = await slotOn(3)
      const otherDay = await validationMessagesOf(() =>
        service.placeOnlineOrder(customer, draftFor(home, wednesdaySlot), 'key-other-day', NOW)
      )
      assert.equal(otherDay[0].rule, 'slotUnavailable')

      await tuesdaySlot.merge({ isActive: false }).save()
      const switchedOff = await validationMessagesOf(() =>
        service.placeOnlineOrder(customer, draftFor(home, tuesdaySlot), 'key-off', NOW)
      )
      assert.equal(switchedOff[0].rule, 'slotUnavailable')
      assert.lengthOf(await Order.query().where('user_id', customer.id), 0)
    })

    test('a pickup or delivery address outside the active areas is refused (AREA-4)', async ({
      assert,
    }) => {
      const service = await app.container.make(OrderService)
      const customer = await createCustomer('6281200000606')
      const home = await createAddress(customer, 'Rumah')
      const away = await createAddress(customer, 'Kos', CILEUNYI)
      const slot = await slotOn(2)

      const pickup = await validationMessagesOf(() =>
        service.placeOnlineOrder(
          customer,
          draftFor(away, slot, { deliveryAddressId: home.id }),
          'key-1',
          NOW
        )
      )
      assert.deepEqual(pickup, [
        {
          field: 'pickupAddressId',
          message:
            'Alamat penjemputan "Kos" di luar area layanan. Ubah titiknya di Alamat atau pilih alamat lain.',
          rule: 'area.outside',
        },
      ])
      const delivery = await validationMessagesOf(() =>
        service.placeOnlineOrder(
          customer,
          draftFor(home, slot, { deliveryAddressId: away.id }),
          'key-2',
          NOW
        )
      )
      assert.equal(delivery[0].field, 'deliveryAddressId')
    })

    test("another customer's address is not found", async ({ assert }) => {
      const service = await app.container.make(OrderService)
      const customer = await createCustomer('6281200000607')
      const stranger = await createCustomer('6281200000608')
      const strangersHome = await createAddress(stranger, 'Rumah')
      const slot = await slotOn(2)

      await assert.rejects(
        () => service.placeOnlineOrder(customer, draftFor(strangersHome, slot), 'key-1', NOW),
        /Row not found/
      )
    })

    test('a double submit creates one order and one message (CUST-6)', async ({ assert }) => {
      const service = await app.container.make(OrderService)
      const customer = await createCustomer('6281200000609')
      const home = await createAddress(customer, 'Rumah')
      const draft = draftFor(home, await slotOn(2))

      const [first, second] = await Promise.all([
        service.placeOnlineOrder(customer, draft, 'same-key', NOW),
        service.placeOnlineOrder(customer, draft, 'same-key', NOW),
      ])
      const third = await service.placeOnlineOrder(customer, draft, 'same-key', NOW)

      assert.equal(second.id, first.id)
      assert.equal(third.id, first.id)
      assert.lengthOf(await Order.query().where('user_id', customer.id), 1)
      assert.lengthOf(fakeWhatsApp.getDispatchedMessages(customer.phone), 1)
    })

    test('a failing message is logged and the order stays (MSG-3)', async ({ assert, cleanup }) => {
      class BrokenWhatsApp extends WhatsAppService {
        override async sendMessage(): Promise<never> {
          throw new Error('Fonnte is down')
        }
      }
      app.container.swap(WhatsAppService, () => new BrokenWhatsApp())
      cleanup(() => app.container.swap(WhatsAppService, () => fakeWhatsApp))
      const service = await app.container.make(OrderService)
      const customer = await createCustomer('6281200000610')
      const home = await createAddress(customer, 'Rumah')

      const order = await service.placeOnlineOrder(
        customer,
        draftFor(home, await slotOn(2)),
        'key-1',
        NOW
      )

      const saved = await Order.findOrFail(order.id)
      assert.equal(saved.status, OrderStatus.AWAITING_PICKUP)
    })
  }
)

// Outside the global transaction: two transactions must really run at once. The rows it creates are
// deleted afterwards.
test.group('OrderService.placeOnlineOrder under concurrency (SLOT-3)', (group) => {
  let slot: PickupSlot
  let customers: User[] = []

  group.each.setup(async () => {
    app.container.swap(AreaService, () => {
      const coveredEverywhere = new AreaService()
      coveredEverywhere.checkCoverage = async () => ({ isCovered: true, district: null })
      return coveredEverywhere
    })
    slot = await PickupSlot.create({
      weekday: 2,
      startsAt: '19:00',
      endsAt: '20:00',
      capacity: 1,
      isActive: true,
    })
    customers = [
      await createCustomer('6281200000691', 'Pelanggan Satu'),
      await createCustomer('6281200000692', 'Pelanggan Dua'),
    ]
    return async () => {
      app.container.restore(AreaService)
      await Order.query().where('pickup_slot_id', slot.id).delete()
      await slot.delete()
      for (const customer of customers) {
        await customer.delete()
      }
    }
  })

  test('two customers taking the last place at once make one order', async ({ assert }) => {
    const service = await app.container.make(OrderService)
    const drafts = await Promise.all(
      customers.map(async (customer) => draftFor(await createAddress(customer, 'Rumah'), slot))
    )

    const results = await Promise.allSettled(
      customers.map((customer, index) =>
        service.placeOnlineOrder(customer, drafts[index], `race-${index}`, NOW)
      )
    )

    assert.deepEqual(results.map((result) => result.status).sort(), ['fulfilled', 'rejected'])
    const refused = results.find((result) => result.status === 'rejected')
    assert.deepEqual((refused as PromiseRejectedResult).reason.messages, [
      { field: 'pickupSlotId', message: SLOT_FULL_MESSAGE, rule: 'slotFull' },
    ])
    assert.lengthOf(await Order.query().where('pickup_slot_id', slot.id), 1)
  })
})

test.group('OrderService.cancelOrderByCustomer (CUST-8)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('cancels awaiting_pickup, frees slot place, and sends no WhatsApp message', async ({
    assert,
  }) => {
    fakeWhatsApp.clear()
    const customer = await createCustomer('6281200000693')
    const address = await createAddress(customer, 'Rumah')
    const slot = await slotOn(2)
    const service = await app.container.make(OrderService)

    const order = await service.placeOnlineOrder(
      customer,
      draftFor(address, slot),
      'cancel-unit-1',
      NOW
    )
    fakeWhatsApp.clear()

    await service.cancelOrderByCustomer(customer, order.id, 'Jadwal berubah')
    await order.refresh()
    assert.equal(order.status, OrderStatus.CANCELLED)
    assert.lengthOf(fakeWhatsApp.getDispatchedMessages(), 0)

    const events = await OrderEvent.query().where('order_id', order.id).orderBy('id', 'asc')
    assert.equal(events.at(-1)?.status, OrderStatus.CANCELLED)
    assert.equal(events.at(-1)?.note, 'Jadwal berubah')
  })

  test('refuses non-owner (403) and statuses other than awaiting_pickup (409)', async ({
    assert,
  }) => {
    const owner = await createCustomer('6281200000694')
    const other = await createCustomer('6281200000695')
    const slot = await slotOn(2)
    const order = await Order.create({
      userId: owner.id,
      status: OrderStatus.COURIER_EN_ROUTE,
      pickupDate: DateTime.fromISO(TUESDAY, { zone: ZONE }),
      pickupSlotId: slot.id,
      pickupStartsAt: slot.startsAt,
      pickupEndsAt: slot.endsAt,
      requestKey: 'cancel-unit-2',
    })
    const service = await app.container.make(OrderService)

    await assert.rejects(
      () => service.cancelOrderByCustomer(other, order.id, 'Coba batal'),
      /Akses ditolak/
    )
    await assert.rejects(
      () => service.cancelOrderByCustomer(owner, order.id, 'Coba batal'),
      /sebelum kurir berangkat/
    )
  })
})
