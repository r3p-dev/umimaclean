import { test } from '@japa/runner'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Service from '#models/service'
import { Role } from '#enums/role_enum'
import { saveScreenshot, saveScreenshotLog } from '../helpers/screenshots.js'

const VIEWPORTS = [
  { name: '360', width: 360, height: 780 },
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
] as const

test.group('Services & Pricing Browser Flow (M3a-fix)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('the landing shows the price list after how it works and before the reviews (GUEST-1)', async ({
    visit,
    assert,
  }) => {
    const page = await visit('/')
    const headings = await page.locator('main h2').allInnerTexts()
    assert.deepEqual(headings, [
      'Yang kami cuci',
      'Cara kerjanya',
      'Daftar Layanan & Harga',
      'Kata pelanggan',
      'Pertanyaan umum',
    ])
    // The header links follow the same order (M4a-fix4).
    const links = await page
      .getByRole('navigation', { name: 'Navigasi utama' })
      .locator('a[href^="/#"]')
      .allInnerTexts()
    assert.deepEqual(links, [
      'Cara Kerja',
      'Layanan & Harga',
      'Area Layanan',
      'Ulasan',
      'Pertanyaan Umum',
    ])
  })

  test('landing page displays pricing section with a tab per item kind (GUEST-1)', async ({
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

    // Item kind tabs exist
    const shoeBtn = pricingSection.getByRole('tab', { name: /Sepatu/i })
    const bagBtn = pricingSection.getByRole('tab', { name: /Tas/i })
    const helmetBtn = pricingSection.getByRole('tab', { name: /Helm/i })

    assert.isTrue(await shoeBtn.isVisible())
    assert.isTrue(await bagBtn.isVisible())
    assert.isTrue(await helmetBtn.isVisible())

    // Click shoe tab: should see shoe services like Mild
    await shoeBtn.click()
    assert.isTrue(await pricingSection.getByText('Mild').first().isVisible())

    // Click helmet tab: should see helmet shop-only alert (SVC-4)
    await helmetBtn.click()
    const helmetNotice = pricingSection.getByText(/Khusus Bawa Langsung ke Toko/i).first()
    assert.isTrue(await helmetNotice.isVisible())

    // Click bag tab
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

  test('captures responsive screenshots and verifies axe accessibility for M3a-fix missing states', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const axeLogs: string[] = []

    // Prepare an inactive service in the database for the inactive state check
    const medium = await Service.findByOrFail('name', 'Medium')
    medium.isActive = false
    await medium.save()

    for (const vp of VIEWPORTS) {
      // 1. Landing price list filtered to Helm (landing-harga-helm-*)
      {
        await browserContext.clearCookies()
        const page = await visit('/')
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.waitForLoadState('networkidle')

        const pricing = page.locator('#harga')
        await pricing.scrollIntoViewIfNeeded()
        const helmetBtn = pricing.getByRole('tab', { name: /Helm/i })
        await helmetBtn.click()
        await pricing
          .getByText(/Khusus Bawa Langsung ke Toko/i)
          .first()
          .waitFor({ state: 'visible' })

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(
          scrollWidth,
          vp.width,
          `Horizontal scroll detected on landing helm at ${vp.name}px`
        )

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Landing helm axe violations at ${vp.name}px`)

        await saveScreenshot(page, `landing-harga-helm-${vp.name}.png`)
        axeLogs.push(
          `landing-harga-helm-${vp.name}: path=/#harga (filter=helm) scrollWidth=${scrollWidth} axe=none`
        )
      }

      // Login as owner for owner area screenshots
      await browserContext.loginAs(owner)
      const page = await visit('/admin/layanan')
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.waitForLoadState('networkidle')

      // 2. Owner mobile menu showing "Layanan" (admin-menu-layanan-*)
      {
        if (vp.width < 640) {
          const menuButton = page.getByRole('button', { name: 'Buka menu navigasi' })
          await menuButton.click()
          await page.getByRole('dialog').waitFor({ state: 'visible' })

          const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
          assert.isAtMost(scrollWidth, vp.width, `Scroll detected on owner menu at ${vp.name}px`)

          const axe = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .exclude('iframe[src*="cloudflare"]')
            .analyze()
          const violations = axe.violations.map(
            (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
          )
          assert.deepEqual(violations, [], `Owner menu axe violations at ${vp.name}px`)

          await saveScreenshot(page, `admin-menu-layanan-${vp.name}.png`)
          axeLogs.push(
            `admin-menu-layanan-${vp.name}: path=/admin/layanan (nav menu) scrollWidth=${scrollWidth} axe=none`
          )

          const closeMenu = page.getByRole('button', { name: 'Tutup menu' })
          await closeMenu.click()
          await page.getByRole('dialog').waitFor({ state: 'hidden' })
        } else {
          const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
          assert.isAtMost(scrollWidth, vp.width)

          const axe = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .exclude('iframe[src*="cloudflare"]')
            .analyze()
          const violations = axe.violations.map(
            (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
          )
          assert.deepEqual(violations, [], `Owner desktop menu axe violations at ${vp.name}px`)

          await saveScreenshot(page, `admin-menu-layanan-${vp.name}.png`)
          axeLogs.push(
            `admin-menu-layanan-${vp.name}: path=/admin/layanan (sidebar) scrollWidth=${scrollWidth} axe=none`
          )
        }
      }

      // 3. Empty search result (admin-layanan-empty-*)
      {
        const searchInput = page.getByPlaceholder(/Cari layanan/i)
        await searchInput.fill('layanan-tidak-ada-xyz')
        await page.getByText('Tidak ada layanan yang cocok').waitFor({ state: 'visible' })

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(scrollWidth, vp.width)

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Empty search axe violations at ${vp.name}px`)

        await saveScreenshot(page, `admin-layanan-empty-${vp.name}.png`)
        axeLogs.push(
          `admin-layanan-empty-${vp.name}: path=/admin/layanan (empty search) scrollWidth=${scrollWidth} axe=none`
        )

        await searchInput.fill('')
        await page.getByText('Tidak ada layanan yang cocok').waitFor({ state: 'hidden' })
      }

      // 4. Inactive service visible in table (admin-layanan-inactive-*)
      {
        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(scrollWidth, vp.width)

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Inactive service axe violations at ${vp.name}px`)

        await saveScreenshot(page, `admin-layanan-inactive-${vp.name}.png`)
        axeLogs.push(
          `admin-layanan-inactive-${vp.name}: path=/admin/layanan (inactive visible) scrollWidth=${scrollWidth} axe=none`
        )
      }

      // 5. Bulk selection bar (admin-layanan-bulk-*)
      {
        // One compact list on every width (D107).
        const rows = page.locator('section ul > li')
        await rows.nth(0).getByRole('checkbox').click({ force: true })
        await rows.nth(1).getByRole('checkbox').click({ force: true })

        await page.getByText(/layanan dipilih/i).waitFor({ state: 'visible' })

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(scrollWidth, vp.width)

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Bulk bar axe violations at ${vp.name}px`)

        await saveScreenshot(page, `admin-layanan-bulk-${vp.name}.png`)
        axeLogs.push(
          `admin-layanan-bulk-${vp.name}: path=/admin/layanan (bulk active) scrollWidth=${scrollWidth} axe=none`
        )

        // Deselect
        const cancelBulk = page.getByRole('button', { name: 'Batal' }).first()
        await cancelBulk.click()
        await page.getByText(/layanan dipilih/i).waitFor({ state: 'hidden' })
      }

      // 6. Delete confirmation dialog (admin-layanan-delete-*)
      {
        // Edit and delete sit in the row's ⋯ menu (D107).
        await page.getByRole('button', { name: 'Menu Medium' }).click()
        await page.getByRole('menuitem', { name: 'Hapus' }).click()
        // By name: the closing menu popover is briefly a dialog too.
        const deleteDialog = page.getByRole('dialog', { name: /Hapus Layanan/ })
        await deleteDialog.waitFor({ state: 'visible' })
        await deleteDialog
          .getByText(/Hapus Layanan/i)
          .first()
          .waitFor({ state: 'visible' })

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(scrollWidth, vp.width)

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Delete dialog axe violations at ${vp.name}px`)

        await saveScreenshot(page, `admin-layanan-delete-${vp.name}.png`)
        axeLogs.push(
          `admin-layanan-delete-${vp.name}: path=/admin/layanan (delete dialog) scrollWidth=${scrollWidth} axe=none`
        )

        const cancelDelete = deleteDialog.getByRole('button', { name: 'Batal' })
        await cancelDelete.click()
        await deleteDialog.waitFor({ state: 'hidden' })
      }

      // 7. Validation errors in add dialog (admin-layanan-error-*)
      {
        const addButton = page.getByRole('button', { name: /Tambah Layanan/i })
        await addButton.click()
        const formDialog = page.getByRole('dialog')
        await formDialog.waitFor({ state: 'visible' })

        // Clear name input if any and submit
        const nameInput = formDialog.locator('#field-name')
        await nameInput.fill('')
        const submitBtn = formDialog.getByRole('button', { name: 'Tambah Layanan' })
        await submitBtn.click()

        await formDialog.getByText('Nama layanan wajib diisi.').waitFor({ state: 'visible' })

        const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
        assert.isAtMost(scrollWidth, vp.width)

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('iframe[src*="cloudflare"]')
          .analyze()
        const violations = axe.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
        )
        assert.deepEqual(violations, [], `Add form error axe violations at ${vp.name}px`)

        await saveScreenshot(page, `admin-layanan-error-${vp.name}.png`)
        axeLogs.push(
          `admin-layanan-error-${vp.name}: path=/admin/layanan (add form validation errors) scrollWidth=${scrollWidth} axe=none`
        )

        const cancelAdd = formDialog.getByRole('button', { name: 'Batal' })
        await cancelAdd.scrollIntoViewIfNeeded()
        await cancelAdd.click({ force: true })
        await formDialog.waitFor({ state: 'hidden' })
      }
    }

    await saveScreenshotLog('screenshots.log', axeLogs)
  })
})
