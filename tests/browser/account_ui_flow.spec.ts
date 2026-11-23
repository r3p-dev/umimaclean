import { test } from '@japa/runner'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { saveScreenshot, saveScreenshotLog } from '../helpers/screenshots.js'

type Page = ConstructorParameters<typeof AxeBuilder>[0]['page']

const VIEWPORTS = [
  { name: '360', width: 360, height: 780 },
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
] as const

const PROFILES = [
  { role: Role.CUSTOMER, path: '/profil', name: 'pelanggan' },
  { role: Role.STAFF, path: '/staf/profil', name: 'staf' },
  { role: Role.ADMIN, path: '/admin/profil', name: 'owner' },
] as const

async function axeViolations(page: Page) {
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return axe.violations.map(
    (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(' | ')}`
  )
}

async function scrollWidth(page: Page) {
  return Number(await page.evaluate('document.documentElement.scrollWidth'))
}

test.group('Signing out and dashboard cards (D107)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('every role signs out from the "Akun" card at the bottom of its Profil page', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const logLines: string[] = []
    for (const profile of PROFILES) {
      const user = await User.query().where('role', profile.role).firstOrFail()
      // A name long enough to need two lines at 360 px.
      user.fullName = `${user.fullName} Kusumawardhani Wijayakusuma`
      await user.save()
      for (const viewport of VIEWPORTS) {
        await browserContext.clearCookies()
        await browserContext.loginAs(user)
        const page = await visit(profile.path)
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.waitForLoadState('networkidle')

        // A long name wraps: never cut, never under "Ubah" (customers only have "Ubah").
        const name = page.locator('[data-slot="account-name"]')
        assert.equal(await name.innerText(), user.fullName)
        // A string, like the other page checks here: the test tsconfig has no DOM types.
        const nameFits = Boolean(
          await page.evaluate(
            `(() => { const el = document.querySelector('[data-slot="account-name"]'); return el.scrollWidth <= el.clientWidth })()`
          )
        )
        assert.isTrue(nameFits, `${profile.name} name cut at ${viewport.name}px`)
        // Squeezed into a narrow column, a name breaks inside its words: keep it wide.
        const nameWidth = (await name.boundingBox())!.width
        assert.isAtLeast(nameWidth, 150, `${profile.name} name squeezed at ${viewport.name}px`)
        const edit = page.getByRole('link', { name: 'Ubah' })
        if ((await edit.count()) > 0) {
          const [nameBox, editBox] = [await name.boundingBox(), await edit.boundingBox()]
          // "Ubah" sits beside the name on wide screens and below it on phones: never on top.
          const isBeside = nameBox!.x + nameBox!.width <= editBox!.x
          const isBelow = nameBox!.y + nameBox!.height <= editBox!.y
          assert.isTrue(isBeside || isBelow, `name and Ubah overlap at ${viewport.name}px`)
        }
        const card = page.locator('[data-slot="card"]', { hasText: 'Keluar dari akun ini' })
        await card.getByRole('button', { name: 'Keluar' }).waitFor()
        // Staff and owner also find it at the bottom of the desktop side nav.
        if (profile.role !== Role.CUSTOMER && viewport.width >= 1024) {
          assert.equal(
            await page.locator('aside').getByRole('button', { name: 'Keluar' }).count(),
            1
          )
        }
        const width = await scrollWidth(page)
        assert.isAtMost(width, viewport.width, `${profile.name} at ${viewport.name}px`)
        const violations = await axeViolations(page)
        assert.deepEqual(
          violations,
          [],
          `${profile.name} at ${viewport.name}px: ${violations.join(', ')}`
        )
        await saveScreenshot(page, `profil-${profile.name}-${viewport.name}.png`)
        logLines.push(`profil-${profile.name}-${viewport.name}: scrollWidth=${width} axe=none`)
      }

      const page = await visit(profile.path)
      await page
        .locator('[data-slot="card"]', { hasText: 'Keluar dari akun ini' })
        .getByRole('button', { name: 'Keluar' })
        .click()
      await page.waitForURL(/\/(staf\/)?masuk$/)
    }
    await saveScreenshotLog('profil-screenshots.log', logLines)
  })

  test('a customer opens the account menu in the header for Profil and Keluar', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const customer = await User.query().where('role', Role.CUSTOMER).firstOrFail()
    await browserContext.loginAs(customer)
    for (const viewport of VIEWPORTS) {
      const page = await visit('/beranda')
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page
        .getByRole('button', { name: new RegExp(`^${customer.fullName}\\s*,\\s*menu akun$`) })
        .click()
      await page.getByRole('menuitem', { name: 'Profil' }).waitFor()
      // Wait for the opening animation to finish before the screenshot.
      await page.locator('[data-slot="dropdown-menu-content"]:not([data-entering])').waitFor()
      assert.equal(await page.getByRole('menuitem', { name: 'Keluar' }).count(), 1)
      await saveScreenshot(page, `menu-akun-${viewport.name}.png`)
      await page.keyboard.press('Escape')
    }

    const page = await visit('/beranda')
    await page
      .getByRole('button', { name: new RegExp(`^${customer.fullName}\\s*,\\s*menu akun$`) })
      .click()
    await page.getByRole('menuitem', { name: 'Profil' }).click()
    await page.waitForURL('**/profil')
  })

  test('the staff queue and the owner summary use the same stat card', async ({
    visit,
    browserContext,
    assert,
  }) => {
    for (const [role, path, name] of [
      [Role.STAFF, '/staf', 'staf'],
      [Role.ADMIN, '/admin', 'owner'],
    ] as const) {
      const user = await User.query().where('role', role).firstOrFail()
      await browserContext.clearCookies()
      await browserContext.loginAs(user)
      for (const viewport of VIEWPORTS) {
        const page = await visit(path)
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.waitForLoadState('networkidle')
        const cards = page.locator('[data-slot="stat-card"]')
        assert.isAtLeast(await cards.count(), 3)
        assert.isAtMost(await scrollWidth(page), viewport.width)
        assert.deepEqual(await axeViolations(page), [], `${name} at ${viewport.name}px`)
        await saveScreenshot(page, `beranda-${name}-${viewport.name}.png`)
      }
    }
  })
})
