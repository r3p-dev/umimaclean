import { test } from '@japa/runner'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { saveElementScreenshot, saveScreenshotLog } from '../helpers/screenshots.js'

const VIEWPORTS = [
  { name: '360', width: 360, height: 780 },
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
] as const

async function axeViolations(page: ConstructorParameters<typeof AxeBuilder>[0]['page']) {
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return axe.violations.map(
    (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(' | ')}`
  )
}

test.group('Opening hours (OWN-8, GUEST-1)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('the owner sets the hours and a temporary closure, and the landing shows them (OWN-8, GUEST-1)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    await browserContext.loginAs(owner)
    const logLines: string[] = []

    for (const viewport of VIEWPORTS) {
      const settings = await visit('/admin/pengaturan/toko')
      await settings.setViewportSize({ width: viewport.width, height: viewport.height })
      const card = settings.locator('[data-slot="card"]', { hasText: 'Simpan Jam Buka' })
      await card.getByLabel('Jam tutup hari Sabtu').fill('15:00')
      const closure = card.getByRole('switch', { name: 'Tutup sementara' })
      if (!(await closure.isChecked())) {
        // React Aria's label covers the hidden input, as in settings_flow.spec.ts.
        await closure.click({ force: true })
      }
      await card.getByLabel('Catatan untuk pelanggan').fill('Renovasi')
      await card.getByRole('button', { name: 'Simpan Jam Buka' }).click()
      await settings.getByText('Jam buka berhasil disimpan.').waitFor()
      await settings.getByText('Jam buka berhasil disimpan.').waitFor({ state: 'hidden' })

      const settingsScroll = Number(await settings.evaluate('document.documentElement.scrollWidth'))
      assert.isAtMost(settingsScroll, viewport.width, `Horizontal scroll at ${viewport.name}px`)
      assert.deepEqual(await axeViolations(settings), [], `Hours form axe at ${viewport.name}px`)
      await saveElementScreenshot(card, `jam-buka-form-${viewport.name}.png`)

      const landing = await visit('/')
      await landing.setViewportSize({ width: viewport.width, height: viewport.height })
      const hero = landing.locator('section').first()
      assert.include(await hero.innerText(), 'Tutup sementara (Renovasi)')
      assert.include(await landing.locator('footer').innerText(), 'Sabtu 09.00–15.00')
      assert.deepEqual(await axeViolations(landing), [], `Landing axe at ${viewport.name}px`)
      await saveElementScreenshot(hero, `hero-jam-buka-${viewport.name}.png`)

      logLines.push(`jam-buka-${viewport.name}: scrollWidth=${settingsScroll} axe=none`)
    }

    await saveScreenshotLog('jam-buka-screenshots.log', logLines)
  })
})
