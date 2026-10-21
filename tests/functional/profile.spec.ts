import { test } from '@japa/runner'
import { UserFactory, USER_PASSWORD } from '#database/factories/user_factory'
import User from '#models/user'
import { post, send, TURNSTILE_TOKEN, useApp } from '#tests/support/app'

test.group('Profile', (group) => {
  const state = useApp(group)

  test('changing to a number another account uses is refused', async ({ client, assert }) => {
    await UserFactory.merge({ phone: '6281234500000' }).create()
    const user = await UserFactory.create()

    const response = await post(client, '/profil/nomor', {
      phone: '081234500000',
      turnstile: TURNSTILE_TOKEN,
    }).loginAs(user)

    response.assertBodyContains({ errors: [{ field: 'phone', rule: 'phone.taken' }] })
    assert.lengthOf(state.fonnte.messages, 0)
  })

  test('a new number is saved after the code sent to it is verified', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.merge({ phone: '6281234500000' }).create()

    const started = await post(client, '/profil/nomor', {
      phone: '0812 9999 0000',
      turnstile: TURNSTILE_TOKEN,
    }).loginAs(user)
    started.assertHeader('location', '/verifikasi')
    assert.equal(state.fonnte.messages[0].target, '6281299990000')
    await user.refresh()
    assert.equal(user.phone, '6281234500000')

    const done = await post(
      client,
      '/verifikasi',
      { code: state.fonnte.lastCode('6281299990000') },
      started.session()
    ).loginAs(user)

    done.assertHeader('location', '/profil/ubah')
    await user.refresh()
    assert.equal(user.phone, '6281299990000')
  })

  test('a number taken while the code was pending is still refused', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const started = await post(client, '/profil/nomor', {
      phone: '0812 9999 0000',
      turnstile: TURNSTILE_TOKEN,
    }).loginAs(user)
    await UserFactory.merge({ phone: '6281299990000' }).create()

    const done = await post(
      client,
      '/verifikasi',
      { code: state.fonnte.lastCode('6281299990000') },
      started.session()
    ).loginAs(user)

    done.assertBodyContains({ errors: [{ rule: 'phone.taken' }] })
    await user.refresh()
    assert.notEqual(user.phone, '6281299990000')
  })

  test('changing the password needs the current one and signs out other devices', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    await User.rememberMeTokens.create(user, '180 days')
    await User.rememberMeTokens.create(user, '180 days')

    const wrong = await send(client, 'put', '/profil/kata-sandi', {
      currentPassword: 'bukan-ini',
      password: 'sandi-baru-123',
      passwordConfirmation: 'sandi-baru-123',
    }).loginAs(user)
    wrong.assertBodyContains({ errors: [{ field: 'currentPassword' }] })

    const done = await send(client, 'put', '/profil/kata-sandi', {
      currentPassword: USER_PASSWORD,
      password: 'sandi-baru-123',
      passwordConfirmation: 'sandi-baru-123',
    }).loginAs(user)

    done.assertHeader('location', '/profil/ubah')
    await user.refresh()
    assert.isTrue(await user.verifyPassword('sandi-baru-123'))
    assert.lengthOf(await User.rememberMeTokens.all(user), 1)
  })

  test('staff and the owner change their password with the same rules', async ({
    client,
    assert,
  }) => {
    for (const [role, url, home] of [
      ['staff', '/staf/profil/kata-sandi', '/staf/profil'],
      ['admin', '/admin/profil/kata-sandi', '/admin/profil'],
    ] as const) {
      const user = await UserFactory.apply(role).create()
      await User.rememberMeTokens.create(user, '180 days')

      const wrong = await send(client, 'put', url, {
        currentPassword: 'bukan-ini',
        password: 'sandi-baru-123',
        passwordConfirmation: 'sandi-baru-123',
      }).loginAs(user)
      wrong.assertBodyContains({ errors: [{ field: 'currentPassword' }] })

      const done = await send(client, 'put', url, {
        currentPassword: USER_PASSWORD,
        password: 'sandi-baru-123',
        passwordConfirmation: 'sandi-baru-123',
      }).loginAs(user)

      done.assertHeader('location', home)
      await user.refresh()
      assert.isTrue(await user.verifyPassword('sandi-baru-123'))
      assert.lengthOf(await User.rememberMeTokens.all(user), 1)
    }
  })

  test('staff can sign out their other devices', async ({ client, assert }) => {
    const user = await UserFactory.apply('staff').create()
    await User.rememberMeTokens.create(user, '180 days')

    const response = await send(client, 'post', '/staf/profil/keluar-perangkat-lain').loginAs(user)

    response.assertHeader('location', '/staf/profil')
    assert.lengthOf(await User.rememberMeTokens.all(user), 1)
  })

  test('a customer cannot use the staff password route', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await send(client, 'put', '/staf/profil/kata-sandi', {}).loginAs(user)
    response.assertHeader('location', '/beranda')
  })
})
