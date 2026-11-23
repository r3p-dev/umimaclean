import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { visitRedirect } from '../helpers/inertia.js'

function createUser(phone: string, role: Role = Role.CUSTOMER) {
  return User.create({
    fullName: 'Rina Wulandari',
    phone,
    password: 'password123',
    role,
    isActive: true,
  })
}

test.group('Account security (ACC-4)', (group) => {
  group.each.setup(async () => {
    await limiter.clear(['memory'])
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('every role changes its password with the current one (ACC-4)', async ({
    client,
    assert,
  }) => {
    const accounts = [
      { user: await createUser('6281200000201', Role.CUSTOMER), profile: '/profil/ubah' },
      { user: await createUser('6281200000202', Role.STAFF), profile: '/staf/profil' },
      { user: await createUser('6281200000203', Role.ADMIN), profile: '/admin/profil' },
    ]

    for (const { user, profile } of accounts) {
      const response = await client
        .put('/akun/kata-sandi')
        .header('referer', profile)
        .loginAs(user)
        .withCsrfToken()
        .redirects(0)
        .form({
          currentPassword: 'password123',
          password: 'newpassword456',
          passwordConfirmation: 'newpassword456',
        })

      response.assertHeader('location', profile)
      response.assertFlashMessage(
        'success',
        'Kata sandi diganti. Perangkat lain sudah dikeluarkan.'
      )
      const verified = await User.verifyCredentials(user.phone, 'newpassword456')
      assert.equal(verified.id, user.id)
    }
  })

  test('a wrong current password is refused (ACC-4)', async ({ client, assert }) => {
    const user = await createUser('6281200000204')

    const response = await client
      .put('/akun/kata-sandi')
      .header('referer', '/profil/ubah')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({
        currentPassword: 'wrongpassword',
        password: 'newpassword456',
        passwordConfirmation: 'newpassword456',
      })

    const page = await visitRedirect(client, response)
    page.assertInertiaComponent('customer/profile/edit')
    page.assertInertiaPropsContains({ errors: { currentPassword: 'Kata sandi saat ini salah.' } })
    const verified = await User.verifyCredentials(user.phone, 'password123')
    assert.equal(verified.id, user.id)
  })

  test('a mismatched confirmation and a short password are refused (ACC-4)', async ({ client }) => {
    const user = await createUser('6281200000205')

    const response = await client
      .put('/akun/kata-sandi')
      .header('referer', '/profil/ubah')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({ currentPassword: 'password123', password: 'short', passwordConfirmation: 'other' })

    const page = await visitRedirect(client, response)
    page.assertInertiaPropsContains({
      errors: { password: 'Minimal 8 karakter.', passwordConfirmation: 'Kata sandi tidak sama.' },
    })
  })

  test('after 5 wrong current passwords the change is blocked with the wait time (ACC-4)', async ({
    client,
    assert,
  }) => {
    const user = await createUser('6281200000206')

    async function attempt(currentPassword: string) {
      return client
        .put('/akun/kata-sandi')
        .header('referer', '/profil/ubah')
        .loginAs(user)
        .withCsrfToken()
        .redirects(0)
        .form({
          currentPassword,
          password: 'newpassword456',
          passwordConfirmation: 'newpassword456',
        })
    }

    for (let failure = 0; failure < 5; failure++) {
      await attempt('wrongpassword')
    }
    const page = await visitRedirect(client, await attempt('password123'))

    page.assertInertiaPropsContains({
      errors: { currentPassword: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' },
    })
    const verified = await User.verifyCredentials(user.phone, 'password123')
    assert.equal(verified.id, user.id)
  })

  test('a password change signs out every other device, keeping this one (ACC-5)', async ({
    client,
    assert,
  }) => {
    const user = await createUser('6281200000208')
    const current = await User.rememberMeTokens.create(user, '180d')
    await User.rememberMeTokens.create(user, '180d')

    const response = await client
      .put('/akun/kata-sandi')
      .header('referer', '/profil/ubah')
      .loginAs(user)
      .withEncryptedCookie('remember_web', current.value!.release())
      .withCsrfToken()
      .redirects(0)
      .form({
        currentPassword: 'password123',
        password: 'newpassword456',
        passwordConfirmation: 'newpassword456',
      })

    response.assertFlashMessage('success', 'Kata sandi diganti. Perangkat lain sudah dikeluarkan.')
    const remaining = await User.rememberMeTokens.all(user)
    assert.deepEqual(
      remaining.map((token) => String(token.identifier)),
      [String(current.identifier)]
    )
  })

  test('a refused password change signs out nothing (ACC-4)', async ({ client, assert }) => {
    const user = await createUser('6281200000209')
    await User.rememberMeTokens.create(user, '180d')

    await client
      .put('/akun/kata-sandi')
      .header('referer', '/profil/ubah')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({
        currentPassword: 'wrongpassword',
        password: 'newpassword456',
        passwordConfirmation: 'newpassword456',
      })

    assert.lengthOf(await User.rememberMeTokens.all(user), 1)
  })

  test('guests are refused on the account security actions', async ({ client }) => {
    const password = await client.put('/akun/kata-sandi').withCsrfToken().form({})
    password.assertRedirectsTo('/masuk')
  })

  test('there is no separate "sign out other devices" action any more (D107)', async ({
    client,
  }) => {
    const user = await createUser('6281200000209', Role.STAFF)
    const response = await client.post('/akun/keluar-perangkat-lain').loginAs(user).withCsrfToken()
    response.assertStatus(404)
  })
})
