import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import IndexSeeder from '#database/seeders/main/index_seeder'
import { DEMO_STAFF_PHONE } from '#database/seeders/user_seeder'
import { findBaseMapFiles } from '#helpers/base_map'
import { useApp } from '#tests/support/app'

test.group('Base map', (group) => {
  useApp(group)

  test('maps load tiles only from the app and always show the attribution', async ({
    browserContext,
    assert,
  }) => {
    await new IndexSeeder(db.connection()).run()
    const staff = await User.findByOrFail('phone', DEMO_STAFF_PHONE)
    await browserContext.loginAs(staff)
    const hasTiles = findBaseMapFiles(app.publicPath('tiles')).length > 0

    const page = await browserContext.newPage()
    const outside: string[] = []
    const tiles: number[] = []
    const errors: string[] = []
    page.on('request', (request) => {
      const { hostname } = new URL(request.url())
      if (!['localhost', '127.0.0.1'].includes(hostname)) {
        outside.push(hostname)
      }
    })
    page.on('response', (response) => {
      if (response.url().includes('/tiles/')) {
        tiles.push(response.status())
      }
    })
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text())
      }
    })

    await page.goto('/staf/jemput/tugas')
    await page.getByText('© OpenStreetMap contributors · Protomaps').waitFor()
    await page.waitForLoadState('networkidle')

    assert.deepEqual(outside, [])
    assert.deepEqual(errors, [])
    if (hasTiles) {
      assert.isAbove(tiles.length, 0)
      assert.isTrue(tiles.every((status) => status === 206))
    } else {
      assert.deepEqual(tiles, [])
    }
  })
})
