import { test } from '@japa/runner'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import CustomerAddress from '#models/customer_address'
import User from '#models/user'
import { normalizePhone } from '#helpers/phone'
import { saveScreenshot, saveScreenshotLog } from '../helpers/screenshots.js'

const VIEWPORTS = [
  { name: '360', width: 360, height: 780 },
  { name: '1440', width: 1440, height: 900 },
] as const

// Inside Coblong (active) and Cileunyi (inactive in the seed).
const COBLONG = { latitude: -6.881768, longitude: 107.61421 }
const CILEUNYI = { latitude: -6.925479, longitude: 107.742516 }

async function axeViolations(page: ConstructorParameters<typeof AxeBuilder>[0]['page']) {
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return axe.violations.map(
    (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(' | ')}`
  )
}

function seededCustomer() {
  return User.findByOrFail('phone', normalizePhone('082111223344'))
}

test.group('Addresses (CUST-2, CUST-3, CUST-14, AREA-4, D82)', (group) => {
  group.each.setup(async () => {
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

  test('a customer deletes an address, then adds one with "Gunakan lokasi saya" and the arrows (CUST-14, AREA-4)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const customer = await seededCustomer()
    await browserContext.loginAs(customer)
    await browserContext.grantPermissions(['geolocation'])
    const logLines: string[] = []

    const list = await visit('/profil/alamat')
    await list.getByRole('link', { name: 'Ubah Kos Adik' }).click()
    await list.getByRole('button', { name: 'Hapus alamat' }).click()
    await list.getByRole('dialog').getByRole('button', { name: 'Hapus alamat' }).click()
    await list.getByText('Alamat Kos Adik dihapus.').waitFor()
    await list.getByRole('link', { name: 'Tambah alamat' }).click()

    const status = list.getByRole('status').filter({ hasText: /area/ })
    await list.locator('.maplibregl-canvas').waitFor()
    await status.getByText(/^Masuk area layanan: Kec\./).waitFor()

    // The device is outside the area: the pin follows it and the server says so.
    await browserContext.setGeolocation(CILEUNYI)
    await list.getByRole('button', { name: 'Gunakan lokasi saya' }).click()
    await status.getByText(/^Di luar area layanan/).waitFor()

    await browserContext.setGeolocation(COBLONG)
    await list.getByRole('button', { name: 'Gunakan lokasi saya' }).click()
    await status.getByText('Masuk area layanan: Kec. Coblong, Kota Bandung.').waitFor()

    // One arrow press moves the pin north: a larger latitude, checked again.
    const latBefore = Number(await list.locator('input[name="lat"]').inputValue())
    await list.getByRole('button', { name: 'Geser titik ke utara' }).click()
    await list.waitForFunction(
      `Number(document.querySelector('input[name="lat"]').value) > ${latBefore}`
    )
    await status.getByText(/^Masuk area layanan: Kec\./).waitFor()

    for (const viewport of VIEWPORTS) {
      await list.setViewportSize({ width: viewport.width, height: viewport.height })
      const scrollWidth = Number(await list.evaluate('document.documentElement.scrollWidth'))
      assert.isAtMost(scrollWidth, viewport.width, `Horizontal scroll at ${viewport.name}px`)
      assert.deepEqual(await axeViolations(list), [], `Address form axe at ${viewport.name}px`)
      await saveScreenshot(list, `alamat-tambah-${viewport.name}.png`)
      logLines.push(`alamat-tambah-${viewport.name}: scrollWidth=${scrollWidth} axe=none`)
    }

    await list.getByRole('radio', { name: 'Lainnya' }).click()
    await list.getByLabel('Nama label').fill('Rumah Ibu')
    await list.getByLabel('Alamat lengkap').fill('Jl. Tubagus Ismail No. 12, Sekeloa, Coblong')
    await list.getByRole('button', { name: 'Simpan alamat' }).click()
    await list.getByText('Alamat disimpan.').waitFor()

    const saved = await CustomerAddress.query()
      .where('user_id', customer.id)
      .where('label', 'Rumah Ibu')
      .firstOrFail()
    assert.isFalse(saved.isPrimary)
    assert.equal(saved.recipientPhone, customer.phone)
    assert.isAbove(saved.lat, COBLONG.latitude)
    await saveScreenshotLog('alamat-tambah-screenshots.log', logLines)
  })

  test('without location permission the button goes away and the pin still works (AREA-4)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    await browserContext.loginAs(await seededCustomer())
    await browserContext.clearPermissions()

    const page = await visit('/profil/alamat')
    await page.getByRole('link', { name: 'Ubah Kantor' }).click()
    await page.locator('.maplibregl-canvas').waitFor()
    const locate = page.getByRole('button', { name: 'Gunakan lokasi saya' })
    if (await locate.isVisible()) {
      await locate.click()
      await locate.waitFor({ state: 'detached' })
    }

    await page.getByRole('button', { name: 'Geser titik ke barat' }).click()
    await page
      .getByRole('status')
      .getByText(/^Masuk area layanan: Kec\./)
      .waitFor()
    await page.getByRole('button', { name: 'Simpan alamat' }).click()
    await page.getByText('Alamat diperbarui.').waitFor()
    assert.isTrue(await page.getByRole('heading', { name: 'Alamat', level: 1 }).isVisible())
  })
})
