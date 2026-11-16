import { test } from '@japa/runner'
import type { ApiClient } from '@japa/api-client'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { SIGN_IN_FAILED_MESSAGE } from '#services/account_service'
import { visitRedirect } from '../helpers/inertia.js'

const THROTTLED = 'Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.'

function signIn(client: ApiClient, path: string, phone: string, password: string, ip: string) {
  return client
    .post(path)
    .header('referer', path)
    .header('x-forwarded-for', ip)
    .withCsrfToken()
    .redirects(0)
    .form({ phone, password })
}

test.group('Sign-in rate limits (ACC-3)', (group) => {
  group.each.setup(async () => {
    await limiter.clear(['memory'])
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('after 5 wrong passwords a number is blocked, even with the right one', async ({
    client,
  }) => {
    await User.create({
      fullName: 'Rina Wulandari',
      phone: '6281200000401',
      password: 'password123',
      role: Role.CUSTOMER,
      isActive: true,
    })

    for (let failure = 0; failure < 5; failure++) {
      const wrong = await signIn(client, '/masuk', '081200000401', 'wrongpassword', '198.51.100.1')
      const page = await visitRedirect(client, wrong)
      page.assertInertiaPropsContains({ errors: { phone: SIGN_IN_FAILED_MESSAGE } })
    }

    const blocked = await signIn(client, '/masuk', '081200000401', 'password123', '198.51.100.2')
    const page = await visitRedirect(client, blocked)
    page.assertInertiaComponent('auth/login')
    page.assertInertiaPropsContains({ errors: { phone: THROTTLED } })
  })

  test('a successful sign-in clears the counter of that number', async ({ client }) => {
    await User.create({
      fullName: 'Rina Wulandari',
      phone: '6281200000402',
      password: 'password123',
      role: Role.CUSTOMER,
      isActive: true,
    })

    for (let failure = 0; failure < 4; failure++) {
      await signIn(client, '/masuk', '081200000402', 'wrongpassword', '198.51.100.3')
    }
    const success = await signIn(client, '/masuk', '081200000402', 'password123', '198.51.100.3')
    success.assertHeader('location', '/beranda')

    for (let failure = 0; failure < 4; failure++) {
      await signIn(client, '/masuk', '081200000402', 'wrongpassword', '198.51.100.3')
    }
    const stillAllowed = await signIn(
      client,
      '/masuk',
      '081200000402',
      'password123',
      '198.51.100.3'
    )
    stillAllowed.assertHeader('location', '/beranda')
  })

  test('the staff sign-in has the same limit per number (STAFF-1)', async ({ client }) => {
    await User.create({
      fullName: 'Asep Staf',
      phone: '6281200000403',
      password: 'password123',
      role: Role.STAFF,
      isActive: true,
    })

    for (let failure = 0; failure < 5; failure++) {
      await signIn(client, '/staf/masuk', '081200000403', 'wrongpassword', '198.51.100.4')
    }

    const blocked = await signIn(
      client,
      '/staf/masuk',
      '081200000403',
      'password123',
      '198.51.100.4'
    )
    const page = await visitRedirect(client, blocked)
    page.assertInertiaComponent('auth/staff_login')
    page.assertInertiaPropsContains({ errors: { phone: THROTTLED } })
  })

  test('after 50 wrong passwords from one client IP, that IP is blocked; others are not', async ({
    client,
  }) => {
    await User.create({
      fullName: 'Rina Wulandari',
      phone: '6281200000404',
      password: 'password123',
      role: Role.CUSTOMER,
      isActive: true,
    })

    for (let failure = 0; failure < 50; failure++) {
      const phone = `0812100${String(failure).padStart(5, '0')}`
      await signIn(client, '/masuk', phone, 'wrongpassword', '203.0.113.50')
    }

    const blocked = await signIn(client, '/masuk', '081200000404', 'password123', '203.0.113.50')
    const page = await visitRedirect(client, blocked)
    page.assertInertiaPropsContains({ errors: { phone: THROTTLED } })

    const otherClient = await signIn(
      client,
      '/masuk',
      '081200000404',
      'password123',
      '203.0.113.51'
    )
    otherClient.assertHeader('location', '/beranda')
  })
})
