import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import ActivityLog from '#models/activity_log'
import PickupSlot from '#models/pickup_slot'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import PickupSlotService from '#services/pickup_slot_service'
import SettingService from '#services/setting_service'
import { DateTime } from 'luxon'
import { OrderStatus } from '#enums/order_status_enum'
import { ZONE } from '#helpers/opening_hours'
import Order from '#models/order'
import Setting from '#models/setting'
import { validationMessagesOf } from '../helpers/validation.js'

async function countOn(weekday: number) {
  const slots = await PickupSlot.query().where('weekday', weekday)
  return slots.length
}

test.group('Pickup slots per weekday (SLOT-2, D106)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('the seed gives every open day the three default slots and Sunday none', async ({
    assert,
  }) => {
    const service = await app.container.make(PickupSlotService)
    const monday = await service.forWeekday(1)
    assert.deepEqual(
      monday.map((slot) => [slot.startsAt, slot.endsAt, slot.capacity, slot.isActive]),
      [
        ['09:00', '12:00', 6, true],
        ['12:00', '15:00', 6, true],
        ['15:00', '18:00', 4, true],
      ]
    )
    assert.lengthOf(await service.forWeekday(7), 0)
    assert.deepEqual([...(await service.weekdaysWithActiveSlots())].sort(), [1, 2, 3, 4, 5, 6])
  })

  test('saving a day updates listed slots, creates new ones and deletes missing ones', async ({
    assert,
  }) => {
    const service = await app.container.make(PickupSlotService)
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const [morning, noon] = await service.forWeekday(2)

    await service.replaceDay(owner, 2, [
      { id: morning.id, startsAt: '08:00', endsAt: '11:00', capacity: 3, isActive: false },
      { id: noon.id, startsAt: '12:00', endsAt: '15:00', capacity: 6, isActive: true },
      { startsAt: '18:00', endsAt: '20:00', capacity: 2, isActive: true },
    ])

    const tuesday = await service.forWeekday(2)
    assert.deepEqual(
      tuesday.map((slot) => [slot.startsAt, slot.endsAt, slot.capacity, slot.isActive]),
      [
        ['08:00', '11:00', 3, false],
        ['12:00', '15:00', 6, true],
        ['18:00', '20:00', 2, true],
      ]
    )
    assert.equal(tuesday[0].id, morning.id)
    assert.lengthOf(await service.forWeekday(1), 3)
    const log = await ActivityLog.findByOrFail('action', 'settings.slots.update')
    assert.equal(log.description, 'Memperbarui slot penjemputan Selasa (3 slot)')
  })

  test('copying a day replaces the slots of every other open day only', async ({ assert }) => {
    const service = await app.container.make(PickupSlotService)
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    await service.replaceDay(owner, 1, [
      { startsAt: '10:00', endsAt: '13:00', capacity: 5, isActive: true },
    ])

    const targets = await service.copyDay(owner, 1, [1, 3, 5])

    assert.deepEqual(targets, [3, 5])
    for (const weekday of [3, 5]) {
      const slots = await service.forWeekday(weekday)
      assert.deepEqual(
        slots.map((slot) => [slot.startsAt, slot.endsAt, slot.capacity]),
        [['10:00', '13:00', 5]]
      )
    }
    assert.lengthOf(await service.forWeekday(2), 3)
    assert.equal(await countOn(1), 1)
  })

  test('a day with only switched-off slots has no active slot (SLOT-1)', async ({ assert }) => {
    await PickupSlot.query().where('weekday', 4).update({ isActive: false })
    const service = await app.container.make(PickupSlotService)
    const days = await service.weekdaysWithActiveSlots()
    assert.isFalse(days.has(4))
  })
})

// Monday 7 January 2030, 10.00 in Jakarta: far from today, so no real order meets these dates.
const NOW = DateTime.fromISO('2030-01-07T10:00', { zone: ZONE })

let orderCount = 0
async function createOrder(slot: PickupSlot, date: string, status: OrderStatus) {
  const customer = await User.query().where('role', Role.CUSTOMER).firstOrFail()
  orderCount += 1
  return Order.create({
    userId: customer.id,
    status,
    pickupDate: DateTime.fromISO(date),
    pickupSlotId: slot.id,
    pickupStartsAt: slot.startsAt,
    pickupEndsAt: slot.endsAt,
    requestKey: `slot-test-${orderCount}`,
  })
}

function slotFields(slot: PickupSlot) {
  return {
    id: slot.id,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    capacity: slot.capacity,
    isActive: slot.isActive,
  }
}

// The next date after today that falls on `weekday`, as "2026-11-27".
function nextDateOn(weekday: number) {
  let date = DateTime.now().setZone(ZONE).plus({ days: 1 })
  while (date.weekday !== weekday) {
    date = date.plus({ days: 1 })
  }
  return date.toISODate()!
}

test.group('Pickup dates and places (SLOT-1, SLOT-3, M5a decision 1)', (group) => {
  group.each.setup(async () => {
    const rollback = await testUtils.db().wrapInGlobalTransaction()
    await testUtils.db().seed()
    return rollback
  })

  test('dates run from tomorrow to 7 days ahead, without Sunday or a closed day (SLOT-1)', async ({
    assert,
  }) => {
    const service = await app.container.make(PickupSlotService)
    assert.deepEqual(await service.listPickupDates(NOW), [
      '2030-01-08',
      '2030-01-09',
      '2030-01-10',
      '2030-01-11',
      '2030-01-12',
      '2030-01-14',
    ])

    await PickupSlot.query().where('weekday', 3).update({ isActive: false })
    const settings = await app.container.make(SettingService)
    const hours = await settings.getOpeningHours()
    await Setting.updateOrCreate(
      { key: 'opening_hours' },
      {
        value: {
          ...hours,
          closure: {
            isClosed: true,
            startsAt: '2030-01-10T00:00',
            endsAt: '2030-01-11T10:00',
            note: null,
          },
        },
      }
    )
    assert.deepEqual(await service.listPickupDates(NOW), ['2030-01-08', '2030-01-12', '2030-01-14'])
  })

  test("a date's slots count the places taken; full or switched-off slots cannot be chosen (SLOT-3)", async ({
    assert,
  }) => {
    const service = await app.container.make(PickupSlotService)
    const [morning, noon, afternoon] = await service.forWeekday(2)
    await morning.merge({ capacity: 2 }).save()
    await afternoon.merge({ isActive: false }).save()
    await createOrder(morning, '2030-01-08', OrderStatus.AWAITING_PICKUP)
    await createOrder(morning, '2030-01-08', OrderStatus.PICKED_UP)
    await createOrder(noon, '2030-01-08', OrderStatus.CANCELLED)
    await createOrder(noon, '2030-01-15', OrderStatus.AWAITING_PICKUP)

    const slots = await service.listSlotsForDate('2030-01-08')
    assert.deepEqual(
      slots.map(({ slot, taken, isAvailable }) => [slot.startsAt, taken, isAvailable]),
      [
        ['09:00', 2, false],
        ['12:00', 0, true],
        ['15:00', 0, false],
      ]
    )
  })

  test('a slot with a pending pickup cannot be deleted or re-timed, only switched off or resized (decision 1)', async ({
    assert,
  }) => {
    const service = await app.container.make(PickupSlotService)
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const weekday = 2
    const [morning, noon, afternoon] = await service.forWeekday(weekday)
    await createOrder(morning, nextDateOn(weekday), OrderStatus.AWAITING_PICKUP)
    const expected = [
      {
        field: 'slots',
        message:
          'Slot Selasa 09.00–12.00 masih punya pesanan yang belum dijemput. Slot itu hanya bisa dimatikan atau diubah kapasitasnya.',
        rule: 'slotHasOrders',
      },
    ]

    assert.deepEqual(
      await validationMessagesOf(() =>
        service.replaceDay(owner, weekday, [slotFields(noon), slotFields(afternoon)])
      ),
      expected
    )
    assert.deepEqual(
      await validationMessagesOf(() =>
        service.replaceDay(owner, weekday, [
          { ...slotFields(morning), endsAt: '11:00' },
          slotFields(noon),
          slotFields(afternoon),
        ])
      ),
      expected
    )

    await service.replaceDay(owner, weekday, [
      { ...slotFields(morning), capacity: 1, isActive: false },
      slotFields(noon),
    ])
    const kept = await service.forWeekday(weekday)
    assert.deepEqual(
      kept.map((slot) => [slot.startsAt, slot.capacity, slot.isActive]),
      [
        ['09:00', 1, false],
        ['12:00', 6, true],
      ]
    )
  })

  test('copying over a day with a pending pickup is refused; past or cancelled orders do not block (decision 1)', async ({
    assert,
  }) => {
    const service = await app.container.make(PickupSlotService)
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const [wednesday] = await service.forWeekday(3)
    const [thursday] = await service.forWeekday(4)
    await createOrder(wednesday, '2026-01-07', OrderStatus.AWAITING_PICKUP)
    await createOrder(thursday, nextDateOn(4), OrderStatus.CANCELLED)

    await service.copyDay(owner, 1, [1, 2, 3, 4, 5, 6])

    const [tuesday] = await service.forWeekday(2)
    await createOrder(tuesday, nextDateOn(2), OrderStatus.COURIER_EN_ROUTE)
    const messages = await validationMessagesOf(() => service.copyDay(owner, 1, [1, 2, 3, 4, 5, 6]))
    assert.equal(messages[0].field, 'params.weekday')
    assert.equal(messages[0].rule, 'slotHasOrders')
  })
})
