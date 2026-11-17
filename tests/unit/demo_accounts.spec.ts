import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import env from '#start/env'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { formatPhone } from '#helpers/phone'
import { demoAccounts, demoAccountsBanner } from '#database/seeders/user_seeder'

test.group('Demo accounts banner (D79)', (group) => {
  const adminPhoneBefore = env.get('ADMIN_PHONE')

  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.teardown(() => env.set('ADMIN_PHONE', adminPhoneBefore))

  test('the banner shows the owner number the seeders created when ADMIN_PHONE is set', async ({
    assert,
  }) => {
    env.set('ADMIN_PHONE', '081277770000')
    await testUtils.db().seed()

    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    assert.equal(owner.phone, '6281277770000')
    assert.include(demoAccountsBanner(), formatPhone(owner.phone))
  })

  test('every account in the banner exists after seeding', async ({ assert }) => {
    await testUtils.db().seed()

    for (const account of demoAccounts()) {
      const user = await User.findByOrFail('phone', account.phone)
      assert.equal(user.role, account.role)
      assert.equal(user.isActive, account.isActive)
      assert.include(demoAccountsBanner(), formatPhone(account.phone))
    }
  })
})
