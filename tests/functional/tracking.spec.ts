import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { OrderFactory } from '#database/factories/order_factory'
import { OrderSource } from '#enums/order_enum'
import { inertia, post, useApp } from '#tests/support/app'

function walkInOrder() {
  return OrderFactory.merge({
    userId: null,
    source: OrderSource.STORE,
    customerName: 'Andi Pratama',
    customerPhone: '6281377778888',
    pickupDate: null,
    pickupSlot: null,
  }).create()
}

test.group('Order tracking without an account', (group) => {
  useApp(group)

  test('the right last 4 digits open the order for this session only', async ({
    client,
    assert,
  }) => {
    const order = await walkInOrder()

    const locked = await inertia(client, `/pesanan/${order.id}`)
    locked.assertInertiaComponent('customer/orders/unlock')
    locked.assertInertiaPropsContains({ id: order.id, number: order.number() })
    assert.notProperty(locked.inertiaProps, 'order')

    const unlocked = await post(client, `/pesanan/${order.id}/buka`, { digits: '8888' })
    unlocked.assertStatus(302)

    const page = await inertia(client, `/pesanan/${order.id}`, unlocked.session())
    page.assertInertiaComponent('customer/orders/show')
    page.assertInertiaPropsContains({ order: { number: order.number() }, isOwner: false })

    const bill = await inertia(client, `/pesanan/${order.id}/tagihan`, unlocked.session())
    bill.assertInertiaComponent('customer/payment/bill')

    const fresh = await inertia(client, `/pesanan/${order.id}`)
    fresh.assertInertiaComponent('customer/orders/unlock')

    const pay = await client
      .get(`/pesanan/${order.id}/bayar`)
      .withSession(unlocked.session())
      .redirects(0)
    pay.assertStatus(302)
    pay.assertHeader('location', '/masuk')
  })

  test('wrong digits are refused and keep the order closed', async ({ client, assert }) => {
    const order = await walkInOrder()

    const wrong = await post(client, `/pesanan/${order.id}/buka`, { digits: '1234' })
    wrong.assertStatus(422)
    wrong.assertBodyContains({ errors: [{ field: 'digits', rule: 'tracking.mismatch' }] })

    const page = await inertia(client, `/pesanan/${order.id}`, wrong.session())
    page.assertInertiaComponent('customer/orders/unlock')
    assert.notProperty(page.inertiaProps, 'order')

    const malformed = await post(client, `/pesanan/${order.id}/buka`, { digits: '88' })
    malformed.assertBodyContains({
      errors: [{ field: 'digits', message: 'Isi 4 digit terakhir nomor WhatsApp pemesan.' }],
    })
  })

  test('after 5 wrong tries even the right digits wait 15 minutes', async ({ client }) => {
    const order = await walkInOrder()

    for (let attempt = 0; attempt < 5; attempt++) {
      const wrong = await post(client, `/pesanan/${order.id}/buka`, { digits: '0000' })
      wrong.assertBodyContains({ errors: [{ rule: 'tracking.mismatch' }] })
    }

    const blocked = await post(client, `/pesanan/${order.id}/buka`, { digits: '8888' })
    blocked.assertStatus(422)
    blocked.assertBodyContains({ errors: [{ field: 'digits', rule: 'tracking.throttled' }] })
  })

  test('the signed-in owner sees the order without the digits', async ({ client }) => {
    const owner = await UserFactory.create()
    const order = await OrderFactory.merge({
      userId: owner.id,
      customerName: owner.name,
      customerPhone: owner.phone,
    }).create()

    const page = await inertia(client, `/pesanan/${order.id}`).loginAs(owner)
    page.assertInertiaComponent('customer/orders/show')
    page.assertInertiaPropsContains({ isOwner: true })
  })

  test('an order that does not exist answers 404', async ({ client }) => {
    const response = await client.get('/pesanan/999999')
    response.assertStatus(404)
  })
})
