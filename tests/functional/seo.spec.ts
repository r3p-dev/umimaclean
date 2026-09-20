import { test } from '@japa/runner'

import { PUBLIC_PATHS } from '#seo/public_paths'

/**
 * SEO assertions against the raw HTML.
 *
 * These deliberately never parse a DOM or run JavaScript. A crawler receives
 * one HTTP response and reads the bytes in it, so that is exactly what is
 * asserted here. `npm run verify:seo` performs the same checks against a
 * running deployment; this suite catches the regression before it ships.
 */

const BANNED_WORDS = ['kiloan', 'satuan', 'dry clean', 'setrika', 'laundry', 'londri']

test.group('Public pages are crawlable', () => {
  for (const path of PUBLIC_PATHS) {
    test(`${path} serves complete SEO markup in the first response`, async ({ client, assert }) => {
      const response = await client.get(path)
      response.assertStatus(200)

      const html = response.text()

      /** Exactly one <h1>: a page can only be about one thing */
      const h1s = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) ?? []
      assert.lengthOf(h1s, 1, `expected exactly one <h1> on ${path}`)

      /** A non-empty title and description */
      const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
      assert.isNotNull(title, `no <title> on ${path}`)
      assert.isAbove(title![1].trim().length, 0, `empty <title> on ${path}`)

      const description = html.match(/<meta\b[^>]*\bname="description"[^>]*\bcontent="([^"]*)"/i)
      assert.isNotNull(description, `no meta description on ${path}`)
      assert.isAbove(description![1].trim().length, 0, `empty meta description on ${path}`)

      /** An absolute canonical for this exact page */
      const canonical = html.match(/<link\b[^>]*\brel="canonical"[^>]*\bhref="([^"]+)"/i)
      assert.isNotNull(canonical, `no canonical on ${path}`)
      assert.match(canonical![1], /^https?:\/\//, `canonical is not absolute on ${path}`)
      assert.isTrue(
        canonical![1].endsWith(path === '/' ? '/' : path),
        `canonical ${canonical![1]} does not match ${path}`
      )

      /** The page is indexable */
      assert.notMatch(html, /<meta\b[^>]*\bname="robots"[^>]*\bcontent="noindex/i)

      /** Structured data that parses, anchored to the business */
      const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)
      assert.isNotNull(block, `no JSON-LD on ${path}`)

      const graph = JSON.parse(block![1])
      assert.equal(graph['@context'], 'https://schema.org')
      assert.isArray(graph['@graph'])

      const types = graph['@graph'].map((node: { '@type': string | string[] }) => node['@type'])
      assert.include(types.flat(), 'LocalBusiness', `no LocalBusiness node on ${path}`)
      assert.include(types.flat(), 'WebPage', `no WebPage node on ${path}`)

      /** UmimaClean is not a laundry */
      const visible = html.replace(/<[^>]+>/g, ' ').toLowerCase()
      for (const word of BANNED_WORDS) {
        assert.notInclude(visible, word, `banned vocabulary "${word}" on ${path}`)
      }
    })
  }

  test('every public page has a distinct title', async ({ client, assert }) => {
    const seen = new Map<string, string>()

    for (const path of PUBLIC_PATHS) {
      const response = await client.get(path)
      const html = response.text()
      const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)![1].trim()

      assert.isUndefined(
        seen.get(title),
        `${path} reuses the title of ${seen.get(title)} — "${title}"`
      )
      seen.set(title, path)
    }
  })

  test('free pickup is modelled as a zero-price offer', async ({ client, assert }) => {
    const response = await client.get('/')
    const html = response.text()
    const graph = JSON.parse(
      html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)![1]
    )['@graph']

    const pickup = graph.find(
      (node: { '@id': string }) =>
        typeof node['@id'] === 'string' && node['@id'].endsWith('#antar-jemput-gratis')
    )

    assert.exists(pickup, 'no free-pickup Service node')
    assert.equal(pickup.offers.price, 0)
    assert.equal(pickup.offers.priceCurrency, 'IDR')
    assert.isNotEmpty(pickup.areaServed)
  })

  test('reviews are shown to readers but never marked up', async ({ client, assert }) => {
    const response = await client.get('/')
    const html = response.text()

    /** The real reviewers are on the page for humans */
    assert.include(html, 'Adryan Aulia P')

    /**
     * ...and nowhere in the structured data. Google does not show review rich
     * results for a business that controls the reviews on its own site, so
     * emitting them is zero upside and a manual-action risk.
     */
    const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)![1]
    assert.notInclude(block, 'aggregateRating')
    assert.notInclude(block, '"review"')
    assert.notInclude(block, '"Review"')
  })

  test('an unknown service slug is a 404, not a soft redirect', async ({ client }) => {
    const response = await client.get('/layanan/tidak-ada')
    response.assertStatus(404)
  })
})

/**
 * The NAP is the single most fragile thing on the site: it only works when it
 * matches the Google Business Profile character for character. These assertions
 * exist so a well-meaning tidy-up of the punctuation fails the build.
 */
test.group('Business identity matches the Google Business Profile', () => {
  test('the address is emitted exactly as the profile records it', async ({ client, assert }) => {
    const response = await client.get('/')
    const html = response.text()
    const graph = JSON.parse(
      html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)![1]
    )['@graph']

    const business = graph.find((node: { '@type': string }) => node['@type'] === 'LocalBusiness')

    assert.equal(business.name, 'Umima.clean')
    assert.deepEqual(business.address, {
      '@type': 'PostalAddress',
      'streetAddress': 'Jl. Margacinta No.132, Margasari, Kec. Buahbatu',
      'addressLocality': 'Kota Bandung',
      'addressRegion': 'Jawa Barat',
      'postalCode': '40286',
      'addressCountry': 'ID',
    })
    assert.equal(business.telephone, '+6285157900974')

    /** Seven days, 09:30-20:30 */
    const hours = business.openingHoursSpecification[0]
    assert.lengthOf(hours.dayOfWeek, 7)
    assert.equal(hours.opens, '09:30')
    assert.equal(hours.closes, '20:30')
  })

  test('WhatsApp is a ContactPoint, not an identity profile', async ({ client, assert }) => {
    const response = await client.get('/')
    const html = response.text()
    const graph = JSON.parse(
      html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)![1]
    )['@graph']

    const business = graph.find((node: { '@type': string }) => node['@type'] === 'LocalBusiness')

    assert.equal(business.contactPoint.contactType, 'customer service')
    assert.equal(business.contactPoint.url, 'https://wa.me/6285157900974')

    /** sameAs is for profiles that identify the business, so a chat link has no place in it */
    assert.notInclude(business.sameAs, 'https://wa.me/6285157900974')
    assert.include(business.sameAs, 'https://maps.app.goo.gl/Dds7B7gRs9t9pGiP7')
  })

  test('areaServed names places, never polygon coordinates', async ({ client, assert }) => {
    const response = await client.get('/')
    const html = response.text()
    const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)![1]

    assert.notInclude(block, 'GeoShape')
    assert.notInclude(block, 'polygon')
  })
})
