import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import app from '@adonisjs/core/services/app'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/user'
import ActivityLog from '#models/activity_log'
import AccountService, {
  INACTIVE_ACCOUNT_MESSAGE,
  SIGN_IN_FAILED_MESSAGE,
  SIGN_IN_MAX_PHONE_FAILURES,
} from '#services/account_service'
import { Role } from '#enums/role_enum'
import { validationMessagesOf } from '../helpers/validation.js'

const IP = '198.51.100.10'

function createUser(phone: string, role: Role = Role.CUSTOMER, isActive = true) {
  return User.create({
    fullName: 'Rina Wulandari',
    phone,
    password: 'secretpassword',
    role,
    isActive,
  })
}

test.group('AccountService', (group) => {
  group.each.setup(async () => {
    await limiter.clear(['memory'])
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('verifies customer credentials for an active customer (ACC-3)', async ({ assert }) => {
    await createUser('6282111223344')
    const service = await app.container.make(AccountService)

    const user = await service.verifyCustomerCredentials(
      { phone: '6282111223344', password: 'secretpassword' },
      IP
    )

    assert.equal(user.phone, '6282111223344')
  })

  test('refuses a wrong password with the generic message (ACC-3)', async ({ assert }) => {
    await createUser('6282111223344')
    const service = await app.container.make(AccountService)

    const messages = await validationMessagesOf(() =>
      service.verifyCustomerCredentials({ phone: '6282111223344', password: 'wrongpassword' }, IP)
    )

    assert.deepEqual(messages[0], {
      field: 'phone',
      message: SIGN_IN_FAILED_MESSAGE,
      rule: 'credentials',
    })
  })

  test('refuses an inactive account (ACC-3)', async ({ assert }) => {
    await createUser('6287812345670', Role.CUSTOMER, false)
    const service = await app.container.make(AccountService)

    const messages = await validationMessagesOf(() =>
      service.verifyCustomerCredentials({ phone: '6287812345670', password: 'secretpassword' }, IP)
    )

    assert.equal(messages[0].message, INACTIVE_ACCOUNT_MESSAGE)
  })

  test('points staff to the staff sign-in and customers to the customer sign-in', async ({
    assert,
  }) => {
    await createUser('6281387654321', Role.STAFF)
    await createUser('6282111223344', Role.CUSTOMER)
    const service = await app.container.make(AccountService)

    const staffAtCustomer = await validationMessagesOf(() =>
      service.verifyCustomerCredentials({ phone: '6281387654321', password: 'secretpassword' }, IP)
    )
    const customerAtStaff = await validationMessagesOf(() =>
      service.verifyStaffCredentials({ phone: '6282111223344', password: 'secretpassword' }, IP)
    )

    assert.equal(
      staffAtCustomer[0].message,
      'Akun staf dan pemilik silakan masuk melalui halaman masuk staf.'
    )
    assert.equal(
      customerAtStaff[0].message,
      'Akun pelanggan silakan masuk melalui halaman masuk pelanggan.'
    )
  })

  test('verifies staff and owner credentials (STAFF-1)', async ({ assert }) => {
    await createUser('6281312345678', Role.STAFF)
    await createUser('6281298765432', Role.ADMIN)
    const service = await app.container.make(AccountService)

    const staff = await service.verifyStaffCredentials(
      { phone: '6281312345678', password: 'secretpassword' },
      IP
    )
    const owner = await service.verifyStaffCredentials(
      { phone: '6281298765432', password: 'secretpassword' },
      IP
    )

    assert.equal(staff.role, Role.STAFF)
    assert.equal(owner.role, Role.ADMIN)
  })

  test('blocks a number after 5 wrong passwords, even with the right one (ACC-3)', async ({
    assert,
  }) => {
    await createUser('6282111223344')
    const service = await app.container.make(AccountService)

    for (let attempt = 0; attempt < SIGN_IN_MAX_PHONE_FAILURES; attempt++) {
      await validationMessagesOf(() =>
        service.verifyCustomerCredentials({ phone: '6282111223344', password: 'wrong' }, IP)
      )
    }

    const messages = await validationMessagesOf(() =>
      service.verifyCustomerCredentials({ phone: '6282111223344', password: 'secretpassword' }, IP)
    )
    assert.equal(messages[0].rule, 'throttle')
    assert.match(
      messages[0].message,
      /^Terlalu banyak percobaan masuk\. Coba lagi dalam \d+ menit\.$/
    )
  })

  test('a successful sign-in clears the number counter but not the IP counter (ACC-3)', async ({
    assert,
  }) => {
    await createUser('6282111223344')
    const service = await app.container.make(AccountService)

    for (let attempt = 0; attempt < SIGN_IN_MAX_PHONE_FAILURES - 1; attempt++) {
      await validationMessagesOf(() =>
        service.verifyCustomerCredentials({ phone: '6282111223344', password: 'wrong' }, IP)
      )
    }
    await service.verifyCustomerCredentials(
      { phone: '6282111223344', password: 'secretpassword' },
      IP
    )

    const phoneState = await limiter
      .use({ requests: 5, duration: '15 mins' })
      .get('sign_in_phone_6282111223344')
    const ipState = await limiter.use({ requests: 50, duration: '15 mins' }).get(`sign_in_ip_${IP}`)
    assert.isNull(phoneState)
    assert.equal(ipState?.consumed, SIGN_IN_MAX_PHONE_FAILURES - 1)
  })

  test('changePassword refuses a wrong current password and blocks after 5 failures (ACC-4)', async ({
    assert,
  }) => {
    const user = await createUser('6282111223344')
    const service = await app.container.make(AccountService)

    const wrong = await validationMessagesOf(() =>
      service.changePassword(user, 'wrong', 'newpassword123')
    )
    assert.deepEqual(wrong[0], {
      field: 'currentPassword',
      message: 'Kata sandi saat ini salah.',
      rule: 'credentials',
    })

    for (let attempt = 1; attempt < 5; attempt++) {
      await validationMessagesOf(() => service.changePassword(user, 'wrong', 'newpassword123'))
    }
    const blocked = await validationMessagesOf(() =>
      service.changePassword(user, 'secretpassword', 'newpassword123')
    )
    assert.equal(blocked[0].rule, 'throttle')
    assert.match(blocked[0].message, /^Terlalu banyak percobaan\. Coba lagi dalam \d+ menit\.$/)
  })

  test('changePassword stores the new password (ACC-4)', async ({ assert }) => {
    const user = await createUser('6282111223344')
    const service = await app.container.make(AccountService)

    await service.changePassword(user, 'secretpassword', 'newpassword123')

    const verified = await User.verifyCredentials('6282111223344', 'newpassword123')
    assert.equal(verified.id, user.id)
  })

  test('signOutOtherDevices keeps only the current device remember-me token (ACC-4)', async ({
    assert,
  }) => {
    const user = await createUser('6282111223344')
    const current = await User.rememberMeTokens.create(user, '180d')
    await User.rememberMeTokens.create(user, '180d')
    const service = await app.container.make(AccountService)

    await service.signOutOtherDevices(user, {
      sessionId: 'current-session',
      rememberMeToken: current.value!.release(),
    })

    const remaining = await User.rememberMeTokens.all(user)
    assert.deepEqual(
      remaining.map((token) => String(token.identifier)),
      [String(current.identifier)]
    )
  })

  test('logStaffSignIn updates lastSeenAt and writes the activity log (STAFF-1)', async ({
    assert,
  }) => {
    const staff = await createUser('6281312345678', Role.STAFF)
    const service = await app.container.make(AccountService)

    await service.logStaffSignIn(staff)

    assert.isNotNull(staff.lastSeenAt)
    const log = await ActivityLog.query().where('userId', staff.id).firstOrFail()
    assert.equal(log.action, 'sign_in')
  })
})
