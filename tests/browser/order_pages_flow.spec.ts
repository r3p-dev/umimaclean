import { test } from '@japa/runner'
import env from '#start/env'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import { ItemKind } from '#enums/item_kind_enum'
import { OrderAddressKind } from '#enums/order_address_kind_enum'
import { OrderStatus } from '#enums/order_status_enum'
import { ZONE } from '#helpers/opening_hours'
import { normalizePhone } from '#helpers/phone'
import Order from '#models/order'
import OrderAddress from '#models/order_address'
import OrderEvent from '#models/order_event'
import OrderItem from '#models/order_item'
import PickupSlot from '#models/pickup_slot'
import User from '#models/user'
import {
  saveScreenshot,
  saveScreenshotLog,
  saveViewportScreenshot,
} from '../helpers/screenshots.js'

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

async function createOrderForBrowser(user: User, status: OrderStatus, requestKey: string) {
  const slot = await PickupSlot.query().where('is_active', true).firstOrFail()
  const order = await Order.create({
    userId: user.id,
    status,
    pickupDate: DateTime.now().setZone(ZONE).plus({ days: 1 }),
    pickupSlotId: slot.id,
    pickupStartsAt: slot.startsAt,
    pickupEndsAt: slot.endsAt,
    note: 'Titip di pos satpam',
    requestKey,
  })
  await OrderAddress.createMany([
    {
      orderId: order.id,
      kind: OrderAddressKind.PICKUP,
      label: 'Rumah',
      recipientName: user.fullName,
      recipientPhone: user.phone,
      addressText: 'Jalan Dipatiukur No. 35, Coblong',
      details: null,
      lat: -6.881768,
      lng: 107.61421,
      street: 'Jalan Dipatiukur',
      kelurahan: 'Lebakgede',
      kecamatan: 'Coblong',
      city: 'Kota Bandung',
    },
    {
      orderId: order.id,
      kind: OrderAddressKind.DELIVERY,
      label: 'Kantor',
      recipientName: user.fullName,
      recipientPhone: user.phone,
      addressText: 'Jalan Dago No. 10, Coblong',
      details: null,
      lat: -6.881768,
      lng: 107.61421,
      street: 'Jalan Dago',
      kelurahan: 'Dago',
      kecamatan: 'Coblong',
      city: 'Kota Bandung',
    },
  ])
  await OrderItem.create({
    orderId: order.id,
    itemKind: ItemKind.SHOE,
    brand: 'Nike',
    type: 'Air Force 1',
    size: '42',
  })
  await OrderEvent.create({
    orderId: order.id,
    status,
    actorId: user.id,
  })
  return order
}

test.group('Customer order list, detail and cancel (CUST-7, CUST-8, CUST-9)', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('customer browses /pesanan, filters, opens detail, and cancels an awaiting_pickup order', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const customer = await seededCustomer()
    const awaiting = await createOrderForBrowser(
      customer,
      OrderStatus.AWAITING_PICKUP,
      'browser-list-awaiting'
    )
    const inCleaning = await createOrderForBrowser(
      customer,
      OrderStatus.IN_CLEANING,
      'browser-list-cleaning'
    )
    await browserContext.loginAs(customer)

    const page = await visit('/pesanan')
    await page.getByRole('heading', { name: 'Riwayat Pesanan' }).waitFor()
    await page
      .getByRole('link', { name: awaiting.number() })
      .and(page.locator(':visible'))
      .waitFor()
    await page
      .getByRole('link', { name: inCleaning.number() })
      .and(page.locator(':visible'))
      .waitFor()

    const logLines: string[] = []
    const recordEvidence = Boolean(env.get('EVIDENCE_MILESTONE'))
    if (recordEvidence) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport)
        const scrollWidth = (await page.evaluate('document.documentElement.scrollWidth')) as number
        assert.isAtMost(scrollWidth, viewport.width)
        assert.deepEqual(await axeViolations(page), [])
        await saveScreenshot(page, `pesanan-daftar-${viewport.name}.png`)
        logLines.push(`pesanan-daftar-${viewport.name}: scrollWidth=${scrollWidth} axe=none`)
      }
      await page.setViewportSize({ width: 1280, height: 720 })
    }

    // Filter to Aktif and search by order number.
    await page.getByRole('link', { name: /^Aktif/ }).click()
    await page.waitForURL('**/pesanan?status=aktif')
    await page.getByLabel('Cari nomor pesanan').fill(inCleaning.number())
    await page.waitForURL(`**/pesanan?status=aktif&q=${inCleaning.number()}`)
    await page
      .getByRole('link', { name: inCleaning.number() })
      .and(page.locator(':visible'))
      .waitFor()

    // Open in_cleaning order: no cancel button, shows WhatsApp link.
    await page
      .getByRole('link', { name: new RegExp(inCleaning.number()) })
      .and(page.locator(':visible'))
      .click()
    await page.waitForURL(`**/pesanan/${inCleaning.id}`)
    await page.getByRole('heading', { name: inCleaning.number() }).waitFor()
    assert.equal(await page.getByRole('button', { name: 'Batalkan Pesanan' }).count(), 0)
    const waHref = await page
      .getByRole('link', { name: 'Hubungi kami di WhatsApp' })
      .getAttribute('href')
    assert.include(waHref ?? '', 'https://wa.me/')
    assert.include(waHref ?? '', inCleaning.number())

    // Open awaiting_pickup order: shows detail, stage progress, timeline, and cancel button.
    await page.goto(`/pesanan/${awaiting.id}`)
    await page.getByRole('heading', { name: awaiting.number() }).waitFor()
    await page.getByText('Dijemput dari Rumah').waitFor()
    await page.getByText('Diantar ke Kantor').waitFor()
    await page.getByText('Nike · Air Force 1').waitFor()

    if (recordEvidence) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport)
        const scrollWidth = (await page.evaluate('document.documentElement.scrollWidth')) as number
        assert.isAtMost(scrollWidth, viewport.width)
        assert.deepEqual(await axeViolations(page), [])
        await saveScreenshot(page, `pesanan-detail-${viewport.name}.png`)
        logLines.push(`pesanan-detail-${viewport.name}: scrollWidth=${scrollWidth} axe=none`)
      }
      await page.setViewportSize({ width: 1280, height: 720 })
    }

    // Open cancel dialog and capture screenshots, then submit.
    await page.getByRole('button', { name: 'Batalkan Pesanan' }).click()
    await page.getByRole('heading', { name: `Batalkan pesanan ${awaiting.number()}?` }).waitFor()

    if (recordEvidence) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport)
        const scrollWidth = (await page.evaluate('document.documentElement.scrollWidth')) as number
        assert.isAtMost(scrollWidth, viewport.width)
        assert.deepEqual(await axeViolations(page), [])
        await saveViewportScreenshot(page, `pesanan-batal-dialog-${viewport.name}.png`)
        logLines.push(`pesanan-batal-dialog-${viewport.name}: scrollWidth=${scrollWidth} axe=none`)
      }
      await page.setViewportSize({ width: 1280, height: 720 })
      await saveScreenshotLog('pesanan-axe.log', logLines)
    }

    await page.getByRole('button', { name: 'Salah jadwal penjemputan' }).click()
    await page.getByRole('button', { name: 'Batalkan Pesanan' }).last().click()

    await page.getByText(`Pesanan ${awaiting.number()} dibatalkan.`).waitFor()
    await awaiting.refresh()
    assert.equal(awaiting.status, OrderStatus.CANCELLED)
  })
})
