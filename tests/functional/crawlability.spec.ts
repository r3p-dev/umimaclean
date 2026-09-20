import { test } from '@japa/runner'

import { PUBLIC_PATHS } from '#seo/public_paths'
import { syncContentPages } from '#seo/sitemap'
import { NOT_COVERED_KECAMATAN, COVERED_KECAMATAN, MAP_NEIGHBOURS, AREAS } from '#content/areas'

/**
 * What a crawler can reach, and what it must not.
 */
test.group('robots.txt', () => {
  test('is served as a route with an absolute sitemap line', async ({ client, assert }) => {
    const response = await client.get('/robots.txt')
    response.assertStatus(200)
    assert.include(response.header('content-type') ?? '', 'text/plain')

    const body = response.text()
    assert.match(body, /^Sitemap: https?:\/\/.+\/sitemap\.xml$/m)

    for (const path of ['/dashboard', '/admin', '/auth', '/api', '/404', '/login', '/signup']) {
      assert.include(body, `Disallow: ${path}`)
    }
  })
})

test.group('sitemap.xml', (group) => {
  group.setup(async () => {
    await syncContentPages()
  })

  test('lists every public path and nothing private', async ({ client, assert }) => {
    const response = await client.get('/sitemap.xml')
    response.assertStatus(200)
    assert.include(response.header('content-type') ?? '', 'application/xml')

    const xml = response.text()

    for (const path of PUBLIC_PATHS) {
      const suffix = path === '/' ? '/</loc>' : `${path}</loc>`
      assert.include(xml, suffix, `sitemap is missing ${path}`)
    }

    /** A leaked private URL is worse than a missing public one */
    for (const path of ['/dashboard', '/admin', '/login', '/signup', '/api']) {
      assert.notInclude(xml, `${path}</loc>`)
    }
  })

  test('lastmod comes from stored rows, not from the clock', async ({ client, assert }) => {
    const first = await client.get('/sitemap.xml')
    const second = await client.get('/sitemap.xml')

    const lastmods = (body: string) => body.match(/<lastmod>([^<]+)<\/lastmod>/g) ?? []

    assert.isNotEmpty(lastmods(first.text()))
    assert.deepEqual(
      lastmods(first.text()),
      lastmods(second.text()),
      'lastmod changed between two requests, so it is being generated rather than stored'
    )
  })

  test('answers a repeat request with 304 via ETag', async ({ client, assert }) => {
    const first = await client.get('/sitemap.xml')
    const etag = first.header('etag')
    assert.exists(etag)

    const second = await client.get('/sitemap.xml').header('if-none-match', etag!)
    second.assertStatus(304)
  })

  test('priority falls with path depth', async ({ client, assert }) => {
    const response = await client.get('/sitemap.xml')
    const xml = response.text()

    const priorityOf = (path: string) => {
      const suffix = path === '/' ? '/' : path
      const block = xml.split('<url>').find((chunk) => chunk.includes(`${suffix}</loc>`))
      return block?.match(/<priority>([^<]+)<\/priority>/)?.[1]
    }

    assert.equal(priorityOf('/'), '1.0')
    assert.equal(priorityOf('/harga'), '0.8')
    assert.equal(priorityOf('/layanan/cuci-sepatu'), '0.6')
  })
})

test.group('Canonical URL shape', () => {
  test('a trailing slash is a permanent redirect, not a second page', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/harga/').redirects(0)
    response.assertStatus(301)
    assert.equal(response.header('location'), '/harga')
  })

  test('the redirect keeps the query string', async ({ client, assert }) => {
    const response = await client.get('/harga/?utm_source=ig').redirects(0)
    response.assertStatus(301)
    assert.equal(response.header('location'), '/harga?utm_source=ig')
  })

  test('the root is left alone', async ({ client }) => {
    const response = await client.get('/')
    response.assertStatus(200)
  })
})

test.group('Private routes', () => {
  test('carry X-Robots-Tag noindex', async ({ client, assert }) => {
    for (const path of ['/login', '/signup']) {
      const response = await client.get(path)
      assert.include(
        response.header('x-robots-tag') ?? '',
        'noindex',
        `${path} is missing its noindex header`
      )
    }
  })

  test('public pages do not', async ({ client, assert }) => {
    const response = await client.get('/harga')
    assert.notExists(response.header('x-robots-tag'))
  })
})

test.group('Not found', () => {
  test('an unknown URL genuinely returns 404', async ({ client }) => {
    const response = await client.get('/halaman-yang-tidak-ada')
    response.assertStatus(404)
  })

  test('an unknown area is a 404, not a soft landing on the hub', async ({ client }) => {
    const response = await client.get('/area/padalarang')
    response.assertStatus(404)
  })
})

/**
 * Coverage is a business decision. These assertions exist so that a future
 * edit cannot quietly promise a place we do not serve, or disown one we do.
 */
test.group('Coverage claims', () => {
  test('Cimahi is never listed as out of area', ({ assert }) => {
    for (const name of NOT_COVERED_KECAMATAN) {
      assert.notMatch(name, /cimahi/i)
    }
  })

  test('covered and not-covered lists never overlap', ({ assert }) => {
    const covered = new Set(COVERED_KECAMATAN.map((name) => name.toLowerCase()))
    for (const name of NOT_COVERED_KECAMATAN) {
      assert.isFalse(covered.has(name.toLowerCase()), `${name} is on both lists`)
    }
  })

  test('no area page claims a kecamatan outside the authoritative list', ({ assert }) => {
    const covered = new Set(COVERED_KECAMATAN)
    for (const area of AREAS) {
      for (const kecamatan of area.kecamatan) {
        assert.isTrue(
          covered.has(kecamatan),
          `/area/${area.slug} claims ${kecamatan}, which is not covered`
        )
      }
    }
  })

  test('areaServed names places rather than listing all 43 kecamatan', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/')
    const graph = JSON.parse(
      response.text().match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)![1]
    )['@graph']

    const business = graph.find((node: { '@type': string }) => node['@type'] === 'LocalBusiness')

    assert.isBelow(business.areaServed.length, 20)
    assert.deepInclude(business.areaServed, { '@type': 'City', 'name': 'Kota Bandung' })
    assert.deepInclude(business.areaServed, { '@type': 'City', 'name': 'Kota Cimahi' })
  })
})

/**
 * The coverage map is a picture of a promise, so its claims are asserted the
 * same way the lists are.
 */
test.group('Coverage map', () => {
  test('is inline SVG, under 20 KB, with no filters and no map library', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/area')
    const html = response.text()

    const svg = html.match(/<svg[\s\S]*?<\/svg>/)?.[0]
    assert.exists(svg, 'no inline SVG on /area')
    assert.isBelow(Buffer.byteLength(svg!), 20 * 1024, 'coverage map exceeds the 20 KB budget')

    /** Filters are expensive to rasterise on mobile; the lift uses <use> instead */
    assert.notInclude(svg!, '<filter')
    assert.notInclude(svg!, 'feDropShadow')
    assert.include(svg!, '<use ')

    /** Never Leaflet, on any public page */
    assert.notInclude(html.toLowerCase(), 'leaflet')
  })

  test('draws every covered kecamatan, Cimahi included', async ({ client, assert }) => {
    const response = await client.get('/area')
    const svg = response.text().match(/<svg[\s\S]*?<\/svg>/)![0]

    for (const name of COVERED_KECAMATAN) {
      assert.include(svg, `Kecamatan ${name}<`, `${name} is missing from the coverage map`)
    }
  })

  test('marks the asked-about neighbours as out of area', async ({ client, assert }) => {
    const response = await client.get('/area')
    const svg = response.text().match(/<svg[\s\S]*?<\/svg>/)![0]

    /**
     * Only the neighbours drawn individually carry a tooltip. The rest are in
     * the text list, which is the half that ranks anyway.
     */
    for (const name of MAP_NEIGHBOURS) {
      assert.include(svg, `${name} — di luar jangkauan`, `${name} has no out-of-area tooltip`)
    }
  })

  test('every uncovered neighbour is named in the page text, drawn or not', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/area')
    const html = response.text()
    const svg = html.match(/<svg[\s\S]*?<\/svg>/)![0]
    const text = html.replace(svg, '').replace(/<[^>]+>/g, ' ')

    for (const name of NOT_COVERED_KECAMATAN) {
      assert.include(text, name, `${name} is missing from the "belum terjangkau" text list`)
    }
  })

  test('a kecamatan dropped from coverage is stated as out of area', async ({ client, assert }) => {
    /**
     * Cilengkrang used to be served. Removing it from the covered list is not
     * enough — the page has to say so, or it silently stops answering a
     * question it used to answer.
     */
    assert.notInclude(COVERED_KECAMATAN, 'Cilengkrang')
    assert.include(NOT_COVERED_KECAMATAN, 'Cilengkrang')

    const response = await client.get('/area')
    const svg = response.text().match(/<svg[\s\S]*?<\/svg>/)![0]
    assert.include(svg, 'Cilengkrang — di luar jangkauan')
    assert.notInclude(svg, 'Kecamatan Cilengkrang<')
  })

  test('carries a text alternative, so hover is never the only route', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/area')
    const svg = response.text().match(/<svg[\s\S]*?<\/svg>/)![0]

    assert.include(svg, 'role="img"')
    assert.match(svg, /aria-label="[^"]{40,}"/)
  })
})
