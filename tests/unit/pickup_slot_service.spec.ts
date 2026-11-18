import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import ActivityLog from '#models/activity_log'
import PickupSlot from '#models/pickup_slot'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import PickupSlotService from '#services/pickup_slot_service'

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
    const service = new PickupSlotService()
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
    const service = new PickupSlotService()
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
    const service = new PickupSlotService()
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
    const days = await new PickupSlotService().weekdaysWithActiveSlots()
    assert.isFalse(days.has(4))
  })
})
