import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { OrderStatus } from '#enums/order_enum'
import { PaymentStatus } from '#enums/payment_enum'
import Bill from '#models/bill'
import Payment from '#models/payment'
import { DEFAULT_SETTINGS } from '#models/setting'
import { createOrder, inertia, post, useApp } from '#tests/support/app'

test.group('Customer extras', (group) => {
  const state = useApp(group)

  test('a customer cancels before pickup with a reason and the shop is told', async ({
    client,
    assert,
  }) => {
    const customer = await UserFactory.create()
    const order = await createOrder(customer)

    const response = await post(client, `/pesanan/${order.publicCode}/batal`, {
      reason: 'Salah jadwal',
    }).loginAs(customer)

    response.assertHeader('location', `/pesanan/${order.publicCode}`)
    await order.refresh()
    assert.equal(order.status, OrderStatus.CANCELLED)
    assert.equal(order.cancelReason, 'Salah jadwal')
    assert.isTrue(
      state.fonnte.messages.some(
        (message) =>
          message.target === DEFAULT_SETTINGS.store.whatsapp &&
          message.message.includes('dibatalkan pelanggan')
      )
    )
  })

  test('cancelling is refused once the courier has set off, and for other customers', async ({
    client,
    assert,
  }) => {
    const customer = await UserFactory.create()
    const started = await createOrder(customer, { status: OrderStatus.COURIER_EN_ROUTE })
    const refused = await post(client, `/pesanan/${started.publicCode}/batal`, {
      reason: 'Salah jadwal',
    }).loginAs(customer)
    refused.assertStatus(403)

    const other = await createOrder(await UserFactory.create())
    const hidden = await post(client, `/pesanan/${other.publicCode}/batal`, {
      reason: 'Salah jadwal',
    }).loginAs(customer)
    hidden.assertStatus(404)
    await other.refresh()
    assert.equal(other.status, OrderStatus.AWAITING_PICKUP)
  })

  test('a completed order has a receipt with the payment', async ({ client }) => {
    const customer = await UserFactory.create()
    const order = await createOrder(customer, { status: OrderStatus.COMPLETED })
    await Bill.create({ orderId: order.id, total: 55000, decidedBy: null })
    await Payment.create({
      orderId: order.id,
      channel: 'counter',
      method: 'cash',
      status: PaymentStatus.PAID,
      amount: 55000,
      cashReceived: 60000,
    })

    const page = await inertia(client, `/pesanan/${order.publicCode}/struk`).loginAs(customer)
    page.assertInertiaComponent('customer/orders/receipt')
    page.assertInertiaPropsContains({
      receipt: { number: order.publicCode, total: 55000, payment: { change: 5000 } },
    })

    const open = await createOrder(customer)
    const redirected = await inertia(client, `/pesanan/${open.publicCode}/struk`).loginAs(customer)
    redirected.assertHeader('location', `/pesanan/${open.publicCode}`)
  })

  test('terms, privacy, robots.txt and sitemap.xml are public', async ({ client, assert }) => {
    const terms = await inertia(client, '/syarat')
    terms.assertInertiaComponent('legal/terms')
    const privacy = await inertia(client, '/privasi')
    privacy.assertInertiaComponent('legal/privacy')
    const robots = await client.get('/robots.txt')
    assert.include(robots.text(), 'Disallow: /admin')
    assert.include(robots.text(), '/sitemap.xml')
    const sitemap = await client.get('/sitemap.xml')
    assert.include(sitemap.text(), '/syarat')
  })
})
