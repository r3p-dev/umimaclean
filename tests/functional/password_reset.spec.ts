import { test } from '@japa/runner'
import { UserFactory, USER_PASSWORD } from '#database/factories/user_factory'
import OtpCode from '#models/otp_code'
import User from '#models/user'
import { FORGOT_PASSWORD_NOTICE } from '#controllers/auth/password_reset_controller'
import { post, send, TURNSTILE_TOKEN, useApp } from '#tests/support/app'

test.group('Forgot password', (group) => {
  const state = useApp(group)

  test('answers the same way for a registered and an unknown number', async ({
    client,
    assert,
  }) => {
    await UserFactory.merge({ phone: '6281234567890' }).create()

    const known = await post(client, '/lupa-kata-sandi', {
      phone: '081234567890',
      turnstile: TURNSTILE_TOKEN,
    })
    const unknown = await post(client, '/lupa-kata-sandi', {
      phone: '081299999999',
      turnstile: TURNSTILE_TOKEN,
    })

    for (const response of [known, unknown]) {
      response.assertStatus(302)
      response.assertHeader('location', '/verifikasi')
      assert.equal(response.flashMessages().success, FORGOT_PASSWORD_NOTICE)
    }
    assert.deepEqual(Object.keys(known.session()).sort(), Object.keys(unknown.session()).sort())
    assert.deepEqual(
      state.fonnte.messages.map((message) => message.target),
      ['6281234567890']
    )
    assert.lengthOf(await OtpCode.all(), 1)
  })

  test('the cooldown applies to unknown numbers too', async ({ client }) => {
    const body = { phone: '081299999999', turnstile: TURNSTILE_TOKEN }
    await post(client, '/lupa-kata-sandi', body)

    const again = await post(client, '/lupa-kata-sandi', body)

    again.assertBodyContains({ errors: [{ rule: 'otp.cooldown' }] })
  })

  test('a failed Turnstile check sends no code', async ({ client, assert }) => {
    await UserFactory.merge({ phone: '6281234567890' }).create()
    state.turnstile.shouldPass = false

    const response = await post(client, '/lupa-kata-sandi', { phone: '081234567890' })

    response.assertBodyContains({ errors: [{ field: 'turnstile' }] })
    assert.lengthOf(state.fonnte.messages, 0)
  })

  test('verifying the code allows a new password and signs out other devices', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.merge({ phone: '6281234567890' }).create()
    await User.rememberMeTokens.create(user, '180 days')
    const started = await post(client, '/lupa-kata-sandi', {
      phone: '081234567890',
      turnstile: TURNSTILE_TOKEN,
    })
    const verified = await post(
      client,
      '/verifikasi',
      { code: state.fonnte.lastCode(user.phone) },
      started.session()
    )
    verified.assertHeader('location', '/kata-sandi-baru')

    const saved = await send(
      client,
      'put',
      '/kata-sandi-baru',
      { password: 'sandi-baru-123', passwordConfirmation: 'sandi-baru-123', logoutOthers: true },
      verified.session()
    )

    saved.assertHeader('location', '/beranda')
    await user.refresh()
    assert.isTrue(await user.verifyPassword('sandi-baru-123'))
    assert.isFalse(await user.verifyPassword(USER_PASSWORD))
    assert.isNotNull(user.passwordChangedAt)
    assert.lengthOf(await User.rememberMeTokens.all(user), 1)
  })

  test('the new-password page needs a verified code', async ({ client }) => {
    const response = await client.get('/kata-sandi-baru').redirects(0)
    response.assertHeader('location', '/lupa-kata-sandi')
  })
})
