import { test } from '@japa/runner'

import { canonical, normalisePath } from '#seo/urls'
import { pageTitle, ORIGIN } from '#seo/config'
import { resolveHead } from '#seo/head'

test.group('pageTitle', () => {
  test('appends the brand suffix when it fits', ({ assert }) => {
    assert.equal(pageTitle('Cuci Tas Bandung'), 'Cuci Tas Bandung · Umima.clean')
  })

  test('drops the suffix rather than truncating a long title', ({ assert }) => {
    const long = 'Cuci Sepatu, Tas & Helm Bandung — Antar Jemput Gratis'
    assert.isAbove(`${long} · UmimaClean`.length, 60)
    assert.equal(pageTitle(long), long)
  })
})

test.group('canonical URLs', () => {
  test('never carries a trailing slash, except at the root', ({ assert }) => {
    assert.equal(canonical('/layanan/cuci-sepatu/'), `${ORIGIN}/layanan/cuci-sepatu`)
    assert.equal(canonical('/layanan/cuci-sepatu'), `${ORIGIN}/layanan/cuci-sepatu`)
    assert.equal(canonical('/'), `${ORIGIN}/`)
  })

  test('normalises paths consistently', ({ assert }) => {
    assert.equal(normalisePath('harga'), '/harga')
    assert.equal(normalisePath('/harga//'), '/harga')
    assert.equal(normalisePath('/'), '/')
  })
})

test.group('JSON-LD serialisation', () => {
  test('escapes < so a string can never close the script tag', ({ assert }) => {
    const head = resolveHead({
      path: '/uji',
      title: 'Uji',
      description: 'Uji',
      jsonLd: [{ '@type': 'Thing', 'name': '</script><img src=x>' }],
    })

    /** The raw angle bracket must not survive into the document */
    assert.notInclude(head.jsonLd, '</script>')
    assert.include(head.jsonLd, '\\u003c')

    /** ...and the graph still means exactly the same thing */
    const graph = JSON.parse(head.jsonLd)['@graph']
    const thing = graph.find((node: { '@type': string }) => node['@type'] === 'Thing')
    assert.equal(thing.name, '</script><img src=x>')
  })

  test('noindex pages are told not to be indexed but still followed', ({ assert }) => {
    const head = resolveHead({ path: '/uji', title: 'Uji', description: 'Uji', noindex: true })
    assert.equal(head.robots, 'noindex, follow')
  })
})
