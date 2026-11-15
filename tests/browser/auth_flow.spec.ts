import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import env from '#start/env'

test.group('Authentication Browser Flow (M2a)', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('home page renders and displays authentication entry points', async ({ visit }) => {
    const page = await visit('/')

    await page.assertPath('/')
    await page.assertExists('a[href="/masuk"]')
  })

  test('customer signs in through browser form and lands on /beranda', async ({ visit }) => {
    await User.create({
      fullName: 'Pelanggan Browser',
      phone: '6281200000010',
      password: 'password123',
      role: 'customer',
      isActive: true,
    })

    const page = await visit('/masuk')
    await page.assertPath('/masuk')
    await page.locator('input[name="phone"]').fill('081200000010')
    await page.locator('input[name="password"]').fill('password123')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/beranda')

    await page.assertPath('/beranda')
    await page.assertText('h1', 'Selamat datang, Pelanggan')
  })

  test('staff signs in through /staf/masuk and lands on /staf', async ({ visit }) => {
    await User.create({
      fullName: 'Staf Browser',
      phone: '6281200000003',
      password: 'password123',
      role: 'staff',
      isActive: true,
    })

    const page = await visit('/staf/masuk')
    await page.assertPath('/staf/masuk')
    await page.locator('input[name="phone"]').fill('081200000003')
    await page.locator('input[name="password"]').fill('password123')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/staf')

    await page.assertPath('/staf')
  })

  test('owner signs in through /staf/masuk and lands on /admin', async ({ visit }) => {
    await User.create({
      fullName: 'Pemilik Browser',
      phone: '6281200000001',
      password: 'password123',
      role: 'admin',
      isActive: true,
    })

    const page = await visit('/staf/masuk')
    await page.assertPath('/staf/masuk')
    await page.locator('input[name="phone"]').fill('081200000001')
    await page.locator('input[name="password"]').fill('password123')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/admin')

    await page.assertPath('/admin')
  })

  test('sign-in also works before page scripts run (server-rendered form)', async ({
    browser,
    assert,
  }) => {
    await User.create({
      fullName: 'No Script User',
      phone: '6281200000020',
      password: 'password123',
      role: 'customer',
      isActive: true,
    })
    const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL: `http://${env.get('HOST')}:${env.get('PORT')}`,
    })
    const page = await context.newPage()

    await page.goto('/masuk')
    await page.locator('input[name="phone"]').fill('081200000020')
    await page.locator('input[name="password"]').fill('password123')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/beranda')

    assert.equal(new URL(page.url()).pathname, '/beranda')
    await context.close()
  })

  test('customer logs out and is redirected to /masuk', async ({ visit, browserContext }) => {
    const user = await User.create({
      fullName: 'User Logout',
      phone: '6281200000030',
      password: 'password123',
      role: 'customer',
      isActive: true,
    })

    await browserContext.loginAs(user)
    const page = await visit('/beranda')
    await page.assertPath('/beranda')

    await page.locator('form[action="/keluar"] button[type="submit"]').click()
    await page.waitForURL('**/masuk')
    await page.assertPath('/masuk')
  })
})
