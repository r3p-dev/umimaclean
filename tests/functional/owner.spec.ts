import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { UserFactory } from '#database/factories/user_factory'
import { ActivityAction } from '#enums/activity_enum'
import { OrderStatus } from '#enums/order_enum'
import { PaymentStatus } from '#enums/payment_enum'
import ActivityLog from '#models/activity_log'
import Bill from '#models/bill'
import Order from '#models/order'
import Payment from '#models/payment'
import User from '#models/user'
import { DEFAULT_SETTINGS } from '#services/settings_service'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'
import {
  createOrder,
  inertia,
  orderPayload,
  post,
  savedAddress,
  seedCatalogue,
  send,
  TURNSTILE_TOKEN,
  useApp,
} from '#tests/support/app'

test.group('Owner tools', (group) => {
  const state = useApp(group)

  test('cancelling tells the customer and says so only when WhatsApp went out', async ({
    client,
    assert,
  }) => {
    const owner = await UserFactory.apply('admin').create()
    const customer = await UserFactory.create()
    const order = await createOrder(customer, { status: OrderStatus.PICKED_UP })

    const response = await post(client, '/admin/pesanan/batal', {
      codes: [order.publicCode],
      reason: 'Permintaan pelanggan',
    }).loginAs(owner)

    await order.refresh()
    assert.equal(order.status, OrderStatus.CANCELLED)
    assert.equal(order.cancelReason, 'Permintaan pelanggan')
    assert.isTrue(state.fonnte.messages.some((message) => message.target === customer.phone))
    assert.include(String(response.flashMessages().success), 'Pelanggan diberi tahu via WhatsApp')
    const log = await ActivityLog.query().where('action', ActivityAction.ORDER_CANCELLED).first()
    assert.isTrue(log?.isSensitive)

    state.fonnte.shouldFail = true
    const second = await createOrder(customer)
    const failed = await post(client, '/admin/pesanan/batal', {
      codes: [second.publicCode],
      reason: 'Di luar area layanan',
    }).loginAs(owner)
    assert.notInclude(String(failed.flashMessages().success), 'diberi tahu')
  })

  test('a payment recorded by the owner moves the order to washing and is logged', async ({
    client,
    assert,
  }) => {
    const owner = await UserFactory.apply('admin').create()
    const order = await createOrder(await UserFactory.create(), {
      status: OrderStatus.AWAITING_PAYMENT,
    })
    await Bill.create({ orderId: order.id, total: 80000, decidedBy: null })

    await post(client, `/admin/pesanan/${order.publicCode}/pembayaran`, {
      method: 'cash',
      amount: 80000,
      reason: 'Dibayar tunai di toko',
    }).loginAs(owner)

    await order.refresh()
    assert.equal(order.status, OrderStatus.IN_CLEANING)
    const payment = await Payment.query().where('order_id', order.id).firstOrFail()
    assert.equal(payment.status, PaymentStatus.PAID)
    assert.equal(payment.recordedBy, owner.id)
    const log = await ActivityLog.query()
      .where('action', ActivityAction.PAYMENT_CORRECTED)
      .firstOrFail()
    assert.isTrue(log.isSensitive)
  })

  test('the owner creates a staff login, resets it and deactivation ends every session', async ({
    client,
    assert,
  }) => {
    const owner = await UserFactory.apply('admin').create()

    const created = await post(client, '/admin/pengaturan', {
      name: 'Agus Firmansyah',
      phone: '0857 1122 3344',
      role: 'Kurir & toko',
      shift: 'Pagi',
    }).loginAs(owner)
    const staff = await User.findByOrFail('phone', '6285711223344')
    assert.equal(staff.role, 'staff')
    assert.equal(staff.staffType, 'courier_store')
    const notice = created.flashMessages().staff_password as { password: string }
    assert.isTrue(await staff.verifyPassword(notice.password))
    assert.isTrue(state.fonnte.messages.some((message) => message.target === staff.phone))

    await User.rememberMeTokens.create(staff, '180 days')
    await post(client, `/admin/pengaturan/${staff.id}/aktif`, { active: false }).loginAs(owner)
    await staff.refresh()
    assert.isFalse(staff.isActive)
    assert.lengthOf(await User.rememberMeTokens.all(staff), 0)

    const login = await send(client, 'post', '/staf/masuk', {
      phone: '085711223344',
      password: notice.password,
      turnstile: TURNSTILE_TOKEN,
    })
    login.assertBodyContains({ errors: [{ rule: 'login.invalid' }] })

    const blocked = await inertia(client, '/staf').loginAs(staff)
    blocked.assertHeader('location', '/staf/masuk')
  })

  test('a price edit is used by the next inspection and on the landing page', async ({
    client,
    assert,
  }) => {
    const owner = await UserFactory.apply('admin').create()
    const staff = await UserFactory.apply('staff').create()
    const [deepClean] = await seedCatalogue()

    await send(client, 'put', `/admin/layanan/${deepClean.id}`, {
      name: 'Deep Clean',
      type: 'utama',
      categories: ['Sepatu'],
      price: 52000,
      days: 3,
      active: true,
    }).loginAs(owner)

    const landing = await inertia(client, '/')
    const prices = landing.inertiaProps as { prices: { main: { name: string; price: number }[] }[] }
    assert.isTrue(prices.prices[0].main.some((entry) => entry.price === 52000))

    const order = await createOrder(await UserFactory.create(), { status: OrderStatus.PICKED_UP })
    await post(client, `/staf/proses/${order.publicCode}/periksa/mulai`).loginAs(staff)
    await post(client, `/staf/proses/${order.publicCode}/periksa`, {
      items: [{ kind: 'shoe', name: 'Sepatu', services: { main: deepClean.id, addons: [] } }],
    }).loginAs(staff)
    const bill = await Bill.findByOrFail('order_id', order.id)
    assert.equal(bill.total, 52000)
  })

  test('slot capacity and closed slots set in Toko are enforced at booking', async ({ client }) => {
    const owner = await UserFactory.apply('admin').create()
    const customer = await UserFactory.create()
    const address = await savedAddress(customer, { isPrimary: true })
    const payload = orderPayload(address.id, { slot: 0 })

    await send(client, 'put', '/admin/pengaturan/toko', {
      name: DEFAULT_SETTINGS.store.name,
      whatsapp: '085157900974',
      address: DEFAULT_SETTINGS.store.address,
      hours: DEFAULT_SETTINGS.store.hours,
      areas: [{ city: 'Kota Bandung', districts: null }],
      slots: [
        { label: '09.00–12.00', capacity: 1, on: true },
        { label: '12.00–15.00', capacity: 6, on: false },
        { label: '15.00–18.00', capacity: 4, on: true },
      ],
      payments: { qris: true, cash: true, edc: true },
      inactiveDays: 60,
    }).loginAs(owner)

    await createOrder(await UserFactory.create(), {
      pickupDate: DateTime.fromISO(payload.date, { zone: SERVICE_ZONE }),
      pickupSlot: 0,
    })
    const full = await post(client, '/pesan/tinjau', payload).loginAs(customer)
    full.assertBodyContains({ errors: [{ rule: 'slot.full' }] })
    const closed = await post(client, '/pesan/tinjau', { ...payload, slot: 1 }).loginAs(customer)
    closed.assertBodyContains({ errors: [{ rule: 'slot.closed' }] })
  })

  test('the service area edited in Toko is used by the server check', async ({ client }) => {
    const owner = await UserFactory.apply('admin').create()
    const customer = await UserFactory.create()

    await send(client, 'put', '/admin/pengaturan/toko', {
      name: DEFAULT_SETTINGS.store.name,
      whatsapp: '085157900974',
      address: DEFAULT_SETTINGS.store.address,
      hours: DEFAULT_SETTINGS.store.hours,
      areas: [{ city: 'Kota Bandung', districts: ['Sukajadi'] }],
      slots: DEFAULT_SETTINGS.pickup_slots,
      payments: { qris: true, cash: true, edc: true },
      inactiveDays: 60,
    }).loginAs(owner)

    const outside = await post(client, '/profil/alamat', {
      label: 'Rumah',
      recipientName: customer.name,
      addressText: 'Jl. Dipati Ukur No. 35, Coblong, Kota Bandung',
      point: { lat: -6.89, lng: 107.61 },
    }).loginAs(customer)
    outside.assertBodyContains({ errors: [{ rule: 'area.outside' }] })
  })

  test('owner bulk status changes only take the next legal step', async ({ client, assert }) => {
    const owner = await UserFactory.apply('admin').create()
    const customer = await UserFactory.create()
    const pickedUp = await createOrder(customer, { status: OrderStatus.PICKED_UP })
    const awaiting = await createOrder(customer, { status: OrderStatus.AWAITING_PAYMENT })

    await post(client, '/admin/pesanan/status', {
      codes: [pickedUp.publicCode, awaiting.publicCode],
      phase: 'periksa',
    }).loginAs(owner)
    await post(client, '/admin/pesanan/status', {
      codes: [awaiting.publicCode],
      phase: 'cuci',
    }).loginAs(owner)

    await pickedUp.refresh()
    await awaiting.refresh()
    assert.equal(pickedUp.status, OrderStatus.IN_INSPECTION)
    assert.equal(awaiting.status, OrderStatus.AWAITING_PAYMENT)
  })

  test('reminders go out once a week per customer', async ({ client, assert }) => {
    const owner = await UserFactory.apply('admin').create()
    const customer = await UserFactory.create()

    const message = 'Halo {nama}, sudah lama tidak mencuci sepatu di Umima.'
    await post(client, '/admin/pelanggan/pengingat', { ids: [customer.id], message }).loginAs(owner)
    const second = await post(client, '/admin/pelanggan/pengingat', {
      ids: [customer.id],
      message,
    }).loginAs(owner)

    const sent = state.fonnte.messages.filter((entry) => entry.target === customer.phone)
    assert.lengthOf(sent, 1)
    assert.include(sent[0].message, customer.firstName())
    assert.include(String(second.flashMessages().error), 'dilewati')
  })

  test('staff cannot use owner actions', async ({ client, assert }) => {
    const staff = await UserFactory.apply('staff').create()
    const order = await createOrder(await UserFactory.create())
    const response = await post(client, '/admin/pesanan/batal', {
      codes: [order.publicCode],
      reason: 'Coba-coba',
    }).loginAs(staff)
    response.assertHeader('location', '/staf')
    await order.refresh()
    assert.equal(order.status, OrderStatus.AWAITING_PICKUP)
    assert.isNull(await Order.query().where('status', OrderStatus.CANCELLED).first())
  })
})
