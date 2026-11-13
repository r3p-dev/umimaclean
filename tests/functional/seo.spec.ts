import { test } from '@japa/runner'

test.group('Search engines (GUEST-3)', () => {
  test('robots.txt keeps signed-in and development pages out and points to the sitemap', async ({
    client,
  }) => {
    const response = await client.get('/robots.txt')

    response.assertStatus(200)
    response.assertHeader('content-type', 'text/plain; charset=utf-8')
    response.assertTextIncludes('Disallow: /dashboard')
    response.assertTextIncludes('Disallow: /_preview')
    response.assertTextIncludes('/sitemap.xml')
  })

  test('the sitemap lists the public pages only', async ({ client, assert }) => {
    const response = await client.get('/sitemap.xml')

    response.assertStatus(200)
    const paths = [...response.text().matchAll(/<loc>[^<]*?:\d+(\/[^<]*)<\/loc>/g)].map(
      (match) => match[1]
    )
    assert.deepEqual(paths, ['/', '/login', '/signup', '/syarat', '/privasi'])
  })

  test('a public page arrives server-rendered with its title, description and Open Graph tags', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/privasi')

    response.assertStatus(200)
    const html = response.text()
    assert.include(html, '<title data-inertia="">Kebijakan privasi - Umima Clean</title>')
    assert.match(html, /<meta name="description" content="[^"]+"/)
    assert.include(html, '<meta property="og:title" content="Kebijakan privasi - Umima Clean"')
    assert.include(html, '/images/og.png')
    assert.include(html, '<h1')
  })
})
