/*
|--------------------------------------------------------------------------
| Authentication Functional Tests
|--------------------------------------------------------------------------
|
| Tests HTTP routes for signup, login, and logout against the database
| and session lifecycle.
|
*/

import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import AuthService from '#services/auth_service'

test.group('Authentication Routes', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('POST /signup registers user and redirects to dashboard', async ({ client, assert }) => {
    const response = await client.post('/signup').withCsrfToken().form({
      fullName: 'Functional Test User',
      email: 'functional@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    response.assertRedirectsTo('/dashboard')

    const user = await User.findBy('email', 'functional@example.com')
    assert.isNotNull(user)
    assert.equal(user?.fullName, 'Functional Test User')
  })

  test('POST /login authenticates valid credentials and redirects to dashboard', async ({
    client,
  }) => {
    const authService = new AuthService()
    await authService.register({
      fullName: 'Login User',
      email: 'login@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    const response = await client.post('/login').withCsrfToken().form({
      email: 'login@example.com',
      password: 'password123',
    })

    response.assertRedirectsTo('/dashboard')
  })

  test('POST /logout terminates user session and redirects to login', async ({ client }) => {
    const authService = new AuthService()
    const user = await authService.register({
      fullName: 'Logout User',
      email: 'logout@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    const response = await client.post('/logout').withCsrfToken().loginAs(user)

    response.assertRedirectsTo('/login')
  })
})
