import { test } from '@japa/runner'
import { useApp } from '#tests/support/app'

test.group('Landing photos', (group) => {
  useApp(group)

  test('every photo loads from the app', async ({ browserContext, assert }) => {
    const page = await browserContext.newPage()
    const outside: string[] = []
    const photos: string[] = []
    page.on('request', (request) => {
      const { hostname } = new URL(request.url())
      if (!['localhost', '127.0.0.1'].includes(hostname)) {
        outside.push(hostname)
      }
    })
    page.on('response', (response) => {
      const { pathname } = new URL(response.url())
      if (pathname.startsWith('/images/landing/')) {
        photos.push(`${response.status()} ${pathname}`)
      }
    })

    await page.goto('/')
    await page.locator('img').last().scrollIntoViewIfNeeded()
    await page.waitForLoadState('networkidle')

    assert.lengthOf(photos, 5)
    for (const photo of photos) {
      assert.match(photo, /^200 \/images\/landing\/[a-z-]+-\d+\.avif$/)
    }
    assert.deepEqual(outside, [])
  })
})
