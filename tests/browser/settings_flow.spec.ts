import { test } from '@japa/runner'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { saveScreenshot, saveScreenshotLog } from '../helpers/screenshots.js'

const VIEWPORTS = [
  { name: '360', width: 360, height: 780 },
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
] as const

test.group('Settings & Service Areas Browser Flow (M3b)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('owner manages service areas and store settings, capturing responsive screenshots and axe audits (AREA-1..3, OWN-8..9, SLOT-2)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    await browserContext.loginAs(owner)

    const axeLogs: string[] = []

    for (const vp of VIEWPORTS) {
      // 1. Area Layanan initial page (/admin/pengaturan/area)
      {
        const page = await visit('/admin/pengaturan/area')
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.waitForLoadState('networkidle')
        await page.assertPath('/admin/pengaturan/area')

        // Header and the Semua / Aktif / Nonaktif filter with its counts (D107)
        await page.getByRole('heading', { name: 'Area Layanan' }).waitFor({ state: 'visible' })
        await page.getByRole('radio', { name: /^Aktif \(\d+\)$/ }).waitFor({ state: 'visible' })

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(
          scrollWidth,
          vp.width,
          `Horizontal scroll overflow at ${vp.name}px on /admin/pengaturan/area`
        )

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Area page axe violations at ${vp.name}px`)

        await saveScreenshot(page, `admin-area-${vp.name}.png`)
        axeLogs.push(
          `admin-area-${vp.name}: path=/admin/pengaturan/area scrollWidth=${scrollWidth} axe=none`
        )
      }

      // 2. Area page with a district turned off (admin-area-toggle-*)
      {
        const page = await visit('/admin/pengaturan/area')
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.waitForLoadState('networkidle')

        // Toggle Coblong district switch
        const coblongSwitch = page
          .locator('[aria-label="Status jangkauan kecamatan Coblong"]')
          .first()
        await coblongSwitch.click({ force: true })
        await page.waitForLoadState('networkidle')

        // Flash message should appear
        await page.getByText(/berhasil dinonaktifkan/i).waitFor({ state: 'visible' })

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(
          scrollWidth,
          vp.width,
          `Horizontal scroll overflow at ${vp.name}px after toggle`
        )

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Area toggle axe violations at ${vp.name}px`)

        await saveScreenshot(page, `admin-area-toggle-${vp.name}.png`)
        axeLogs.push(
          `admin-area-toggle-${vp.name}: path=/admin/pengaturan/area (district toggled) scrollWidth=${scrollWidth} axe=none`
        )

        // Restore Coblong
        await coblongSwitch.click({ force: true })
        await page.waitForLoadState('networkidle')
      }

      // 3. Store settings page initial view (/admin/pengaturan/toko)
      {
        const page = await visit('/admin/pengaturan/toko')
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.waitForLoadState('networkidle')
        await page.assertPath('/admin/pengaturan/toko')

        await page.getByRole('heading', { name: 'Pengaturan Toko' }).waitFor({ state: 'visible' })
        await page.getByText('Profil toko').first().waitFor({ state: 'visible' })

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(
          scrollWidth,
          vp.width,
          `Horizontal scroll overflow at ${vp.name}px on store settings`
        )

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Store settings axe violations at ${vp.name}px`)

        await saveScreenshot(page, `admin-pengaturan-toko-${vp.name}.png`)
        axeLogs.push(
          `admin-pengaturan-toko-${vp.name}: path=/admin/pengaturan/toko scrollWidth=${scrollWidth} axe=none`
        )
      }

      // 4. Store settings validation errors (admin-pengaturan-toko-error-*)
      {
        const page = await visit('/admin/pengaturan/toko')
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.waitForLoadState('networkidle')

        // Clear required fields to trigger validation refusal
        const nameInput = page.locator('#store-name')
        await nameInput.fill('A')
        const phoneInput = page.locator('#store-whatsapp')
        await phoneInput.fill('123')

        const submitBtn = page.getByRole('button', { name: 'Simpan Profil Toko' })
        await submitBtn.click()
        await page.waitForLoadState('networkidle')
        await page.locator('[data-slot="field-error"]').first().waitFor({ state: 'visible' })
        await page.waitForFunction(
          '!document.querySelector("button[type=\\"submit\\"]")?.hasAttribute("disabled")'
        )

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(
          scrollWidth,
          vp.width,
          `Horizontal scroll overflow at ${vp.name}px on store validation error`
        )

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Store error axe violations at ${vp.name}px`)

        await saveScreenshot(page, `admin-pengaturan-toko-error-${vp.name}.png`)
        axeLogs.push(
          `admin-pengaturan-toko-error-${vp.name}: path=/admin/pengaturan/toko (validation error) scrollWidth=${scrollWidth} axe=none`
        )
      }

      // 5. Pickup slots page (admin-pengaturan-slot-*)
      {
        const page = await visit('/admin/pengaturan/slot')
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.waitForLoadState('networkidle')

        // Change the first slot's capacity with the stepper's + button (React Aria NumberField).
        const capInput = page.locator('[id^="capacity-"]').first()
        await page
          .getByRole('button', { name: /Tambah|Increase/ })
          .first()
          .click()
        assert.equal(await capInput.inputValue(), '7')

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(
          scrollWidth,
          vp.width,
          `Horizontal scroll overflow at ${vp.name}px on slots`
        )

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Slots section axe violations at ${vp.name}px`)

        await saveScreenshot(page, `admin-pengaturan-slot-${vp.name}.png`)
        axeLogs.push(
          `admin-pengaturan-slot-${vp.name}: path=/admin/pengaturan/slot scrollWidth=${scrollWidth} axe=none`
        )
      }

      // 6. Owner mobile menu / navigation showing new items (admin-nav-mobile-*)
      {
        const page = await visit('/admin/pengaturan/toko')
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.waitForLoadState('networkidle')

        if (vp.width < 640) {
          const menuBtn = page.locator('button[aria-label="Buka menu navigasi"]')
          await menuBtn.click()
          const dialog = page.getByRole('dialog')
          await dialog.waitFor({ state: 'visible' })
          await dialog.getByRole('link', { name: 'Pengaturan' }).waitFor({ state: 'visible' })
        }

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(scrollWidth, vp.width, `Horizontal scroll overflow at ${vp.name}px on nav`)

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Nav mobile axe violations at ${vp.name}px`)

        await saveScreenshot(page, `admin-nav-mobile-${vp.name}.png`)
        axeLogs.push(
          `admin-nav-mobile-${vp.name}: path=/admin/pengaturan/toko (navigation menu) scrollWidth=${scrollWidth} axe=none`
        )

        if (vp.width < 640) {
          const closeBtn = page.locator('button[aria-label="Tutup menu"]')
          await closeBtn.click()
          await page.getByRole('dialog').waitFor({ state: 'hidden' })
        }
      }

      // 7. Landing footer showing dynamic store settings (landing-footer-*)
      {
        const page = await visit('/')
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.waitForLoadState('networkidle')

        const footer = page.locator('footer')
        await footer.scrollIntoViewIfNeeded()
        await footer.waitFor({ state: 'visible' })

        // Verify dynamic store info rendered
        await footer
          .getByText(/Margacinta/i)
          .first()
          .waitFor({ state: 'visible' })

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(
          scrollWidth,
          vp.width,
          `Horizontal scroll overflow at ${vp.name}px on landing footer`
        )

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Landing footer axe violations at ${vp.name}px`)

        await saveScreenshot(page, `landing-footer-${vp.name}.png`)
        axeLogs.push(
          `landing-footer-${vp.name}: path=/ (footer section) scrollWidth=${scrollWidth} axe=none`
        )
      }
    }

    // Write axe logs
    await saveScreenshotLog('screenshots-axe.log', axeLogs)
  })
})
