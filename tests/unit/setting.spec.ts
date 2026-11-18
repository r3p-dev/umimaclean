import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import SettingService from '#services/setting_service'
import User from '#models/user'
import ActivityLog from '#models/activity_log'
import { Role } from '#enums/role_enum'

test.group('Store Settings & Pickup Slots (OWN-8, SLOT-2)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('reads default store settings and pickup slots successfully', async ({ assert }) => {
    const service = new SettingService()
    const store = await service.getStoreSettings()

    assert.equal(store.name, 'Umima Clean')
    assert.equal(store.whatsapp, '6285157900974')
    assert.isTrue(store.address.includes('Margacinta'))

    const hours = await service.getOpeningHours()
    assert.deepEqual(hours.days[0], { day: 1, isOpen: true, opens: '09:00', closes: '20:00' })
    assert.isFalse(hours.days[6].isOpen)
    assert.deepEqual(hours.closure, { isClosed: false, startsAt: null, endsAt: null, note: null })
  })

  test('updates store settings and logs to activity_logs (OWN-8)', async ({ assert }) => {
    const service = new SettingService()
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()

    const updated = await service.updateStoreSettings(owner, {
      name: 'Umima Clean Workshop',
      whatsapp: '081234567890',
      address: 'Jl. Buahbatu No. 45, Bandung',
    })

    assert.equal(updated.name, 'Umima Clean Workshop')
    assert.equal(updated.whatsapp, '6281234567890') // normalized to E.164
    assert.equal(updated.address, 'Jl. Buahbatu No. 45, Bandung')

    const log = await ActivityLog.query()
      .where('action', 'settings.store.update')
      .orderBy('id', 'desc')
      .first()

    assert.isNotNull(log)
    assert.isTrue(log?.description.includes('Umima Clean Workshop'))
  })

  test('validates on write and rejects malformed phone number or empty fields (OWN-8)', async ({
    assert,
  }) => {
    const service = new SettingService()
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()

    await assert.rejects(
      async () =>
        service.updateStoreSettings(owner, {
          name: '',
          whatsapp: '12345',
          address: 'Jl. Margacinta',
          hours: '09.00–20.00',
        }),
      /validation/i
    )
  })
})
