import { test } from '@japa/runner'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { saveScreenshot, saveScreenshotLog } from '../helpers/screenshots.js'

type Page = ConstructorParameters<typeof AxeBuilder>[0]['page']

// Each width edits its own day, so the runs do not depend on each other.
const VIEWPORTS = [
  { name: '360', width: 360, height: 780, day: 'Selasa' },
  { name: '390', width: 390, height: 844, day: 'Rabu' },
  { name: '1440', width: 1440, height: 900, day: 'Kamis' },
] as const

async function axeViolations(page: Page) {
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return axe.violations.map(
    (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(' | ')}`
  )
}

// React Aria time segments take typed digits and move on by themselves.
async function typeTime(page: Page, label: string, digits: string) {
  await page.getByRole('group', { name: label }).getByRole('spinbutton').first().click()
  await page.keyboard.type(digits)
}

// "Tambah slot <hari>" opens a bottom sheet on phones and a dialog on desktop.
async function addSlot(page: Page, day: string, starts: string, ends: string, screenshot?: string) {
  await page.getByRole('button', { name: `Tambah slot ${day}` }).click()
  const sheet = page.getByRole('dialog')
  await sheet.waitFor()
  await typeTime(page, `Mulai slot baru hari ${day}`, starts)
  await typeTime(page, `Selesai slot baru hari ${day}`, ends)
  if (screenshot) {
    await saveScreenshot(page, `pengaturan-slot-tambah-${screenshot}.png`)
  }
  await sheet.getByRole('button', { name: 'Tambah ke daftar' }).click()
  await sheet.waitFor({ state: 'hidden' })
}

async function waitForToast(page: Page, text: string) {
  await page.getByText(text).waitFor()
  await page.getByText(text).waitFor({ state: 'hidden' })
}

test.group('Pickup slots per weekday (OWN-8, SLOT-2, D106)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('the owner edits a day of slots, sees an overlap refused, copies a day, and uses the settings navigation', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    await browserContext.loginAs(owner)
    const logLines: string[] = []

    for (const viewport of VIEWPORTS) {
      const page = await visit('/admin/pengaturan/slot')
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForLoadState('networkidle')
      const day = viewport.day

      // Settings navigation: a column on wide screens, a collapsible list on phones.
      const settingsNav = page.getByRole('navigation', { name: 'Bagian pengaturan' })
      if (viewport.width >= 1024) {
        const current = settingsNav.getByRole('link', { name: 'Slot penjemputan' })
        assert.equal(await current.getAttribute('aria-current'), 'page')
      } else {
        await page.getByRole('button', { name: 'Bagian: Slot penjemputan' }).click()
        await page.getByRole('link', { name: 'Area layanan' }).waitFor()
        await saveScreenshot(page, `pengaturan-nav-${viewport.name}.png`)
        await page.getByRole('button', { name: 'Bagian: Slot penjemputan' }).click()
      }

      // Sunday is closed in the opening hours, so it cannot be chosen (D104).
      assert.isTrue(await page.getByRole('radio', { name: 'Minggu, tutup' }).isDisabled())

      // Replace the afternoon slot with an evening one.
      await page.getByRole('radio', { name: `${day}, 3 slot` }).click({ force: true })
      // Delete sits in the slot's ⋯ menu; adding opens a sheet (D107).
      await page.getByRole('button', { name: 'Menu slot 15.00–18.00' }).click()
      await page.getByRole('menuitem', { name: 'Hapus slot' }).click()
      await addSlot(page, day, '1800', '2000', viewport.name)
      await page.getByRole('button', { name: `Simpan slot ${day}` }).click()
      await waitForToast(page, 'Slot penjemputan berhasil disimpan.')
      const list = await page.locator('[data-slot="card"]').innerText()
      assert.include(list, '18.00–20.00')
      assert.notInclude(list, '15.00–18.00')

      const scrollWidth = Number(await page.evaluate('document.documentElement.scrollWidth'))
      assert.isAtMost(scrollWidth, viewport.width, `Horizontal scroll at ${viewport.name}px`)
      assert.deepEqual(await axeViolations(page), [], `Slots axe at ${viewport.name}px`)
      await saveScreenshot(page, `pengaturan-slot-${viewport.name}.png`)

      // An overlapping slot is refused with the slot names in the message.
      await addSlot(page, day, '1100', '1300')
      await page.getByRole('button', { name: `Simpan slot ${day}` }).click()
      await page.getByText('Slot 11.00–13.00 bertabrakan dengan 09.00–12.00.').waitFor()
      await saveScreenshot(page, `pengaturan-slot-tabrakan-${viewport.name}.png`)

      logLines.push(
        `pengaturan-slot-${viewport.name}: day=${day} scrollWidth=${scrollWidth} axe=none`
      )
    }

    // Copy Thursday (saved at 1440) to every other open day.
    const page = await visit('/admin/pengaturan/slot')
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.getByRole('radio', { name: 'Kamis, 3 slot' }).click({ force: true })
    await page.getByRole('button', { name: 'Salin slot Kamis ke hari buka lain' }).click()
    await waitForToast(page, 'Slot disalin ke 5 hari buka lain.')
    await page.getByRole('radio', { name: 'Senin, 3 slot' }).click({ force: true })
    assert.include(await page.locator('[data-slot="card"]').innerText(), '18.00–20.00')
    await saveScreenshot(page, `pengaturan-slot-salin-1440.png`)

    await saveScreenshotLog('pengaturan-slot-screenshots.log', logLines)
  })
})
