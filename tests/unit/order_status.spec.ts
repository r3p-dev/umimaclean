import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { ORDER_TRANSITIONS, OrderStatus } from '#enums/order_status_enum'
import { Role } from '#enums/role_enum'
import ActivityLog from '#models/activity_log'
import Order from '#models/order'
import OrderEvent from '#models/order_event'
import User from '#models/user'
import OrderService from '#services/order_service'

const STATUSES = Object.values(OrderStatus)

function createUser(phone: string, role: Role) {
  return User.create({
    fullName: 'Pengguna Uji',
    phone,
    password: 'password123',
    role,
    isActive: true,
  })
}

let requestCount = 0
function createOrder(customer: User, status: OrderStatus) {
  requestCount += 1
  return Order.create({
    userId: customer.id,
    status,
    pickupDate: DateTime.fromISO('2030-01-08'),
    pickupStartsAt: '09:00',
    pickupEndsAt: '12:00',
    requestKey: `status-test-${requestCount}`,
  })
}

test.group('Order status machine (ORD-2, ORD-3, ORD-4)', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('every allowed pair changes the status; every other pair is refused with 409', async ({
    assert,
  }) => {
    const service = await app.container.make(OrderService)
    const customer = await createUser('6281200000501', Role.CUSTOMER)
    const results: string[] = []

    for (const from of STATUSES) {
      for (const to of STATUSES) {
        const order = await createOrder(customer, from)
        const isAllowed = ORDER_TRANSITIONS[from].includes(to)
        try {
          await db.transaction((transaction) =>
            service.transitionOrder(order, to, { actor: null }, transaction)
          )
          await order.refresh()
          assert.equal(order.status, to, `${from} → ${to}`)
          results.push(`${from}→${to}:${isAllowed ? 'ok' : 'WRONGLY ALLOWED'}`)
        } catch (error) {
          assert.equal((error as { status?: number }).status, 409, `${from} → ${to}`)
          await order.refresh()
          assert.equal(order.status, from, `${from} → ${to} kept its status`)
          results.push(`${from}→${to}:${isAllowed ? 'WRONGLY REFUSED' : 'refused'}`)
        }
      }
    }

    assert.lengthOf(results, STATUSES.length * STATUSES.length)
    assert.deepEqual(
      results.filter((result) => result.includes('WRONGLY')),
      []
    )
    assert.lengthOf(
      results.filter((result) => result.endsWith(':ok')),
      Object.values(ORDER_TRANSITIONS).flat().length
    )
  })

  test('every status but the two final ones can be cancelled; a skipped pickup goes back', async ({
    assert,
  }) => {
    for (const status of STATUSES) {
      const canCancel = ORDER_TRANSITIONS[status].includes(OrderStatus.CANCELLED)
      const isFinal = status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED
      assert.equal(canCancel, !isFinal, status)
    }
    assert.deepEqual(ORDER_TRANSITIONS[OrderStatus.COURIER_EN_ROUTE], [
      OrderStatus.PICKED_UP,
      OrderStatus.AWAITING_PICKUP,
      OrderStatus.CANCELLED,
    ])
  })

  test('a change appends its event with actor and note; staff changes go to the activity log', async ({
    assert,
  }) => {
    const service = await app.container.make(OrderService)
    const customer = await createUser('6281200000502', Role.CUSTOMER)
    const staff = await createUser('6281200000503', Role.STAFF)
    const order = await createOrder(customer, OrderStatus.AWAITING_PICKUP)

    await db.transaction((transaction) =>
      service.transitionOrder(order, OrderStatus.COURIER_EN_ROUTE, { actor: staff }, transaction)
    )
    await db.transaction((transaction) =>
      service.transitionOrder(
        order,
        OrderStatus.AWAITING_PICKUP,
        { actor: staff, note: 'Rumah kosong' },
        transaction
      )
    )

    const events = await OrderEvent.query().where('order_id', order.id).orderBy('id')
    assert.deepEqual(
      events.map((event) => [event.status, event.actorId, event.note]),
      [
        [OrderStatus.COURIER_EN_ROUTE, staff.id, null],
        [OrderStatus.AWAITING_PICKUP, staff.id, 'Rumah kosong'],
      ]
    )
    const logs = await ActivityLog.query().where('user_id', staff.id).orderBy('id')
    assert.deepEqual(
      logs.map((log) => log.description),
      [`${order.number()}: Kurir Menuju Lokasi`, `${order.number()}: Menunggu Penjemputan`]
    )
  })

  test('a refused change says why in Indonesian and writes nothing', async ({ assert }) => {
    const service = await app.container.make(OrderService)
    const customer = await createUser('6281200000504', Role.CUSTOMER)
    const order = await createOrder(customer, OrderStatus.COMPLETED)

    await assert.rejects(
      () =>
        db.transaction((transaction) =>
          service.transitionOrder(order, OrderStatus.CANCELLED, { actor: customer }, transaction)
        ),
      `Pesanan ${order.number()} tidak bisa diubah dari "Selesai" ke "Dibatalkan".`
    )
    assert.lengthOf(await OrderEvent.query().where('order_id', order.id), 0)
  })

  test('the order number is the id, zero-padded (ORD-1)', async ({ assert }) => {
    const order = new Order()
    order.id = 42
    assert.equal(order.number(), 'UMC-00042')
    order.id = 123456
    assert.equal(order.number(), 'UMC-123456')
  })
})
