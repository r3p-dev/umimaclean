import { test } from '@japa/runner'
import env from '#start/env'
import { AxeBuilder } from '@axe-core/playwright'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import { ItemKind } from '#enums/item_kind_enum'
import { OrderAddressKind } from '#enums/order_address_kind_enum'
import { OrderStatus } from '#enums/order_status_enum'
import { Role } from '#enums/role_enum'
import { ZONE } from '#helpers/opening_hours'
import { normalizePhone } from '#helpers/phone'
import Order from '#models/order'
import OrderAddress from '#models/order_address'
import OrderEvent from '#models/order_event'
import OrderItem from '#models/order_item'
import PickupSlot from '#models/pickup_slot'
import User from '#models/user'
import { saveScreenshot } from '../helpers/screenshots.js'

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

async function createOrder(user: User, status: OrderStatus, requestKey: string) {
  const slot = await PickupSlot.query().where('is_active', true).firstOrFail()
  const order = await Order.create({
    userId: user.id,
    status,
    pickupDate: DateTime.now().setZone(ZONE).plus({ days: 1 }),
    pickupSlotId: slot.id,
    pickupStartsAt: slot.startsAt,
    pickupEndsAt: slot.endsAt,
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
  ])
  await OrderItem.create({
    orderId: order.id,
    itemKind: ItemKind.SHOE,
    brand: 'Nike',
    type: 'Air Force 1',
    size: '42',
  })
  await OrderEvent.create({ orderId: order.id, status, actorId: user.id })
  return order
}

test.group('Customer UI pass: /beranda states and /profil', (group) => {
  group.each.setup(async () => {
    await testUtils.db().seed()
    return testUtils.db().wrapInGlobalTransaction()
  })

  test('new account sees welcome /beranda, returning account sees active & recent orders, /profil omits devices', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const newCustomer = await User.create({
      fullName: 'Sari Dewi',
      phone: normalizePhone('081200000901'),
      password: 'password123',
      role: Role.CUSTOMER,
      isActive: true,
    })
    await browserContext.loginAs(newCustomer)

    const page = await visit('/beranda')
    await page.getByRole('heading', { name: 'Selamat datang, Sari' }).waitFor()
    await page.getByText('Mulai dalam 3 langkah').waitFor()
    await page.getByText('Belum ada pesanan').waitFor()

    const recordEvidence = Boolean(env.get('EVIDENCE_MILESTONE'))
    if (recordEvidence) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport)
        const scrollWidth = (await page.evaluate('document.documentElement.scrollWidth')) as number
        assert.isAtMost(scrollWidth, viewport.width)
        assert.deepEqual(await axeViolations(page), [])
        await saveScreenshot(page, `beranda-baru-${viewport.name}.png`)
      }
      await page.setViewportSize({ width: 1280, height: 720 })
    }

    // Returning customer with 2 active orders and 1 completed order.
    const returning = await User.findByOrFail('phone', normalizePhone('082111223344'))
    await createOrder(returning, OrderStatus.AWAITING_PICKUP, 'ui-pass-active-1')
    await createOrder(returning, OrderStatus.IN_CLEANING, 'ui-pass-active-2')
    await createOrder(returning, OrderStatus.COMPLETED, 'ui-pass-done-1')

    await browserContext.clearCookies()
    await browserContext.loginAs(returning)

    await page.goto('/beranda')
    await page.getByRole('heading', { name: 'Pesanan aktif' }).waitFor()
    await page.getByRole('link', { name: 'Lihat semua pesanan (2)' }).waitFor()
    await page.getByRole('heading', { name: 'Terakhir selesai' }).waitFor()

    if (recordEvidence) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport)
        const scrollWidth = (await page.evaluate('document.documentElement.scrollWidth')) as number
        assert.isAtMost(scrollWidth, viewport.width)
        assert.deepEqual(await axeViolations(page), [])
        await saveScreenshot(page, `beranda-aktif-${viewport.name}.png`)
      }
      await page.setViewportSize({ width: 1280, height: 720 })
    }

    // /profil: no "Perangkat yang masuk" card, shows addresses & password tiles + Keluar.
    await page.goto('/profil')
    await page.getByRole('heading', { name: 'Profil' }).waitFor()
    assert.equal(await page.getByText('Perangkat yang masuk').count(), 0)
    await page.getByText('Atur alamat').waitFor()

    if (recordEvidence) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport)
        const scrollWidth = (await page.evaluate('document.documentElement.scrollWidth')) as number
        assert.isAtMost(scrollWidth, viewport.width)
        assert.deepEqual(await axeViolations(page), [])
        await saveScreenshot(page, `profil-${viewport.name}.png`)
      }
      await page.setViewportSize({ width: 1280, height: 720 })
    }
  })
})
