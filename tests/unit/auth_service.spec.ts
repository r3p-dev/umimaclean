import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import app from '@adonisjs/core/services/app'
import AuthService from '#services/auth_service'
import RegisterController from '#controllers/register_controller'
import SessionController from '#controllers/session_controller'

test.group('AuthService', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('registers a new user account with hashed password', async ({ assert }) => {
    const authService = new AuthService()
    const user = await authService.registerUser({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'secretpassword123',
      passwordConfirmation: 'secretpassword123',
    })

    assert.isNotNull(user.id)
    assert.equal(user.email, 'john@example.com')
    assert.equal(user.fullName, 'John Doe')
    assert.notEqual(user.password, 'secretpassword123')
  })

  test('verifies credentials successfully for valid user', async ({ assert }) => {
    const authService = new AuthService()
    await authService.registerUser({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secretpassword123',
      passwordConfirmation: 'secretpassword123',
    })

    const verified = await authService.verifyUserCredentials({
      email: 'jane@example.com',
      password: 'secretpassword123',
    })
    assert.equal(verified.email, 'jane@example.com')
  })

  test('fails verification for incorrect password', async ({ assert }) => {
    const authService = new AuthService()
    await authService.registerUser({
      fullName: 'Alice Doe',
      email: 'alice@example.com',
      password: 'secretpassword123',
      passwordConfirmation: 'secretpassword123',
    })

    await assert.rejects(async () => {
      await authService.verifyUserCredentials({
        email: 'alice@example.com',
        password: 'wrongpassword',
      })
    })
  })

  test('resolves RegisterController and SessionController with injected AuthService from container', async ({
    assert,
  }) => {
    const registerController = await app.container.make(RegisterController)
    assert.isDefined(registerController)

    const sessionController = await app.container.make(SessionController)
    assert.isDefined(sessionController)
  })
})
