import { test } from '@japa/runner'
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
import OrderItem from '#models/order_item'
import PickupSlot from '#models/pickup_slot'
import User from '#models/user'
import PickupSlotService from '#services/pickup_slot_service'
import SettingService from '#services/setting_service'

const COBLONG = { lat: -6.881768, lng: 107.61421 }
const CILEUNYI = { lat: -6.925479, lng: 107.742516 }

function createUser(phone: string, role: Role = Role.CUSTOMER) {
  return User.create({
    fullName: 'Rina Wulandari',
    phone,
    password: 'password123',
    role,
    isActive: true,
  })
}

function createAddress(user: User, label: string, inArea = true, isPrimary = true) {
  return CustomerAddress.create({
    userId: user.id,
    label,
    recipientName: user.fullName,
    recipientPhone: user.phone,
    addressText: inArea ? 'Jalan Dipatiukur No. 35, Coblong' : 'Jl. Raya Cileunyi No. 8',
    details: null,
    ...(inArea ? COBLONG : CILEUNYI),
    kecamatan: inArea ? 'Coblong' : 'Cileunyi',
    city: inArea ? 'Kota Bandung' : 'Kabupaten Bandung',
    isPrimary,
  })
}

async function firstOpenDateAndSlot() {
  const slotService = new PickupSlotService(new SettingService())
  const dates = await slotService.listPickupDates()
  const date = dates[0]
  const slots = await slotService.listSlotsForDate(date)
  const open = slots.find((entry) => entry.isAvailable)!
  return { date, slot: open.slot }
}

test.group(
  'Online order pages /pesan, /pesan/konfirmasi (CUST-5, CUST-6, SLOT-3, AREA-4)',
  (group) => {
    group.each.setup(async () => {
      await testUtils.db().seed()
      return testUtils.db().wrapInGlobalTransaction()
    })

    test('guests are sent to sign in and staff are refused (CUST-5)', async ({ client }) => {
      const guest = await client.get('/pesan').redirects(0)
      guest.assertStatus(302)
      guest.assertHeader('location', '/masuk')

      const staff = await createUser('6281200000600', Role.STAFF)
      const refused = await client.get('/pesan').loginAs(staff)
      refused.assertStatus(403)
    })

    test('POST /pesan validates and keeps the draft; POST /pesan/konfirmasi places the order (CUST-5, CUST-6, ORD-1)', async ({
      client,
      assert,
    }) => {
      const customer = await createUser('6281200000601')
      const address = await createAddress(customer, 'Rumah')
      const { date, slot } = await firstOpenDateAndSlot()

      const draftResponse = await client
        .post('/pesan')
        .withInertia()
        .json({
          items: [
            { itemKind: ItemKind.SHOE, brand: 'Nike', type: 'Air Force 1', size: '42' },
            { itemKind: ItemKind.BAG, brand: '', type: 'Ransel kanvas', size: BagSize.MEDIUM },
          ],
          pickupAddressId: address.id,
          deliveryAddressId: address.id,
          pickupDate: date,
          pickupSlotId: slot.id,
          note: 'Titip di pos satpam',
        })
        .withCsrfToken()
        .loginAs(customer)
        .redirects(0)

      draftResponse.assertStatus(302)
      draftResponse.assertHeader('location', '/pesan/konfirmasi')

      const confirmPage = await client
        .get('/pesan/konfirmasi')
        .withInertia()
        .withSession(draftResponse.session())
        .loginAs(customer)
      confirmPage.assertStatus(200)
      confirmPage.assertInertiaComponent('customer/orders/confirm')
      const requestKey = confirmPage.inertiaProps.requestKey as string
      assert.isString(requestKey)
      assert.isNotEmpty(requestKey)

      const placeResponse = await client
        .post('/pesan/konfirmasi')
        .withInertia()
        .withSession(draftResponse.session())
        .json({ requestKey })
        .withCsrfToken()
        .loginAs(customer)
        .redirects(0)

      placeResponse.assertStatus(302)
      placeResponse.assertHeader('location', '/beranda')

      const order = await Order.query().where('user_id', customer.id).firstOrFail()
      assert.equal(order.status, OrderStatus.AWAITING_PICKUP)
      assert.equal(order.note, 'Titip di pos satpam')
      placeResponse.assertFlashMessage('success', `Pesanan ${order.number()} diterima`)
    })

    test('an address outside the active area and a full slot are refused on POST /pesan (AREA-4, SLOT-3)', async ({
      client,
    }) => {
      const customer = await createUser('6281200000602')
      const outside = await createAddress(customer, 'Kos', false)
      const { date, slot } = await firstOpenDateAndSlot()

      const outsideRes = await client
        .post('/pesan')
        .withInertia()
        .header('Referer', '/pesan')
        .json({
          items: [{ itemKind: ItemKind.SHOE, type: 'Sneakers', size: '41' }],
          pickupAddressId: outside.id,
          deliveryAddressId: outside.id,
          pickupDate: date,
          pickupSlotId: slot.id,
        })
        .withCsrfToken()
        .loginAs(customer)
        .redirects(0)

      outsideRes.assertStatus(302)
      outsideRes.assertHeader('location', '/pesan')

      // Fill the slot to capacity and check with an inside address.
      const inside = await createAddress(customer, 'Rumah', true, false)
      await PickupSlot.query().where('id', slot.id).update({ capacity: 1 })
      const filler = await Order.create({
        userId: customer.id,
        status: OrderStatus.AWAITING_PICKUP,
        pickupDate: DateTime.fromISO(date, { zone: ZONE }),
        pickupSlotId: slot.id,
        pickupStartsAt: slot.startsAt,
        pickupEndsAt: slot.endsAt,
        requestKey: 'filler-key',
      })
      await OrderAddress.create({
        orderId: filler.id,
        kind: OrderAddressKind.PICKUP,
        label: inside.label,
        recipientName: inside.recipientName,
        recipientPhone: inside.recipientPhone,
        addressText: inside.addressText,
        lat: inside.lat,
        lng: inside.lng,
        kecamatan: inside.kecamatan,
        city: inside.city,
      })

      const fullRes = await client
        .post('/pesan')
        .withInertia()
        .header('Referer', '/pesan')
        .json({
          items: [{ itemKind: ItemKind.SHOE, type: 'Sneakers', size: '41' }],
          pickupAddressId: inside.id,
          deliveryAddressId: inside.id,
          pickupDate: date,
          pickupSlotId: slot.id,
        })
        .withCsrfToken()
        .loginAs(customer)
        .redirects(0)

      fullRes.assertStatus(302)
      fullRes.assertHeader('location', '/pesan')
    })

    test('Pesan lagi prefills own order items and refuses another customer order (CUST-5)', async ({
      client,
      assert,
    }) => {
      const owner = await createUser('6281200000603')
      const other = await createUser('6281200000604')
      const { date, slot } = await firstOpenDateAndSlot()

      const order = await Order.create({
        userId: owner.id,
        status: OrderStatus.COMPLETED,
        pickupDate: DateTime.fromISO(date, { zone: ZONE }),
        pickupSlotId: slot.id,
        pickupStartsAt: slot.startsAt,
        pickupEndsAt: slot.endsAt,
        requestKey: 'repeat-source',
      })
      await OrderItem.create({
        orderId: order.id,
        itemKind: ItemKind.SHOE,
        brand: 'Adidas',
        type: 'Samba',
        size: '43',
      })

      const own = await client.get(`/pesan?ulang=${order.id}`).withInertia().loginAs(owner)
      own.assertStatus(200)
      assert.deepEqual(own.inertiaProps.repeatItems, [
        { itemKind: 'shoe', brand: 'Adidas', type: 'Samba', size: '43' },
      ])

      const stolen = await client.get(`/pesan?ulang=${order.id}`).loginAs(other)
      stolen.assertStatus(404)
    })

    test('GET /pesan/konfirmasi without a draft redirects to /pesan (CUST-6)', async ({
      client,
    }) => {
      const customer = await createUser('6281200000605')
      const response = await client.get('/pesan/konfirmasi').loginAs(customer).redirects(0)
      response.assertStatus(302)
      response.assertHeader('location', '/pesan')
    })
  }
)
