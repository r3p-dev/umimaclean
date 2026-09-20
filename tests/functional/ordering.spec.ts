import { test } from '@japa/runner'

import OrderRequest from '#models/order_request'
import { PUBLIC_PATHS } from '#seo/public_paths'
import { SERVICES } from '#content/services'
import { COVERED_KECAMATAN, NOT_COVERED_KECAMATAN } from '#content/areas'

/**
 * Ordering goes through the site, not through WhatsApp.
 *
 * That is a business decision with a running cost behind it: a chat thread has
 * to be staffed, read, and transcribed by hand. These tests exist because the
 * cheapest way to undo it is a well-meaning "let them WhatsApp us" button.
 */
test.group('Booking is the front door', (group) => {
  group.each.setup(() => async () => {
    await OrderRequest.query().delete()
  })

  test('the booking form is served and lists only covered kecamatan', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/pesan')
    response.assertStatus(200)

    const html = response.text()
    assert.include(html, 'name="kecamatan"')

    for (const name of COVERED_KECAMATAN) {
      assert.include(html, `value="${name}"`, `${name} is missing from the kecamatan picker`)
    }

    /** Somebody outside the area finds out here, not after being promised a pickup */
    for (const name of NOT_COVERED_KECAMATAN) {
      assert.notInclude(html, `<option value="${name}">`)
    }
  })

  test('a valid request is stored', async ({ client, assert }) => {
    const response = await client.post('/pesan').withCsrfToken().form({
      name: 'Rifqi',
      phone: '081234567890',
      kecamatan: 'Buahbatu',
      addressNote: 'Jl. Margacinta, gang di samping warung biru, pagar hitam',
      serviceSlug: 'cuci-sepatu',
    })

    response.assertStatus(200)

    const stored = await OrderRequest.all()
    assert.lengthOf(stored, 1)
    assert.equal(stored[0].kecamatan, 'Buahbatu')
    assert.equal(stored[0].serviceSlug, 'cuci-sepatu')
  })

  test('a kecamatan outside the coverage list is rejected', async ({ client, assert }) => {
    await client.post('/pesan').withCsrfToken().form({
      name: 'Rifqi',
      phone: '081234567890',
      kecamatan: 'Padalarang',
      addressNote: 'Jl. Raya Padalarang, dekat pasar',
      serviceSlug: 'cuci-sepatu',
    })

    assert.lengthOf(await OrderRequest.all(), 0)
  })

  test('a malformed phone number is rejected', async ({ client, assert }) => {
    await client.post('/pesan').withCsrfToken().form({
      name: 'Rifqi',
      phone: 'bukan nomor',
      kecamatan: 'Buahbatu',
      addressNote: 'Jl. Margacinta, gang di samping warung biru',
      serviceSlug: 'cuci-sepatu',
    })

    assert.lengthOf(await OrderRequest.all(), 0)
  })

  test('service pages carry the service through to the form', async ({ client, assert }) => {
    for (const service of SERVICES) {
      const response = await client.get(service.path)
      assert.include(
        response.text(),
        `/pesan?layanan=${service.slug}`,
        `${service.path} does not preselect its service`
      )
    }
  })
})

test.group('WhatsApp is not the ordering channel', () => {
  test('no public page offers a WhatsApp link as its primary action', async ({
    client,
    assert,
  }) => {
    for (const path of PUBLIC_PATHS) {
      const response = await client.get(path)
      const html = response.text()

      /**
       * The primary action is the solid ink button. Any wa.me link wearing that
       * treatment is an ordering CTA pointing at the expensive channel.
       */
      const primaryButtons = html.match(/<a[^>]*class="[^"]*bg-ink[^"]*"[^>]*>/gi) ?? []

      for (const button of primaryButtons) {
        assert.notInclude(button, 'wa.me', `${path} has a WhatsApp link styled as a primary CTA`)
      }
    }
  })

  test('every public page offers a route to the booking flow', async ({ client, assert }) => {
    for (const path of PUBLIC_PATHS) {
      const response = await client.get(path)
      assert.include(response.text(), 'href="/pesan"', `${path} has no link to the booking flow`)
    }
  })
})
