import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { OrderSource, OrderStatus } from '#enums/order_enum'
import Order from '#models/order'
import User from '#models/user'
import IndexSeeder from '#database/seeders/main/index_seeder'
import { useApp } from '#tests/support/app'

async function code(status: OrderStatus, source?: OrderSource) {
  const query = Order.query().where('status', status)
  if (source) {
    query.where('source', source)
  }
  const order = await query.firstOrFail()
  return order.id
}

test.group('Every page renders with seeded data', (group) => {
  useApp(group)

  test('customer, staff and owner pages open without a client error', async ({
    browserContext,
    assert,
  }) => {
    await new IndexSeeder(db.connection()).run()

    const rina = await User.findByOrFail('phone', '6281223456789')
    const staff = await User.findByOrFail('phone', '6281234567801')
    const owner = await User.findByOrFail('phone', '6281122001100')
    const awaiting = await code(OrderStatus.AWAITING_PAYMENT, OrderSource.ONLINE)
    const completed = await Order.query()
      .where('user_id', rina.id)
      .where('status', OrderStatus.COMPLETED)
      .first()

    const roles: [User | null, string[]][] = [
      [null, ['/', '/syarat', '/privasi', '/masuk', '/staf/masuk', `/pesanan/${awaiting}`]],
      [
        rina,
        [
          '/beranda',
          '/pesan',
          '/pesanan',
          `/pesanan/${awaiting}`,
          `/pesanan/${awaiting}/tagihan`,
          `/pesanan/${awaiting}/bayar`,
          ...(completed ? [`/pesanan/${completed.id}/struk`] : []),
          '/profil',
          '/profil/alamat',
        ],
      ],
      [
        staff,
        [
          '/staf',
          '/staf/jemput',
          '/staf/jemput/tugas',
          '/staf/antar',
          '/staf/antar/tugas',
          '/staf/proses',
          `/staf/proses/${await code(OrderStatus.PICKED_UP)}/periksa`,
          `/staf/proses/${await code(OrderStatus.IN_CLEANING)}/cuci`,
          '/staf/transaksi',
          `/staf/transaksi/${await code(OrderStatus.AWAITING_PAYMENT, OrderSource.STORE)}/bayar`,
          '/staf/riwayat',
          '/staf/profil',
          '/staf/lainnya',
        ],
      ],
      [
        owner,
        [
          '/admin',
          '/admin/pesanan',
          `/admin/pesanan/${awaiting}`,
          '/admin/layanan',
          '/admin/pelanggan',
          '/admin/laporan',
          '/admin/aktivitas',
          '/admin/pengaturan',
          '/admin/pengaturan/toko',
          '/admin/pengaturan/area',
          '/admin/rekonsiliasi',
          '/admin/profil',
        ],
      ],
    ]

    const failures: string[] = []
    for (const [user, urls] of roles) {
      await browserContext.clearCookies()
      if (user) {
        await browserContext.loginAs(user)
      }
      for (const url of urls) {
        const page = await browserContext.newPage()
        const errors: string[] = []
        page.on('pageerror', (error) => errors.push(error.message))
        const response = await page.goto(url)
        await page.waitForLoadState('domcontentloaded')
        await page
          .locator('h1')
          .first()
          .waitFor({ timeout: 10_000 })
          .catch(() => {
            errors.push('no h1 rendered')
          })
        if ((response?.status() ?? 500) >= 400) {
          errors.push(`HTTP ${response?.status()}`)
        }
        if (errors.length) {
          failures.push(`${url}: ${errors.join(' | ')}`)
        }
        await page.close()
      }
    }
    assert.deepEqual(failures, [])
  }).timeout(240_000)
})
