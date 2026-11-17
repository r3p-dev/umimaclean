import { test } from '@japa/runner'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import User from '#models/user'
import { Role } from '#enums/role_enum'
import { saveElementScreenshot, saveScreenshotLog } from '../helpers/screenshots.js'

const VIEWPORTS = [
  { name: '360', width: 360, height: 780 },
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
] as const

type Page = ConstructorParameters<typeof AxeBuilder>[0]['page']

async function axeViolations(page: Page) {
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return axe.violations.map(
    (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(' | ')}`
  )
}

// React Aria date and time segments take typed digits and move to the next segment by themselves.
async function typeSegments(group: ReturnType<Page['locator']>, digits: string) {
  await group.getByRole('spinbutton').first().click()
  await group.page().keyboard.type(digits)
}

// The digits of a date and time in the Indonesian field order: day, month, year, hour, minute.
function segments(moment: DateTime) {
  return moment.toFormat('ddMMyyyyHHmm')
}

test.group('Opening hours (OWN-8, GUEST-1)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('the owner sets 24-hour hours, a closure window and pickup days, and the landing shows them (OWN-8, SLOT-1, GUEST-1, D103)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    await browserContext.loginAs(owner)
    const logLines: string[] = []
    const now = DateTime.now().setZone('Asia/Jakarta')
    const startsAt = now.minus({ hours: 1 })
    const endsAt = now.plus({ days: 3 }).set({ hour: 20, minute: 0 })

    for (const viewport of VIEWPORTS) {
      const settings = await visit('/admin/pengaturan/toko')
      await settings.setViewportSize({ width: viewport.width, height: viewport.height })
      const language = String(await settings.evaluate('navigator.language'))
      const card = settings.locator('[data-slot="card"]', { hasText: 'Simpan Jam Buka' })
      const saturdayCloses = card.getByRole('group', { name: 'Jam tutup hari Sabtu' })
      await typeSegments(saturdayCloses, '1500')
      // The browser runs in English, yet the field keeps a 24-hour clock (D103).
      const saturdayRaw = await saturdayCloses.innerText()
      // React Aria wraps the value in Unicode bidi isolates (U+2066…U+2069).
      const saturdayText = saturdayRaw.replace(/[\s\u2066-\u2069]/g, '')
      assert.equal(saturdayText, '15.00', `Saturday closing time at ${viewport.name}px`)
      const mondayRaw = await card.getByRole('group', { name: 'Jam buka hari Senin' }).innerText()
      assert.equal(mondayRaw.replace(/[\s\u2066-\u2069]/g, ''), '09.00')

      const closure = card.getByRole('switch', { name: 'Tutup sementara' })
      if (!(await closure.isChecked())) {
        // React Aria's label covers the hidden input, as in settings_flow.spec.ts.
        await closure.click({ force: true })
      }
      await typeSegments(card.getByRole('group', { name: 'Tutup mulai' }), segments(startsAt))
      await typeSegments(card.getByRole('group', { name: 'Buka lagi' }), segments(endsAt))
      await card.getByLabel('Catatan untuk pelanggan').fill('Renovasi')
      await card.getByRole('button', { name: 'Simpan Jam Buka' }).click()
      await settings.getByText('Jam buka berhasil disimpan.').waitFor()
      await settings.getByText('Jam buka berhasil disimpan.').waitFor({ state: 'hidden' })

      const settingsScroll = Number(await settings.evaluate('document.documentElement.scrollWidth'))
      assert.isAtMost(settingsScroll, viewport.width, `Horizontal scroll at ${viewport.name}px`)
      assert.deepEqual(await axeViolations(settings), [], `Hours form axe at ${viewport.name}px`)
      assert.notMatch(await card.innerText(), /\b(AM|PM)\b/)
      await saveElementScreenshot(card, `jam-buka-form-${viewport.name}.png`)

      const slotCard = settings.locator('[data-slot="card"]', { hasText: 'Simpan Jadwal Slot' })
      const sunday = slotCard.getByRole('switch', { name: 'Jemput hari Minggu' })
      if (!(await sunday.isChecked())) {
        await sunday.click({ force: true })
      }
      await slotCard.getByRole('button', { name: 'Simpan Jadwal Slot' }).click()
      await settings.getByText('Jadwal slot penjemputan berhasil disimpan.').waitFor()
      await settings
        .getByText('Jadwal slot penjemputan berhasil disimpan.')
        .waitFor({ state: 'hidden' })
      assert.isTrue(await sunday.isChecked())
      await saveElementScreenshot(slotCard, `hari-jemput-${viewport.name}.png`)

      const landing = await visit('/')
      await landing.setViewportSize({ width: viewport.width, height: viewport.height })
      const hero = landing.locator('section').first()
      const until = `${endsAt.setLocale('id').toFormat('cccc')} 20.00`
      assert.include(await hero.innerText(), `Tutup sementara sampai ${until} (Renovasi)`)
      const footer = await landing.locator('footer').innerText()
      assert.include(footer, 'Sabtu 09.00–15.00')
      assert.notMatch(`${await hero.innerText()} ${footer}`, /\b(AM|PM)\b/)
      assert.deepEqual(await axeViolations(landing), [], `Landing axe at ${viewport.name}px`)
      await saveElementScreenshot(hero, `hero-jam-buka-${viewport.name}.png`)

      logLines.push(
        `jam-buka-${viewport.name}: navigator.language=${language} saturday=${saturdayText} scrollWidth=${settingsScroll} axe=none`
      )
    }

    await saveScreenshotLog('jam-buka-screenshots.log', logLines)
  })
})
