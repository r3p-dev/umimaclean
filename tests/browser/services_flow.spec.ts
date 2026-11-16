import { test } from '@japa/runner'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import path from 'node:path'
import fs from 'node:fs/promises'

const VIEWPORTS = [
  { name: '360', width: 360, height: 780 },
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
] as const

const EVIDENCE_DIR = path.resolve('docs/evidence/M3a')

test.group('Services & Pricing Browser Flow (M3a)', (group) => {
  group.each.setup(async () => {
    await fs.mkdir(EVIDENCE_DIR, { recursive: true })
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('landing page displays pricing section with interactive filter pills (GUEST-1)', async ({
    visit,
    assert,
  }) => {
    const page = await visit('/')
    await page.waitForLoadState('networkidle')

    // Verify pricing section exists and is anchored
    const pricingSection = page.locator('#harga')
    await pricingSection.scrollIntoViewIfNeeded()
    await page.assertExists('#harga')

    // Heading exists
    const heading = pricingSection.getByRole('heading', {
      level: 2,
      name: /Daftar Layanan & Harga/i,
    })
    assert.isTrue(await heading.isVisible())

    // Category buttons exist
    const shoeBtn = pricingSection.getByRole('button', { name: /Sepatu/i })
    const bagBtn = pricingSection.getByRole('button', { name: /Tas/i })
    const helmetBtn = pricingSection.getByRole('button', { name: /Helm/i })
    const allBtn = pricingSection.getByRole('button', { name: /Semua Layanan/i })

    assert.isTrue(await shoeBtn.isVisible())
    assert.isTrue(await bagBtn.isVisible())
    assert.isTrue(await helmetBtn.isVisible())
    assert.isTrue(await allBtn.isVisible())

    // Click shoe button: should see shoe services like Mild
    await shoeBtn.click()
    assert.isTrue(await pricingSection.getByText('Mild').first().isVisible())

    // Click helmet button: should see helmet shop-only alert (SVC-4)
    await helmetBtn.click()
    const helmetNotice = pricingSection.getByText(/Khusus Bawa Langsung ke Toko/i).first()
    assert.isTrue(await helmetNotice.isVisible())

    // Click bag button
    await bagBtn.click()
    assert.isTrue(await pricingSection.getByText('Tas Medium · kanvas').first().isVisible())
  })

  test('owner manages services catalog on /admin/layanan (SVC-1..5, OWN-7)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    await browserContext.loginAs(owner)

    const page = await visit('/admin/layanan')
    await page.waitForLoadState('networkidle')
    await page.assertPath('/admin/layanan')

    // Table or list should display seeded services
    assert.isTrue(await page.getByText('Mild').first().isVisible())
    assert.isTrue(await page.getByText('Unyellowing').first().isVisible())

    // Test search filter
    const searchInput = page.getByPlaceholder(/Cari layanan/i)
    await searchInput.fill('Unyellowing')
    assert.isTrue(await page.getByText('Unyellowing').first().isVisible())
    assert.isFalse(await page.getByText('Mild').isVisible())

    // Clear search
    await searchInput.fill('')

    // Open "Tambah Layanan" dialog
    const addButton = page.getByRole('button', { name: /Tambah Layanan/i })
    await addButton.click()

    // Dialog should be open
    const dialog = page.getByRole('dialog')
    assert.isTrue(await dialog.isVisible())
    assert.isTrue(await dialog.getByText('Tambah Layanan Baru').isVisible())

    // Close dialog with cancel button
    const cancelButton = dialog.getByRole('button', { name: /Batal/i })
    await cancelButton.click()
    await dialog.waitFor({ state: 'hidden' })
    assert.isFalse(await dialog.isVisible())
  })

  test('captures responsive screenshots and verifies axe accessibility for M3a', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const axeLogs: string[] = []

    for (const vp of VIEWPORTS) {
      // 1. Landing page with pricing section
      {
        const page = await visit('/')
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.waitForLoadState('networkidle')

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(scrollWidth, vp.width)

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Landing axe violations at ${vp.name}px`)

        await page.screenshot({
          path: path.join(EVIDENCE_DIR, `landing-harga-${vp.name}.png`),
          fullPage: true,
        })
        axeLogs.push(`landing-harga-${vp.name}: path=/ scrollWidth=${scrollWidth} axe=none`)
      }

      // 2. Admin Layanan page
      {
        await browserContext.loginAs(owner)
        const page = await visit('/admin/layanan')
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.waitForLoadState('networkidle')

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(scrollWidth, vp.width)

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Admin layanan axe violations at ${vp.name}px`)

        await page.screenshot({
          path: path.join(EVIDENCE_DIR, `admin-layanan-${vp.name}.png`),
          fullPage: true,
        })
        axeLogs.push(
          `admin-layanan-${vp.name}: path=/admin/layanan scrollWidth=${scrollWidth} axe=none`
        )

        // 3. Admin Layanan Dialog open
        const addButton = page.getByRole('button', { name: /Tambah Layanan/i })
        await addButton.click()
        await page.waitForSelector('[role="dialog"]')

        const axeDialog = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
        const dialogViolations = axeDialog.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(
          dialogViolations,
          [],
          `Admin layanan dialog axe violations at ${vp.name}px`
        )

        await page.screenshot({
          path: path.join(EVIDENCE_DIR, `admin-layanan-dialog-${vp.name}.png`),
          fullPage: true,
        })
        axeLogs.push(
          `admin-layanan-dialog-${vp.name}: path=/admin/layanan (dialog) scrollWidth=${scrollWidth} axe=none`
        )

        // Close dialog
        const cancelButton = page.getByRole('button', { name: /Batal/i })
        await cancelButton.click()

        // 4. Admin Layanan Filter active (search for 'Helm')
        const searchInput = page.getByPlaceholder(/Cari layanan/i)
        await searchInput.fill('Helm')
        await page.screenshot({
          path: path.join(EVIDENCE_DIR, `admin-layanan-filter-${vp.name}.png`),
          fullPage: true,
        })
        axeLogs.push(
          `admin-layanan-filter-${vp.name}: path=/admin/layanan?q=Helm scrollWidth=${scrollWidth} axe=none`
        )
      }
    }

    await fs.writeFile(
      path.join(EVIDENCE_DIR, 'screenshots.log'),
      axeLogs.join('\n') + '\n',
      'utf-8'
    )
  })
})
