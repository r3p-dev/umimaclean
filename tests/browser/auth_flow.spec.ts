import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import env from '#start/env'
import { fakeWhatsApp } from '../helpers/fake_whatsapp_service.js'

test.group('Authentication Browser Flow (M2a)', (group) => {
  group.each.setup(() => {
    fakeWhatsApp.clear()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('home page renders and displays authentication entry points', async ({ visit }) => {
    const page = await visit('/')

    await page.assertPath('/')
    await page.assertExists('a[href="/masuk"]')
  })

  test('password input allows toggling password visibility without submitting form', async ({
    visit,
    assert,
  }) => {
    const page = await visit('/masuk')
    await page.waitForLoadState('networkidle')
    await page.assertPath('/masuk')

    const passwordInput = page.locator('input[name="password"]')
    const toggleButton = page.locator('button[aria-label="Tampilkan kata sandi"]')

    assert.equal(await passwordInput.getAttribute('type'), 'password')
    assert.equal(await toggleButton.getAttribute('aria-pressed'), 'false')
    assert.equal(await toggleButton.getAttribute('type'), 'button')

    // Click toggle to reveal password
    await toggleButton.click()
    await page.assertPath('/masuk')
    assert.equal(await passwordInput.getAttribute('type'), 'text')
    const hideButton = page.locator('button[aria-label="Sembunyikan kata sandi"]')
    assert.equal(await hideButton.getAttribute('aria-pressed'), 'true')

    // Click toggle again to hide password
    await hideButton.click()
    await page.assertPath('/masuk')
    assert.equal(await passwordInput.getAttribute('type'), 'password')
    assert.equal(await toggleButton.getAttribute('aria-pressed'), 'false')
  })

  test('customer signs in through browser form and lands on /beranda', async ({ visit }) => {
    await User.create({
      fullName: 'Pelanggan Browser',
      phone: '6281200000010',
      password: 'password123',
      role: Role.CUSTOMER,
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
      role: Role.STAFF,
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
      role: Role.ADMIN,
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
      role: Role.CUSTOMER,
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
      role: Role.CUSTOMER,
      isActive: true,
    })

    await browserContext.loginAs(user)
    const page = await visit('/beranda')
    await page.assertPath('/beranda')

    await page.locator('form[action="/keluar"] button[type="submit"]').click()
    await page.waitForURL('**/masuk')
    await page.assertPath('/masuk')
  })

  test('customer signs up through /daftar, verifies OTP, and lands signed in on /beranda', async ({
    visit,
    assert,
  }) => {
    const page = await visit('/daftar')
    await page.waitForLoadState('load')
    await page.assertPath('/daftar')

    // Wait for Turnstile token to be ready first so state updates don't reset inputs
    await page
      .waitForFunction(
        'Boolean(document.querySelector("input[name=\\"cf-turnstile-response\\"]")?.value || document.querySelector("input[name=\\"turnstile\\"]")?.value)',
        null,
        { timeout: 10000 }
      )
      .catch(() => {})

    // Fill form
    await page.locator('input[name="name"]').fill('Daftar Baru')
    await page.locator('input[name="phone"]').fill('081277778888')
    await page.locator('input[name="password"]').fill('password123')
    await page.locator('input[name="passwordConfirmation"]').fill('password123')
    await page.locator('label[data-slot="checkbox-button"]').click()

    // Submit form
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/verifikasi')
    await page.assertPath('/verifikasi')

    // Retrieve OTP from fake WhatsApp service
    const normalizedPhone = '6281277778888'
    const otpCode = fakeWhatsApp.getLatestOtpCode(normalizedPhone)
    assert.isDefined(otpCode)

    // Fill OTP digits into OTP input
    for (let i = 0; i < 6; i++) {
      await page.locator(`input[aria-label="Digit ${i + 1} dari 6"]`).fill(otpCode![i])
    }

    // Submit OTP verification
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/beranda')
    await page.assertPath('/beranda')
    await page.assertText('h1', 'Selamat datang, Daftar')

    // Verify account is created in database
    const user = await User.findBy('phone', normalizedPhone)
    assert.isNotNull(user)
    assert.equal(user!.fullName, 'Daftar Baru')
    assert.equal(user!.role, Role.CUSTOMER)
  })
})
