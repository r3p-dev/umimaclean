import { test } from '@japa/runner'
import env from '#start/env'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import { ItemKind } from '#enums/item_kind_enum'
import { OrderStatus } from '#enums/order_status_enum'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import PickupSlot from '#models/pickup_slot'
import User from '#models/user'
import { normalizePhone } from '#helpers/phone'
import { saveScreenshotLog, saveViewportScreenshot } from '../helpers/screenshots.js'

const VIEWPORTS = [
  { name: '360', width: 360, height: 780 },
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

function seededCustomer() {
  return User.findByOrFail('phone', normalizePhone('082111223344'))
}

test.group('Online ordering flow (CUST-5, CUST-6)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('customer fills /pesan, keeps values after Ubah, confirms, and lands on /beranda (CUST-5, CUST-6)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const customer = await seededCustomer()
    await browserContext.loginAs(customer)

    const page = await visit('/beranda')
    await page.getByRole('link', { name: 'Pesan penjemputan' }).click()
    await page.getByRole('heading', { name: 'Pesan Penjemputan' }).waitFor()

    await page.getByLabel('Jenis barang').fill('Air Force 1')
    await page.getByLabel(/Merk/).fill('Nike')
    await page.getByLabel('Ukuran (EU)').selectOption('42')

    await page.getByRole('button', { name: 'Tambah tas' }).click()
    await page.getByLabel('Jenis barang').nth(1).fill('Ransel kanvas')
    await page.getByLabel('Ukuran tas').selectOption('M')

    await page.getByLabel(/Catatan untuk kurir/).fill('Titip di pos satpam')

    const logLines: string[] = []
    const recordEvidence = Boolean(env.get('EVIDENCE_MILESTONE'))
    if (recordEvidence) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport)
        const scrollWidth = (await page.evaluate('document.documentElement.scrollWidth')) as number
        assert.isAtMost(scrollWidth, viewport.width)
        assert.deepEqual(await axeViolations(page), [])
        await saveViewportScreenshot(page, `pesan-${viewport.name}.png`)
        logLines.push(`pesan-${viewport.name}: scrollWidth=${scrollWidth} axe=none`)
      }
      await page.setViewportSize({ width: 1280, height: 720 })
    }

    await page.getByRole('button', { name: 'Lanjut ke Konfirmasi' }).click()
    await page.getByRole('heading', { name: 'Konfirmasi Pesanan' }).waitFor()
    await page.getByText('Sepatu · Nike Air Force 1').waitFor()
    await page.getByText('Tas · Ransel kanvas').waitFor()
    await page.getByText('Catatan: Titip di pos satpam').waitFor()

    if (recordEvidence) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport)
        const scrollWidth = (await page.evaluate('document.documentElement.scrollWidth')) as number
        assert.isAtMost(scrollWidth, viewport.width)
        assert.deepEqual(await axeViolations(page), [])
        await saveViewportScreenshot(page, `pesan-konfirmasi-${viewport.name}.png`)
        logLines.push(`pesan-konfirmasi-${viewport.name}: scrollWidth=${scrollWidth} axe=none`)
      }
      await page.setViewportSize({ width: 1280, height: 720 })
      await saveScreenshotLog('orders.log', logLines)
    }

    // Going back keeps every entered value (CUST-5).
    await page.getByRole('link', { name: 'Ubah pesanan' }).click()
    await page.getByRole('heading', { name: 'Pesan Penjemputan' }).waitFor()
    assert.equal(await page.getByLabel('Jenis barang').first().inputValue(), 'Air Force 1')
    assert.equal(await page.getByLabel(/Catatan untuk kurir/).inputValue(), 'Titip di pos satpam')

    await page.getByRole('button', { name: 'Lanjut ke Konfirmasi' }).click()
    await page.getByRole('heading', { name: 'Konfirmasi Pesanan' }).waitFor()
    await page.getByRole('button', { name: 'Buat Pesanan' }).click()

    await page.getByRole('heading', { name: /Selamat datang/ }).waitFor()
    const placed = await Order.query()
      .where('user_id', customer.id)
      .where('note', 'Titip di pos satpam')
      .firstOrFail()
    assert.equal(placed.status, OrderStatus.AWAITING_PICKUP)
    await page.getByText(`Pesanan ${placed.number()} diterima`).waitFor()
  })

  test('Pesan lagi prefills items from a past order (CUST-5)', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const customer = await seededCustomer()
    const slot = await PickupSlot.query().where('is_active', true).firstOrFail()
    const existing = await Order.create({
      userId: customer.id,
      status: OrderStatus.COMPLETED,
      pickupDate: DateTime.now().plus({ days: 1 }),
      pickupSlotId: slot.id,
      pickupStartsAt: slot.startsAt,
      pickupEndsAt: slot.endsAt,
      requestKey: 'browser-repeat-source',
    })
    await OrderItem.create({
      orderId: existing.id,
      itemKind: ItemKind.SHOE,
      brand: 'Adidas',
      type: 'Samba',
      size: '43',
    })
    await browserContext.loginAs(customer)

    const page = await visit(`/pesan?ulang=${existing.id}`)
    await page.getByRole('heading', { name: 'Pesan Penjemputan' }).waitFor()
    assert.equal(await page.getByLabel('Jenis barang').first().inputValue(), 'Samba')
  })
})
