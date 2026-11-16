import { test } from '@japa/runner'
import TurnstileGateway from '#services/turnstile_gateway'
import env from '#start/env'

test.group('TurnstileGateway', () => {
  test('verifyToken returns true when disabled', async ({ assert }) => {
    env.set('TURNSTILE_ENABLED', false)
    const gateway = new TurnstileGateway()

    const result = await gateway.verifyToken(undefined)
    assert.isTrue(result)
    env.set('TURNSTILE_ENABLED', true)
  })

  test('verifyToken returns false when token is missing or empty', async ({ assert }) => {
    env.set('TURNSTILE_ENABLED', true)
    const gateway = new TurnstileGateway()

    assert.isFalse(await gateway.verifyToken(undefined))
    assert.isFalse(await gateway.verifyToken(''))
    assert.isFalse(await gateway.verifyToken('   '))
  })

  test('verifyToken returns false for invalid_token string', async ({ assert }) => {
    env.set('TURNSTILE_ENABLED', true)
    const gateway = new TurnstileGateway()

    assert.isFalse(await gateway.verifyToken('invalid_token'))
    assert.isFalse(await gateway.verifyToken('invalid'))
  })

  test('assertToken throws validation error when token is invalid', async ({ assert }) => {
    env.set('TURNSTILE_ENABLED', true)
    const gateway = new TurnstileGateway()

    try {
      await gateway.assertToken('invalid_token')
      assert.fail('Should have thrown')
    } catch (error: any) {
      assert.equal(error.messages?.[0]?.field, 'turnstile')
      assert.equal(error.messages?.[0]?.message, 'Selesaikan verifikasi keamanan, lalu coba lagi.')
    }
  })
})
