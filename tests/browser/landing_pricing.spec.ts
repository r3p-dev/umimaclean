import { test } from '@japa/runner'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import { saveElementScreenshot, saveScreenshotLog } from '../helpers/screenshots.js'

const STARTING_FROM_LINE = 'Harga bertanda “mulai dari” dipastikan setelah barang diperiksa.'

const VIEWPORTS = [
  { name: '360', width: 360, height: 780 },
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
] as const

test.group('Landing price list (GUEST-1)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('the shoe tab confirms "mulai dari" prices after inspection, passes axe and does not scroll sideways (GUEST-1)', async ({
    visit,
    assert,
  }) => {
    const logLines: string[] = []

    for (const viewport of VIEWPORTS) {
      const page = await visit('/')
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForLoadState('networkidle')

      const section = page.locator('#harga')
      await section.scrollIntoViewIfNeeded()
      assert.isTrue(await section.getByText(STARTING_FROM_LINE).isVisible())

      const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
      assert.isAtMost(scrollWidth, viewport.width, `Horizontal scroll at ${viewport.name}px`)

      const axe = await new AxeBuilder({ page })
        .include('#harga')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      const violations = axe.violations.map(
        (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(' | ')}`
      )
      assert.deepEqual(violations, [], `Price list axe violations at ${viewport.name}px`)

      await saveElementScreenshot(section, `harga-mulai-dari-sepatu-${viewport.name}.png`)
      logLines.push(
        `harga-mulai-dari-sepatu-${viewport.name}: section=#harga tab=Sepatu scrollWidth=${scrollWidth} axe=none`
      )
    }

    await saveScreenshotLog('harga-mulai-dari-sepatu-screenshots.log', logLines)
  })

  test('the helmet tab shows the store-only note and no "mulai dari" line (SVC-4, GUEST-1)', async ({
    visit,
    assert,
  }) => {
    const logLines: string[] = []

    for (const viewport of VIEWPORTS) {
      const page = await visit('/')
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForLoadState('networkidle')

      const section = page.locator('#harga')
      await section.scrollIntoViewIfNeeded()
      await section.getByRole('tab', { name: 'Helm' }).click()

      const note = section.getByRole('note')
      await note.waitFor({ state: 'visible' })
      assert.equal(
        await note.textContent(),
        'Khusus bawa langsung ke toko: helm tidak bisa dijemput.'
      )
      assert.isTrue(await section.getByText('Helmet Spa Reguler').isVisible())
      assert.isFalse(await section.getByText(STARTING_FROM_LINE).isVisible())

      const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
      assert.isAtMost(scrollWidth, viewport.width, `Horizontal scroll at ${viewport.name}px`)

      const axe = await new AxeBuilder({ page })
        .include('#harga')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      const violations = axe.violations.map(
        (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(' | ')}`
      )
      assert.deepEqual(violations, [], `Helmet tab axe violations at ${viewport.name}px`)

      await saveElementScreenshot(section, `harga-tanpa-mulai-dari-helm-${viewport.name}.png`)
      logLines.push(
        `harga-tanpa-mulai-dari-helm-${viewport.name}: section=#harga tab=Helm scrollWidth=${scrollWidth} axe=none`
      )
    }

    await saveScreenshotLog('harga-tanpa-mulai-dari-helm-screenshots.log', logLines)
  })
})
