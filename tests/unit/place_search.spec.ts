import { test } from '@japa/runner'
import { searchTerm } from '#helpers/place_search'

test.group('Place search term (MAP-1)', () => {
  test('generic words are dropped and the rest is kept', ({ assert }) => {
    assert.equal(searchTerm('Jl. Dipatiukur'), 'dipatiukur')
    assert.equal(searchTerm('gang sukaluyu'), 'sukaluyu')
    assert.equal(searchTerm('Komplek Bumi Asri, Gg. Melati'), 'bumi asri melati')
    assert.equal(searchTerm('Perum Griya Jalan Raya'), 'griya raya')
  })

  test('a search of generic words only is kept as typed', ({ assert }) => {
    assert.equal(searchTerm('Jalan'), 'jalan')
    assert.equal(searchTerm('gang komplek'), 'gang komplek')
  })
})
