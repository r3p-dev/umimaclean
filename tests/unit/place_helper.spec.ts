import { test } from '@japa/runner'
import { searchTerms } from '#helpers/place'

test.group('searchTerms', () => {
  test('drops house numbers, RT/RW and the city, keeps the locality as a fallback', ({
    assert,
  }) => {
    assert.deepEqual(searchTerms('Jl. Dipatiukur No. 35, RT 02/RW 05, Lebakgede, Kota Bandung'), [
      'Dipatiukur',
      'Lebakgede',
    ])
  })

  test('tries the street without a trailing number or numeral', ({ assert }) => {
    assert.deepEqual(searchTerms('Jalan Sukajadi II, Cimahi'), ['Sukajadi II', 'Sukajadi'])
  })

  test('ignores generic words unless nothing else is left', ({ assert }) => {
    assert.deepEqual(searchTerms('Gg. Antapani'), ['Antapani'])
    assert.deepEqual(searchTerms('Komplek Perumahan Margahayu Raya Blok 3'), [
      'Margahayu Raya 3',
      'Margahayu Raya',
    ])
    assert.deepEqual(searchTerms('gang'), ['gang'])
    assert.deepEqual(searchTerms('Blok C3'), ['Blok C3'])
  })
})
