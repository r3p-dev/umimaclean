import { test } from '@japa/runner'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { saveElementScreenshot, saveScreenshot, saveScreenshotLog } from '../helpers/screenshots.js'

const VIEWPORTS = [
  { name: '360', width: 360, height: 780 },
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
] as const

const LOCAL_HOSTS = ['localhost', '127.0.0.1']

async function axeViolations(page: ConstructorParameters<typeof AxeBuilder>[0]['page']) {
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return axe.violations.map(
    (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(' | ')}`
  )
}

test.group('Maps (MAP-2, AREA-1, OWN-9, GUEST-1, AREA-4)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('the owner sees the districts on a map with the credits, and no other host is asked (OWN-9, MAP-2, AREA-1)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    await browserContext.loginAs(owner)
    const outsideRequests: string[] = []
    browserContext.on('request', (request) => {
      if (!LOCAL_HOSTS.includes(new URL(request.url()).hostname)) {
        outsideRequests.push(request.url())
      }
    })
    const logLines: string[] = []

    for (const viewport of VIEWPORTS) {
      const page = await visit('/admin/pengaturan/area')
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.locator('.maplibregl-canvas').waitFor()
      await page.waitForLoadState('networkidle')

      const attribution = page.locator('.maplibregl-ctrl-attrib')
      assert.notInclude(await attribution.getAttribute('class'), 'maplibregl-compact')
      const credits = await page.locator('.maplibregl-ctrl-attrib-inner').innerText()
      assert.include(credits, '© OpenStreetMap contributors')
      assert.include(credits, 'BPS via OCHA/HDX')
      assert.include(credits, 'CC BY-IGO 3.0')
      assert.include(credits, 'diubah')
      assert.isTrue(await page.getByText('Nonaktif', { exact: true }).isVisible())

      const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
      assert.isAtMost(scrollWidth, viewport.width, `Horizontal scroll at ${viewport.name}px`)
      assert.deepEqual(
        await axeViolations(page),
        [],
        `Area map axe violations at ${viewport.name}px`
      )

      await saveScreenshot(page, `admin-area-peta-${viewport.name}.png`)
      logLines.push(`admin-area-peta-${viewport.name}: scrollWidth=${scrollWidth} axe=none`)
    }

    assert.deepEqual(outsideRequests, [])
    await saveScreenshotLog('admin-area-peta-screenshots.log', logLines)
  })

  test('a guest checks a kecamatan in the hero and the landing loads no map (GUEST-1, NFR-3)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    // Only this test's pages count: a page of an earlier test may still be loading its map.
    const landingPages = new Set<unknown>()
    browserContext.on('page', (page) => landingPages.add(page))
    const mapRequests: string[] = []
    browserContext.on('request', (request) => {
      // In development Vite also links the CSS of modules the server render can reach (the owner
      // map's lazy chunk); the production manifest links only the entry's CSS (EVIDENCE M4a-fix1).
      const url = request.url()
      if (
        landingPages.has(request.frame().page()) &&
        !url.endsWith('.css') &&
        /maplibre|area_map|pmtiles/.test(url)
      ) {
        mapRequests.push(request.url())
      }
    })
    const logLines: string[] = []

    for (const viewport of VIEWPORTS) {
      const page = await visit('/')
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForLoadState('networkidle')
      assert.isNull(await page.$('#area-layanan'))

      const form = page.locator('#cek-area')
      const status = form.getByRole('status')
      const field = form.getByLabel('Cek dulu, alamat Anda bisa dijemput?')
      await status.getByText('Ketik nama kecamatan untuk mengecek').waitFor()
      // The check runs by itself once typing pauses (D100, M4a-fix3).
      await field.fill('kec. coblong')
      await status
        .getByText('Kec. Coblong, Kota Bandung masuk area layanan. Antar-jemput gratis.')
        .waitFor()

      const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
      assert.isAtMost(scrollWidth, viewport.width, `Horizontal scroll at ${viewport.name}px`)
      assert.deepEqual(
        await axeViolations(page),
        [],
        `Landing axe violations at ${viewport.name}px`
      )
      await saveElementScreenshot(
        page.locator('section').first(),
        `hero-cek-terjangkau-${viewport.name}.png`
      )

      // Enter checks at once.
      await field.fill('Cileunyi')
      await field.press('Enter')
      await status.getByText('Kec. Cileunyi, Kabupaten Bandung belum masuk area layanan.').waitFor()
      await saveElementScreenshot(
        page.locator('section').first(),
        `hero-cek-belum-${viewport.name}.png`
      )

      logLines.push(`hero-cek-${viewport.name}: scrollWidth=${scrollWidth} axe=none`)
    }

    assert.deepEqual(mapRequests, [])
    await saveScreenshotLog('hero-cek-screenshots.log', logLines)
  })
})
