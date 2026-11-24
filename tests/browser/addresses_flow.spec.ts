import { test } from '@japa/runner'
import env from '#start/env'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import CustomerAddress from '#models/customer_address'
import User from '#models/user'
import { normalizePhone } from '#helpers/phone'
import { loadOsmFixture } from '../helpers/osm.js'
import {
  saveScreenshot,
  saveScreenshotLog,
  saveViewportScreenshot,
} from '../helpers/screenshots.js'

const VIEWPORTS = [
  { name: '360', width: 360, height: 780 },
  { name: '1440', width: 1440, height: 900 },
] as const

// Inside Coblong (active) and Cileunyi (inactive in the seed).
const COBLONG = { latitude: -6.881768, longitude: 107.61421 }
const CILEUNYI = { latitude: -6.925479, longitude: 107.742516 }
const SAVE_ERROR =
  'Titik ini di luar area layanan. Geser peta ke alamat di area antar-jemput gratis.'

async function axeViolations(page: ConstructorParameters<typeof AxeBuilder>[0]['page']) {
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return axe.violations.map(
    (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(' | ')}`
  )
}

type MapCanvas = {
  boundingBox(): Promise<{ width: number; height: number } | null>
  click(options: { position: { x: number; y: number } }): Promise<void>
}

// A tap 60 px above the pin moves that spot under it (D109).
async function tapAbovePin(canvas: MapCanvas) {
  const box = await canvas.boundingBox()
  if (!box) {
    throw new Error('The map canvas is not on the page')
  }
  await canvas.click({ position: { x: box.width / 2, y: box.height / 2 - 60 } })
}

function seededCustomer() {
  return User.findByOrFail('phone', normalizePhone('082111223344'))
}

test.group('Addresses (CUST-2, CUST-3, CUST-14, AREA-4, D82)', (group) => {
  group.each.setup(async () => {
    // Each pin stop and resize asks the coverage check, which shares 60 per minute per IP (D80).
    await limiter.clear(['memory'])
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('the list shows the primary first and an address outside the area (CUST-14, D82)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    await browserContext.loginAs(await seededCustomer())
    const logLines: string[] = []

    for (const viewport of VIEWPORTS) {
      const page = await visit('/profil/alamat')
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.getByRole('heading', { name: 'Alamat', level: 1 }).waitFor()

      const titles = await page.getByRole('heading', { level: 2 }).allInnerTexts()
      assert.deepEqual(
        titles.map((title) => title.replace(/\s+/g, ' ').trim()),
        ['Rumah Utama', 'Kos Adik', 'Kantor']
      )
      assert.isTrue(await page.getByText('Di luar area layanan', { exact: true }).isVisible())
      assert.isFalse(await page.getByRole('link', { name: 'Tambah alamat' }).isVisible())

      const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
      assert.isAtMost(scrollWidth, viewport.width, `Horizontal scroll at ${viewport.name}px`)
      assert.deepEqual(await axeViolations(page), [], `Address list axe at ${viewport.name}px`)
      await saveScreenshot(page, `alamat-daftar-${viewport.name}.png`)
      logLines.push(`alamat-daftar-${viewport.name}: scrollWidth=${scrollWidth} axe=none`)
    }
    await saveScreenshotLog('alamat-daftar-screenshots.log', logLines)
  })

  test('a customer deletes an address, then adds one on one page: search, house number, pin (CUST-3, CUST-14, AREA-4, MAP-1)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    await loadOsmFixture()
    const customer = await seededCustomer()
    await browserContext.loginAs(customer)
    await browserContext.grantPermissions(['geolocation'])
    const logLines: string[] = []

    const page = await visit('/profil/alamat')
    await page.getByRole('link', { name: 'Ubah Kos Adik' }).click()
    assert.deepEqual(await axeViolations(page), [], 'Address edit page axe')
    await page.getByRole('button', { name: 'Hapus alamat' }).click()
    await page.getByRole('dialog').waitFor()
    assert.deepEqual(await axeViolations(page), [], 'Delete dialog axe')
    await page.getByRole('dialog').getByRole('button', { name: 'Hapus alamat' }).click()
    await page.getByText('Alamat Kos Adik dihapus.').waitFor()
    await page.getByRole('link', { name: 'Tambah alamat' }).click()

    const status = page.getByRole('status')
    await page.locator('.maplibregl-canvas').waitFor()
    await status.getByText('Masuk area layanan.').waitFor()

    // The address field is the place search: typing lists places under it.
    const street = page.getByRole('textbox', { name: 'Nama jalan, gedung, no. rumah' })
    const result = page.getByRole('option', { name: /Jalan Dipatiukur/ })
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await street.fill('')
      await street.fill('dipati ukur')
      await result.waitFor()
      assert.include(await result.innerText(), 'Lebakgede, Kec. Coblong')
      // Brings the field near the top, where it sits while the phone keyboard is open.
      await page.evaluate(
        "window.scrollBy(0, document.querySelector('[name=addressText]').getBoundingClientRect().top - 120)"
      )
      const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
      assert.isAtMost(scrollWidth, viewport.width, `Horizontal scroll at ${viewport.name}px`)
      assert.deepEqual(await axeViolations(page), [], `Suggestions axe at ${viewport.name}px`)
      await saveViewportScreenshot(page, `alamat-cari-${viewport.name}.png`)
      logLines.push(`alamat-cari-${viewport.name}: suggestions open scrollWidth=${scrollWidth}`)
      await page.keyboard.press('Escape')
      await result.waitFor({ state: 'detached' })
    }

    // Choosing one fills the field with its full name and moves the pin; the house number goes after it.
    await street.fill('')
    await street.fill('dipati ukur')
    await result.click()
    assert.equal(await street.inputValue(), 'Jalan Dipatiukur, Lebakgede, Coblong')
    // The keyboard picks the same way: down arrow into the list, Enter.
    await street.fill('dipati ukur')
    await result.waitFor()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await result.waitFor({ state: 'detached' })
    assert.equal(await street.inputValue(), 'Jalan Dipatiukur, Lebakgede, Coblong')
    await status.getByText('Masuk area layanan.').waitFor()
    // Only the coverage line shows under the map; the street and area are stored on save.
    const statusText = await status.innerText()
    assert.equal(statusText.trim(), 'Masuk area layanan.')
    // Typing the house number after the chosen name does not reopen the suggestions.
    await street.press('End')
    await street.pressSequentially(', No. 12')
    await page.waitForTimeout(800)
    assert.equal(await page.getByRole('option').count(), 0, 'The house number reopened the list')
    await page
      .getByLabel('Detail lainnya (cth: blok / unit no., patokan)')
      .fill('RT 01/RW 03, pagar biru')

    // Outside the area the status says so; the device's location moves the pin.
    await browserContext.setGeolocation(CILEUNYI)
    await page.getByRole('button', { name: 'Gunakan lokasi saya' }).click()
    await status.getByText(/^Di luar area layanan/).waitFor()
    await browserContext.setGeolocation(COBLONG)
    await page.getByRole('button', { name: 'Gunakan lokasi saya' }).click()
    await status.getByText('Masuk area layanan.').waitFor()

    // The non-drag ways to move the pin (WCAG 2.5.7): a tap above it, then the up arrow key on the
    // focused map; each moves it north and is checked again.
    const lat = page.locator('input[name=lat]')
    const beforeTap = await lat.inputValue()
    await tapAbovePin(page.locator('.maplibregl-canvas'))
    await page.waitForFunction(`document.querySelector('input[name=lat]').value !== '${beforeTap}'`)
    const beforeKey = await lat.inputValue()
    await page.locator('.maplibregl-canvas').focus()
    await page.keyboard.press('ArrowUp')
    await page.waitForFunction(`document.querySelector('input[name=lat]').value !== '${beforeKey}'`)
    await status.getByText('Masuk area layanan.').waitFor()
    await page.getByRole('radio', { name: 'Lainnya' }).click()
    await page.getByLabel('Nama label').fill('Rumah Ibu')

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(500)
      await status.getByText('Masuk area layanan.').waitFor()
      const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
      assert.isAtMost(scrollWidth, viewport.width, `Horizontal scroll at ${viewport.name}px`)
      assert.deepEqual(await axeViolations(page), [], `Address form axe at ${viewport.name}px`)
      // From the top, so the sticky header is not drawn in the middle of the full-page capture.
      await page.evaluate('window.scrollTo(0, 0)')
      await saveScreenshot(page, `alamat-baru-${viewport.name}.png`)
      logLines.push(`alamat-baru-${viewport.name}: scrollWidth=${scrollWidth} axe=none`)
    }

    await page.getByRole('button', { name: 'Simpan alamat' }).click()
    await page.getByText('Alamat disimpan.').waitFor()

    const saved = await CustomerAddress.query()
      .where('user_id', customer.id)
      .where('label', 'Rumah Ibu')
      .firstOrFail()
    assert.isFalse(saved.isPrimary)
    assert.equal(saved.recipientPhone, customer.phone)
    assert.equal(saved.addressText, 'Jalan Dipatiukur, Lebakgede, Coblong, No. 12')
    assert.equal(saved.details, 'RT 01/RW 03, pagar biru')
    assert.equal(saved.kecamatan, 'Coblong')
    assert.equal(saved.city, 'Kota Bandung')
    assert.isAbove(saved.lat, COBLONG.latitude)
    await saveScreenshotLog('alamat-baru-screenshots.log', logLines)
  })

  test('editing an address keeps its text and moves only the pin (CUST-3, D109)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    await browserContext.loginAs(await seededCustomer())
    await browserContext.clearPermissions()

    const page = await visit('/profil/alamat')
    await page.getByRole('link', { name: 'Ubah Kantor' }).click()
    await page.locator('.maplibregl-canvas').waitFor()
    // Without location permission the button goes away and the pin is placed by hand.
    const locate = page.getByRole('button', { name: 'Gunakan lokasi saya' })
    if (await locate.isVisible()) {
      await locate.click()
      await locate.waitFor({ state: 'detached' })
    }
    await tapAbovePin(page.locator('.maplibregl-canvas'))
    await page.getByRole('status').getByText('Masuk area layanan.').waitFor()

    await page.getByRole('button', { name: 'Simpan alamat' }).click()
    await page.getByText('Alamat diperbarui.').waitFor()
    const kantor = await CustomerAddress.findByOrFail('label', 'Kantor')
    assert.equal(kantor.addressText, 'Jalan Mulya Sari No. 120, Sukagalih, Sukajadi')
    assert.equal(kantor.details, 'Lantai 2')
  })

  test('on a phone: a still preview, then "Ubah lokasi"; back keeps the pin, "Konfirmasi" sets it (CUST-3, D109)', async ({
    browser,
    assert,
  }) => {
    await loadOsmFixture()
    // A touch phone: taps send touch events, then the browser's own click.
    const context = await browser.newContext({
      baseURL: `http://${env.get('HOST')}:${env.get('PORT')}`,
      viewport: { width: 360, height: 780 },
      hasTouch: true,
      isMobile: true,
      geolocation: COBLONG,
      permissions: ['geolocation'],
    })
    await context.loginAs(await seededCustomer())
    const page = await context.newPage()
    const logLines: string[] = []

    await page.goto('/profil/alamat')
    await page.getByRole('link', { name: 'Ubah Kantor' }).tap()
    await page.locator('.maplibregl-canvas').waitFor()
    await page.getByRole('status').getByText('Masuk area layanan.').waitFor()
    const lat = page.locator('input[name=lat]')
    const savedLat = await lat.inputValue()

    // The preview takes no gestures, so scrolling the page never moves it.
    assert.equal(
      await page.locator('.maplibregl-canvas-container.maplibregl-interactive').count(),
      0
    )
    assert.equal(await page.getByRole('button', { name: 'Perbesar' }).count(), 0)
    assert.deepEqual(await axeViolations(page), [], 'Phone form axe')

    // The back arrow closes the sheet and keeps the old point.
    const sheet = page.getByRole('dialog', { name: 'Ubah lokasi' })
    await page.getByRole('button', { name: 'Atur pin' }).tap()
    await sheet.locator('.maplibregl-canvas').waitFor()
    await sheet.getByRole('button', { name: 'Gunakan lokasi saya' }).tap()
    await sheet.getByText('Lebakgede, Kec. Coblong, Kota Bandung').waitFor()
    await sheet.getByRole('button', { name: 'Kembali' }).tap()
    await sheet.waitFor({ state: 'detached' })
    await page.waitForTimeout(500)
    assert.equal(await sheet.count(), 0, 'The sheet opened again after the back arrow')
    assert.equal(await lat.inputValue(), savedLat)

    // A tap on the preview opens it again; the card shows the form's text and the area under the
    // pin, without any input field.
    const preview = page.locator('.maplibregl-canvas')
    await preview.scrollIntoViewIfNeeded()
    const box = await preview.boundingBox()
    assert.isNotNull(box)
    await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + 20)
    await sheet.locator('.maplibregl-canvas').waitFor()
    const card = sheet.getByRole('region', { name: 'Alamat yang dipilih' })
    await card.getByText('Jalan Mulya Sari No. 120, Sukagalih, Sukajadi').waitFor()
    // The test's OSM rows cover only Dipatiukur, so no kelurahan is named here.
    await card.getByText('Kec. Sukajadi, Kota Bandung', { exact: true }).waitFor()
    assert.equal(await sheet.getByRole('textbox').count(), 0)
    await sheet.getByRole('button', { name: 'Gunakan lokasi saya' }).tap()
    await card.getByText('Lebakgede, Kec. Coblong, Kota Bandung').waitFor()
    await sheet.getByRole('status').getByText('Masuk area layanan.').waitFor()
    await page.waitForTimeout(500)
    assert.deepEqual(await axeViolations(page), [], 'Ubah lokasi axe')
    await saveViewportScreenshot(page, 'alamat-peta-360.png')
    logLines.push('alamat-peta-360: Ubah lokasi open after the device location')

    // "Konfirmasi" closes the sheet and hands the new point to the form.
    await sheet.getByRole('button', { name: 'Konfirmasi' }).tap()
    await sheet.waitFor({ state: 'detached' })
    await page.waitForTimeout(500)
    assert.equal(await sheet.count(), 0, 'The sheet opened again after "Konfirmasi"')
    assert.equal(Number(await lat.inputValue()), COBLONG.latitude)
    await page.getByRole('button', { name: 'Simpan alamat' }).tap()
    await page.getByText('Alamat diperbarui.').waitFor()
    const kantor = await CustomerAddress.findByOrFail('label', 'Kantor')
    assert.equal(kantor.addressText, 'Jalan Mulya Sari No. 120, Sukagalih, Sukajadi')
    assert.equal(kantor.street, 'Jalan Dipatiukur')
    assert.equal(kantor.kelurahan, 'Lebakgede')
    assert.equal(kantor.kecamatan, 'Coblong')
    await saveScreenshotLog('alamat-peta-screenshots.log', logLines)
    await context.close()
  })

  test('without OSM data the search says so and the pin is still placed by hand (MAP-1, NFR-4)', async ({
    visit,
    browserContext,
  }) => {
    await browserContext.loginAs(await seededCustomer())

    const page = await visit('/profil/alamat')
    await page.getByRole('link', { name: 'Ubah Kantor' }).click()
    await page.locator('.maplibregl-canvas').waitFor()
    const street = page.getByRole('textbox', { name: 'Nama jalan, gedung, no. rumah' })
    await street.fill('Jalan Dipatiukur No. 3')
    await page.getByText('Pencarian tempat belum tersedia. Atur pin di peta.').waitFor()

    await page.keyboard.press('Escape')
    await tapAbovePin(page.locator('.maplibregl-canvas'))
    await page.getByRole('status').getByText('Masuk area layanan.').waitFor()
    await page.getByRole('button', { name: 'Simpan alamat' }).click()
    await page.getByText('Alamat diperbarui.').waitFor()
  })

  test('a save refused for a pin outside the area clears once the pin moves inside (AREA-4)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    await browserContext.loginAs(await seededCustomer())
    await browserContext.grantPermissions(['geolocation'])

    // "Kos Adik" is in Cileunyi, turned off after it was saved (D82): saving it is refused.
    const page = await visit('/profil/alamat')
    await page.getByRole('link', { name: 'Ubah Kos Adik' }).click()
    await page.locator('.maplibregl-canvas').waitFor()
    await page.getByRole('button', { name: 'Simpan alamat' }).click()
    await page.getByText(SAVE_ERROR).waitFor()

    await browserContext.setGeolocation(COBLONG)
    await page.getByRole('button', { name: 'Gunakan lokasi saya' }).click()
    await page.getByRole('status').getByText('Masuk area layanan.').waitFor()
    await page.getByText(SAVE_ERROR).waitFor({ state: 'detached' })

    await page.getByRole('button', { name: 'Simpan alamat' }).click()
    await page.getByText('Alamat diperbarui.').waitFor()
    const kosAdik = await CustomerAddress.findByOrFail('label', 'Kos Adik')
    assert.closeTo(kosAdik.lat, COBLONG.latitude, 0.0001)
    assert.equal(kosAdik.kecamatan, 'Coblong')
  })
})
