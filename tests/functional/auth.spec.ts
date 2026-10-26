import { test } from '@japa/runner'
import { UserFactory, USER_PASSWORD } from '#database/factories/user_factory'
import User from '#models/user'
import { LOGIN_FAILED_MESSAGE } from '#services/constants'
import { inertia, post, TURNSTILE_TOKEN, useApp } from '#tests/support/app'

function login(
  client: Parameters<typeof post>[0],
  phone: string,
  password: string,
  url = '/masuk'
) {
  return post(client, url, { phone, password, remember: true, turnstile: TURNSTILE_TOKEN })
}

test.group('Sign in', (group) => {
  const state = useApp(group)

  test('a customer signs in with any phone format and lands on Beranda', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.merge({ phone: '6281234567890' }).create()

    const response = await login(client, '0812-3456-7890', USER_PASSWORD)

    response.assertStatus(302)
    response.assertHeader('location', '/beranda')
    response.assertCookie('remember_web')
    assert.lengthOf(await User.rememberMeTokens.all(user), 1)
  })

  test('a wrong password and an unknown number get the same generic error', async ({ client }) => {
    await UserFactory.merge({ phone: '6281234567890' }).create()

    const wrong = await login(client, '81234567890', 'salah-sekali')
    const unknown = await login(client, '81299999999', USER_PASSWORD)

    for (const response of [wrong, unknown]) {
      response.assertStatus(422)
      response.assertBodyContains({
        errors: [{ field: 'password', message: LOGIN_FAILED_MESSAGE }],
      })
    }
  })

  test('without "Ingat saya" no remember-me token is stored', async ({ client, assert }) => {
    const user = await UserFactory.merge({ phone: '6281234567890' }).create()

    const response = await post(client, '/masuk', {
      phone: '81234567890',
      password: USER_PASSWORD,
      turnstile: TURNSTILE_TOKEN,
    })

    response.assertStatus(302)
    assert.lengthOf(await User.rememberMeTokens.all(user), 0)
  })

  test('blocks the number after 5 failed attempts, even with the right password', async ({
    client,
  }) => {
    await UserFactory.merge({ phone: '6281234567890' }).create()
    for (let attempt = 0; attempt < 5; attempt++) {
      const failed = await login(client, '81234567890', 'salah-sekali')
      failed.assertStatus(422)
    }

    const blocked = await login(client, '81234567890', USER_PASSWORD)

    blocked.assertStatus(422)
    blocked.assertBodyContains({ errors: [{ rule: 'login.throttled' }] })
  })

  test('a failed Turnstile check stops the login before credentials are checked', async ({
    client,
  }) => {
    await UserFactory.merge({ phone: '6281234567890' }).create()
    state.turnstile.shouldPass = false

    const response = await login(client, '81234567890', USER_PASSWORD)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'turnstile' }] })
  })

  test('the customer page rejects staff, and the staff page rejects customers', async ({
    client,
  }) => {
    await UserFactory.apply('staff').merge({ phone: '6281100000001' }).create()
    await UserFactory.merge({ phone: '6281100000002' }).create()

    const staffOnCustomerPage = await login(client, '81100000001', USER_PASSWORD)
    const customerOnStaffPage = await login(client, '81100000002', USER_PASSWORD, '/staf/masuk')

    for (const response of [staffOnCustomerPage, customerOnStaffPage]) {
      response.assertBodyContains({ errors: [{ message: LOGIN_FAILED_MESSAGE }] })
    }
  })

  test('staff and admin are redirected to their own home', async ({ client }) => {
    await UserFactory.apply('staff').merge({ phone: '6281100000001' }).create()
    await UserFactory.apply('admin').merge({ phone: '6281100000003' }).create()

    const staff = await login(client, '81100000001', USER_PASSWORD, '/staf/masuk')
    const admin = await login(client, '81100000003', USER_PASSWORD, '/staf/masuk')

    staff.assertHeader('location', '/staf')
    admin.assertHeader('location', '/admin')
  })

  test('a guest is sent to sign in and returns to the page they asked for', async ({ client }) => {
    await UserFactory.merge({ phone: '6281234567890' }).create()

    const guest = await client.get('/pesan').redirects(0)
    guest.assertHeader('location', '/masuk')

    const response = await login(client, '81234567890', USER_PASSWORD).withSession(guest.session())
    response.assertHeader('location', '/pesan')
  })

  test('roles cannot open each other’s areas', async ({ client }) => {
    const customer = await UserFactory.create()
    const staff = await UserFactory.apply('staff').create()

    const visits = [
      { response: await client.get('/staf').loginAs(customer).redirects(0), to: '/beranda' },
      { response: await client.get('/admin').loginAs(staff).redirects(0), to: '/staf' },
      { response: await client.get('/beranda').loginAs(staff).redirects(0), to: '/staf' },
      { response: await client.get('/staf').redirects(0), to: '/staf/masuk' },
    ]

    for (const { response, to } of visits) {
      response.assertHeader('location', to)
    }
  })

  test('signing out ends the session', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await post(client, '/keluar').loginAs(user)

    response.assertHeader('location', '/')
    assert.lengthOf(await User.rememberMeTokens.all(user), 0)
  })

  test('the login page renders for guests', async ({ client }) => {
    const response = await inertia(client, '/masuk')
    response.assertInertiaComponent('auth/login')
  })
})
