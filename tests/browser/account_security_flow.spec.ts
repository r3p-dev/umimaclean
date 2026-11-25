import { test } from '@japa/runner'
import { AxeBuilder } from '@axe-core/playwright'
import type { TestContext } from '@japa/runner/core'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import env from '#start/env'
import { fakeWhatsApp } from '../helpers/fake_whatsapp_service.js'

type Browser = TestContext['browser']
type Page = Awaited<ReturnType<Browser['newPage']>>

const BASE_URL = `http://${env.get('HOST')}:${env.get('PORT')}`

async function signInOnNewDevice(
  browser: Browser,
  path: string,
  phone: string,
  password: string,
  isRemembered: boolean
) {
  const context = await browser.newContext({ baseURL: BASE_URL })
  const page = await context.newPage()
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await page.locator('input[name="phone"]').fill(phone)
  await page.locator('input[name="password"]').fill(password)
  if (isRemembered) {
    await page.locator('label[data-slot="checkbox-button"]').click()
  }
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((url) => url.pathname !== path)
  return { context, page }
}

async function axeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return results.violations.map((violation) => violation.id)
}

test.group('Account security in the browser (ACC-4, ACC-5, CUST-13)', (group) => {
  group.each.setup(async () => {
    fakeWhatsApp.clear()
    await limiter.clear(['memory'])
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('a password change signs out the other devices, remembered ones included (ACC-5)', async ({
    browser,
    assert,
  }) => {
    const user = await User.create({
      fullName: 'Asep Staf',
      phone: '6281200000501',
      password: 'password123',
      role: Role.STAFF,
      isActive: true,
    })

    const first = await signInOnNewDevice(
      browser,
      '/staf/masuk',
      '081200000501',
      'password123',
      true
    )
    const current = await signInOnNewDevice(
      browser,
      '/staf/masuk',
      '081200000501',
      'password123',
      false
    )

    await current.page.goto('/staf/profil')
    await current.page.waitForLoadState('networkidle')

    // Only "Keluar" for this device; others end through a password or phone change (D107).
    assert.equal(
      await current.page.getByRole('button', { name: 'Keluar dari perangkat lain' }).count(),
      0
    )
    // The password form sits on Ubah profil, as for customers (D108).
    await current.page.goto('/staf/profil/ubah')
    await current.page.locator('input[name="currentPassword"]').fill('password123')
    await current.page.locator('input[name="password"]').fill('newpassword456')
    await current.page.locator('input[name="passwordConfirmation"]').fill('newpassword456')
    await current.page.getByRole('button', { name: 'Ubah Kata Sandi' }).click()
    await current.page.getByText('Kata sandi diganti. Perangkat lain sudah dikeluarkan.').waitFor()
    assert.equal(await current.page.locator('input[name="currentPassword"]').inputValue(), '')
    await current.page.goto('/staf/profil')
    // The remembered device must not sign itself back in on reload.
    await first.page.reload()
    await first.page.waitForURL('**/staf/masuk')
    assert.lengthOf(await User.rememberMeTokens.all(user), 0)

    await current.page.goto('/staf')
    assert.equal(new URL(current.page.url()).pathname, '/staf')

    await first.context.close()
    await current.context.close()
  })

  test('customer changes the phone with an OTP and the other device is signed out (CUST-13, ACC-5)', async ({
    browser,
    assert,
  }) => {
    await User.create({
      fullName: 'Rina Wulandari',
      phone: '6281200000502',
      password: 'password123',
      role: Role.CUSTOMER,
      isActive: true,
    })

    const other = await signInOnNewDevice(browser, '/masuk', '081200000502', 'password123', true)
    const current = await signInOnNewDevice(browser, '/masuk', '081200000502', 'password123', false)

    await current.page.goto('/profil/nomor')
    await current.page.waitForLoadState('networkidle')
    await current.page.locator('input[name="phone"]').fill('081200000599')
    // The number is the sign-in identity: the current password comes first (D108).
    await current.page.locator('input[name="currentPassword"]').fill('password123')
    await current.page.getByRole('button', { name: 'Kirim Kode' }).click()
    await current.page.waitForURL('**/verifikasi')
    await current.page.getByRole('heading', { name: 'Verifikasi Nomor Baru' }).waitFor()
    assert.deepEqual(await axeViolations(current.page), [])

    const code = fakeWhatsApp.getLatestOtpCode('6281200000599')
    assert.isDefined(code)
    for (let index = 0; index < 6; index++) {
      await current.page.locator(`input[aria-label="Digit ${index + 1} dari 6"]`).fill(code![index])
    }
    await current.page.getByRole('button', { name: 'Verifikasi & Ganti Nomor' }).click()
    await current.page.waitForURL('**/profil')
    await current.page.getByText('+62 812 0000 0599').waitFor()

    await other.page.reload()
    await other.page.waitForURL('**/masuk')

    await other.context.close()
    await current.context.close()
  })

  test('staff change their phone from their own Profil, like customers (STAFF-16, D108)', async ({
    browser,
    assert,
  }) => {
    await User.create({
      fullName: 'Asep Staf',
      phone: '6281200000503',
      password: 'password123',
      role: Role.STAFF,
      isActive: true,
    })
    const current = await signInOnNewDevice(
      browser,
      '/staf/masuk',
      '081200000503',
      'password123',
      false
    )

    await current.page.goto('/staf/profil')
    await current.page.getByRole('link', { name: 'Ubah' }).click()
    await current.page.waitForURL('**/staf/profil/ubah')
    await current.page.getByRole('link', { name: 'Ganti nomor WhatsApp' }).click()
    await current.page.waitForURL('**/staf/profil/nomor')
    await current.page.locator('input[name="phone"]').fill('081200000598')
    await current.page.locator('input[name="currentPassword"]').fill('password123')
    await current.page.getByRole('button', { name: 'Kirim Kode' }).click()
    await current.page.waitForURL('**/verifikasi')

    const code = fakeWhatsApp.getLatestOtpCode('6281200000598')
    assert.isDefined(code)
    for (let index = 0; index < 6; index++) {
      await current.page.locator(`input[aria-label="Digit ${index + 1} dari 6"]`).fill(code![index])
    }
    await current.page.getByRole('button', { name: 'Verifikasi & Ganti Nomor' }).click()
    await current.page.waitForURL('**/staf/profil')
    await current.page.getByText('+62 812 0000 0598').waitFor()

    await current.context.close()
  })
})
