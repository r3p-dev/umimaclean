/*
|--------------------------------------------------------------------------
| Authentication Browser Flow Tests
|--------------------------------------------------------------------------
|
| End-to-end browser tests verifying user navigation, signup, and login
| interfaces.
|
*/

import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import AuthService from '#services/auth_service'

test.group('Authentication Browser Flow', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('home page renders and displays authentication entry points', async ({ visit }) => {
    const page = await visit('/')

    await page.assertPath('/')
    await page.assertExists('a[href="/login"]')
    await page.assertExists('a[href="/signup"]')
  })

  test('login page displays login form with credentials fields', async ({ visit }) => {
    const page = await visit('/login')

    await page.assertPath('/login')
    await page.assertExists('input#email')
    await page.assertExists('input#password')
    await page.assertExists('button[type="submit"]')
  })

  test('signup page displays registration form with all required fields', async ({ visit }) => {
    const page = await visit('/signup')

    await page.assertPath('/signup')
    await page.assertExists('input#fullName')
    await page.assertExists('input#email')
    await page.assertExists('input#password')
    await page.assertExists('input#passwordConfirmation')
    await page.assertExists('button[type="submit"]')
  })

  test('user logs in through browser form and lands on dashboard', async ({ visit }) => {
    const authService = new AuthService()
    await authService.register({
      fullName: 'Browser Test User',
      email: 'browser@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    const page = await visit('/login')
    await page.locator('input#email').fill('browser@example.com')
    await page.locator('input#password').fill('password123')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('/dashboard')

    await page.assertPath('/dashboard')
  })
})
