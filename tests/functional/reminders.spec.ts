import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import { UserFactory } from '#database/factories/user_factory'
import { OrderSource, OrderStatus } from '#enums/order_enum'
import { PaymentChannel, PaymentMethod, PaymentStatus } from '#enums/payment_enum'
import Bill from '#models/bill'
import Payment from '#models/payment'
import ReminderService from '#services/reminder_service'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'
import { createOrder, useApp } from '#tests/support/app'

const at = (value: string) => DateTime.fromISO(value, { zone: SERVICE_ZONE })

async function unpaidBill(billedAt: string, overrides: Record<string, unknown> = {}) {
  const customer = await UserFactory.create()
  const order = await createOrder(customer, { status: OrderStatus.AWAITING_PAYMENT, ...overrides })
  const bill = await Bill.create({
    orderId: order.id,
    total: 55000,
    decidedBy: null,
    createdAt: at(billedAt),
  })
  return { customer, order, bill }
}

test.group('Automatic payment reminders', (group) => {
  const state = useApp(group)
  const remind = async (now: string) => {
    const reminders = await app.container.make(ReminderService)
    return reminders.sendDueReminders(at(now))
  }

  test('the first reminder comes after 24 hours, then one every 2 days', async ({ assert }) => {
    const { customer, order, bill } = await unpaidBill('2026-03-02T11:00')

    assert.equal(await remind('2026-03-03T10:59'), 0)
    assert.equal(await remind('2026-03-03T11:00'), 1)
    assert.equal(await remind('2026-03-03T11:00'), 0)
    assert.equal(await remind('2026-03-03T11:15'), 0)
    await bill.refresh()
    assert.equal(bill.reminderCount, 1)
    assert.equal(bill.lastRemindedAt!.toMillis(), at('2026-03-03T11:00').toMillis())

    assert.equal(await remind('2026-03-04T11:00'), 0)
    assert.equal(await remind('2026-03-05T11:00'), 1)
    assert.equal(await remind('2026-03-07T10:59'), 0)
    assert.equal(await remind('2026-03-07T11:00'), 1)
    await bill.refresh()
    assert.equal(bill.reminderCount, 3)

    const sent = state.fonnte.messages.filter((message) => message.target === customer.phone)
    assert.lengthOf(sent, 3)
    assert.include(sent[0].message, `tagihan pesanan ${order.number()} sebesar Rp55.000`)
    assert.include(sent[0].message, `/pesanan/${order.id}`)
  })

  test('nothing goes out outside 10:00–15:00; the next window sends it', async ({ assert }) => {
    const { bill } = await unpaidBill('2026-03-02T14:30')

    assert.equal(await remind('2026-03-03T15:00'), 0)
    assert.equal(await remind('2026-03-03T22:00'), 0)
    assert.equal(await remind('2026-03-04T09:45'), 0)
    assert.lengthOf(state.fonnte.messages, 0)
    assert.equal(await remind('2026-03-04T10:00'), 1)
    await bill.refresh()
    assert.equal(bill.reminderCount, 1)
  })

  test('paid, cancelled and walk-in orders get no reminder', async ({ assert }) => {
    const paid = await unpaidBill('2026-03-02T11:00')
    await unpaidBill('2026-03-02T11:00', { status: OrderStatus.CANCELLED })
    await unpaidBill('2026-03-02T11:00', { source: OrderSource.STORE })

    assert.equal(await remind('2026-03-03T11:00'), 1)
    await Payment.create({
      orderId: paid.order.id,
      channel: PaymentChannel.ONLINE,
      method: PaymentMethod.QRIS,
      status: PaymentStatus.PAID,
      amount: 55000,
      paidAt: at('2026-03-03T12:00'),
    })
    await paid.order.merge({ status: OrderStatus.IN_CLEANING }).save()

    assert.equal(await remind('2026-03-05T11:00'), 0)
    assert.deepEqual(
      state.fonnte.messages.map((message) => message.target),
      [paid.customer.phone]
    )
  })

  test('a failed send is not counted and the next run tries again', async ({ assert }) => {
    const { bill } = await unpaidBill('2026-03-02T11:00')

    state.fonnte.shouldFail = true
    assert.equal(await remind('2026-03-03T11:00'), 0)
    state.fonnte.shouldFail = false
    state.fonnte.shouldThrow = true
    assert.equal(await remind('2026-03-03T11:15'), 0)
    await bill.refresh()
    assert.equal(bill.reminderCount, 0)
    assert.isNull(bill.lastRemindedAt)

    state.fonnte.shouldThrow = false
    assert.equal(await remind('2026-03-03T11:30'), 1)
    await bill.refresh()
    assert.equal(bill.reminderCount, 1)
  })

  test('reminders never create payments or call Midtrans', async ({ assert }) => {
    const { order } = await unpaidBill('2026-03-02T11:00')

    assert.equal(await remind('2026-03-03T11:00'), 1)
    assert.lengthOf(await Payment.query().where('order_id', order.id), 0)
    assert.lengthOf(state.gateway.charges, 0)
  })

  test('the orders:remind-payment command runs', async () => {
    const ace = await app.container.make('ace')
    const command = await ace.exec('orders:remind-payment', [])
    command.assertSucceeded()
  })
})
