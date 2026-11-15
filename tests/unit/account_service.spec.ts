import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import ActivityLog from '#models/activity_log'
import AccountService, {
  InactiveAccountException,
  RoleMismatchException,
} from '#services/account_service'
import SessionController from '#controllers/session_controller'
import app from '@adonisjs/core/services/app'

test.group('AccountService', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('verifies customer credentials successfully for active customer', async ({ assert }) => {
    await User.create({
      fullName: 'Rina Pelanggan',
      phone: '6281200000010',
      password: 'secretpassword',
      role: 'customer',
      isActive: true,
    })

    const service = new AccountService()
    const verified = await service.verifyCustomerCredentials({
      phone: '6281200000010',
      password: 'secretpassword',
    })

    assert.equal(verified.fullName, 'Rina Pelanggan')
    assert.equal(verified.phone, '6281200000010')
  })

  test('refuses inactive customer account during verification', async ({ assert }) => {
    await User.create({
      fullName: 'Doni Nonaktif',
      phone: '6281200000099',
      password: 'secretpassword',
      role: 'customer',
      isActive: false,
    })

    const service = new AccountService()
    await assert.rejects(
      () =>
        service.verifyCustomerCredentials({
          phone: '6281200000099',
          password: 'secretpassword',
        }),
      InactiveAccountException
    )
  })

  test('refuses staff or admin trying to sign in as customer', async ({ assert }) => {
    await User.create({
      fullName: 'Asep Staf',
      phone: '6281200000002',
      password: 'secretpassword',
      role: 'staff',
      isActive: true,
    })

    const service = new AccountService()
    await assert.rejects(
      () =>
        service.verifyCustomerCredentials({
          phone: '6281200000002',
          password: 'secretpassword',
        }),
      RoleMismatchException
    )
  })

  test('verifies staff and admin credentials in verifyStaffCredentials', async ({ assert }) => {
    await User.create({
      fullName: 'Asep Staf',
      phone: '6281200000002',
      password: 'secretpassword',
      role: 'staff',
      isActive: true,
    })
    await User.create({
      fullName: 'Budi Pemilik',
      phone: '6281200000001',
      password: 'secretpassword',
      role: 'admin',
      isActive: true,
    })

    const service = new AccountService()
    const staff = await service.verifyStaffCredentials({
      phone: '6281200000002',
      password: 'secretpassword',
    })
    const admin = await service.verifyStaffCredentials({
      phone: '6281200000001',
      password: 'secretpassword',
    })

    assert.equal(staff.role, 'staff')
    assert.equal(admin.role, 'admin')
  })

  test('refuses customer attempting to sign in through staff portal', async ({ assert }) => {
    await User.create({
      fullName: 'Rina Pelanggan',
      phone: '6281200000010',
      password: 'secretpassword',
      role: 'customer',
      isActive: true,
    })

    const service = new AccountService()
    await assert.rejects(
      () =>
        service.verifyStaffCredentials({
          phone: '6281200000010',
          password: 'secretpassword',
        }),
      RoleMismatchException
    )
  })

  test('logStaffSignIn updates lastSeenAt and creates activity_logs record', async ({ assert }) => {
    const staff = await User.create({
      fullName: 'Asep Staf',
      phone: '6281200000002',
      password: 'secretpassword',
      role: 'staff',
      isActive: true,
    })

    assert.isUndefined(staff.lastSeenAt)

    const service = new AccountService()
    await service.logStaffSignIn(staff)

    assert.isNotNull(staff.lastSeenAt)

    const log = await ActivityLog.query().where('userId', staff.id).firstOrFail()
    assert.equal(log.category, 'auth')
    assert.equal(log.action, 'sign_in')
    assert.equal(log.description, 'Masuk ke sistem')
  })

  test('resolves SessionController with injected AccountService from container', async ({
    assert,
  }) => {
    const controller = await app.container.make(SessionController)
    assert.isNotNull(controller)
  })
})
