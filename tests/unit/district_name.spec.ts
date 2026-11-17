import { test } from '@japa/runner'
import { editDistance, normalizeDistrictName } from '#helpers/district_name'
import { tilesWarning } from '#helpers/map'

test.group('Kecamatan names (GUEST-1, D100)', () => {
  test('names compare as lowercase letters without a "Kec." prefix', ({ assert }) => {
    assert.equal(normalizeDistrictName('Kec. Bojong Soang'), 'bojongsoang')
    assert.equal(normalizeDistrictName('  kecamatan Coblong '), 'coblong')
    assert.equal(normalizeDistrictName('Bandung Kidul'), 'bandungkidul')
  })

  test('the edit distance counts single-letter changes', ({ assert }) => {
    assert.equal(editDistance('coblong', 'coblong'), 0)
    assert.equal(editDistance('coblog', 'coblong'), 1)
    assert.equal(editDistance('cobolng', 'coblong'), 2)
    assert.equal(editDistance('bandung', 'bandungkidul'), 5)
    assert.equal(editDistance('', 'abc'), 3)
  })
})

test.group('Base map warnings in development (MAP-2, M4a-fix1)', () => {
  test('say whether the setting is empty or the file is missing', ({ assert }) => {
    assert.equal(
      tilesWarning(undefined, false),
      'Peta dasar tidak tampil: MAP_TILES_FILE kosong di .env (docs/SETUP.md Step 5).'
    )
    assert.equal(
      tilesWarning('bandung.pmtiles', false),
      'Peta dasar tidak tampil: public/tiles/bandung.pmtiles tidak ditemukan.'
    )
    assert.isNull(tilesWarning('bandung.pmtiles', true))
  })
})
