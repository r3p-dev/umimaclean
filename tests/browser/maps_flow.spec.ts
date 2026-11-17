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

const BUAHBATU = { latitude: -6.955631, longitude: 107.6539748 }
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

  test('a guest checks a location with "use my location" and by dragging the pin, one request per stop (GUEST-1, AREA-4)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    await browserContext.grantPermissions(['geolocation'])
    await browserContext.setGeolocation(BUAHBATU)
    const outsideRequests: string[] = []
    browserContext.on('request', (request) => {
      if (!LOCAL_HOSTS.includes(new URL(request.url()).hostname)) {
        outsideRequests.push(request.url())
      }
    })
    const logLines: string[] = []

    for (const viewport of VIEWPORTS) {
      const page = await visit('/')
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      const checks: string[] = []
      page.on('request', (request) => {
        if (new URL(request.url()).pathname === '/area/cek') {
          checks.push(request.url())
        }
      })

      const section = page.locator('#area-layanan')
      await section.scrollIntoViewIfNeeded()
      await section.locator('.maplibregl-canvas').waitFor()
      await section.getByText('Kota Bandung', { exact: true }).waitFor()
      const status = section.getByRole('status')
      assert.include(await status.innerText(), 'Geser pin ke lokasi Anda')

      await section.getByRole('button', { name: 'Gunakan lokasi saya' }).click()
      await status.getByText('Terjangkau: Kecamatan Buahbatu, Kota Bandung.').waitFor()
      assert.lengthOf(checks, 1)

      const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
      assert.isAtMost(scrollWidth, viewport.width, `Horizontal scroll at ${viewport.name}px`)
      assert.deepEqual(
        await axeViolations(page),
        [],
        `Landing axe violations at ${viewport.name}px`
      )
      await saveElementScreenshot(section, `landing-area-terjangkau-${viewport.name}.png`)

      // Drag the pin once the map has finished flying to the location (the pin moves with it).
      const pin = section.locator('.maplibregl-marker')
      let pinBox = await pin.boundingBox()
      for (let attempt = 0; attempt < 20; attempt++) {
        await page.waitForTimeout(250)
        const nextBox = await pin.boundingBox()
        if (nextBox && pinBox && nextBox.x === pinBox.x && nextBox.y === pinBox.y) {
          break
        }
        pinBox = nextBox
      }
      assert.isNotNull(pinBox)
      const startX = pinBox!.x + pinBox!.width / 2
      const startY = pinBox!.y + pinBox!.height / 3
      const nextCheck = page.waitForResponse(
        (response) => new URL(response.url()).pathname === '/area/cek'
      )
      // End the drag inside the canvas, away from the controls: MapLibre ignores a mouseup over them.
      const canvasBox = await section.locator('.maplibregl-canvas').boundingBox()
      await page.mouse.move(startX, startY)
      await page.mouse.down()
      await page.mouse.move(
        canvasBox!.x + canvasBox!.width * 0.2,
        canvasBox!.y + canvasBox!.height * 0.3,
        {
          steps: 15,
        }
      )
      await page.mouse.up()
      await nextCheck
      await page.waitForTimeout(600)
      assert.lengthOf(checks, 2, 'one request after the pin stopped, none while it moved')
      const movedBox = await section.locator('.maplibregl-marker').boundingBox()
      assert.notEqual(movedBox!.x, pinBox!.x)
      assert.notInclude(await status.innerText(), 'Memeriksa')
      await saveElementScreenshot(section, `landing-area-geser-${viewport.name}.png`)

      logLines.push(
        `landing-area-${viewport.name}: scrollWidth=${scrollWidth} axe=none checks=${checks.length} after drag: ${await status.innerText()}`
      )
    }

    assert.deepEqual(outsideRequests, [])
    await saveScreenshotLog('landing-area-screenshots.log', logLines)
  })
})
