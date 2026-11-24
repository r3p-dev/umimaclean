import { test } from '@japa/runner'
import { searchTerm } from '#helpers/place_search'

test.group('Place search term (MAP-1, D110)', () => {
  test('generic words are dropped and the rest is kept', ({ assert }) => {
    assert.equal(searchTerm('Jl. Dipatiukur'), 'dipatiukur')
    assert.equal(searchTerm('gang sukaluyu'), 'sukaluyu')
    assert.equal(searchTerm('Perum Griya Jalan Raya'), 'griya raya')
  })

  test('house numbers, blocks, RT/RW and the parts after the first comma are dropped', ({
    assert,
  }) => {
    assert.equal(searchTerm('Jl. Dipatiukur No. 35, RT 02/RW 05, Lebakgede'), 'dipatiukur')
    assert.equal(searchTerm('Komplek Bumi Asri Blok C2 No. 7, Bojongsoang'), 'bumi asri')
    assert.equal(searchTerm('Gg. Melati RT 3 RW 4'), 'melati')
    assert.equal(searchTerm('Jalan Sukaluyu I nomor 12'), 'sukaluyu i')
  })

  test('a search of generic words only is kept as typed', ({ assert }) => {
    assert.equal(searchTerm('Jalan'), 'jalan')
    assert.equal(searchTerm('gang komplek'), 'gang komplek')
  })
})
