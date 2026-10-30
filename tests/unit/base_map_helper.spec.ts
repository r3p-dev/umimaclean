import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from '@japa/runner'
import { findBaseMapFiles } from '#helpers/base_map'

test.group('findBaseMapFiles', () => {
  test('lists the dated base maps newest first and skips partial and other files', async ({
    assert,
  }) => {
    const directory = await mkdtemp(join(tmpdir(), 'tiles-'))
    for (const name of [
      'bandung-raya-20260901.pmtiles',
      'bandung-raya-20261029.pmtiles',
      'bandung-raya-20261130.pmtiles.partial',
      'bandung-raya.pmtiles',
      'notes.txt',
    ]) {
      await writeFile(join(directory, name), '')
    }

    assert.deepEqual(findBaseMapFiles(directory), [
      'bandung-raya-20261029.pmtiles',
      'bandung-raya-20260901.pmtiles',
    ])
    await rm(directory, { recursive: true })
  })

  test('a missing directory has none', ({ assert }) => {
    assert.deepEqual(findBaseMapFiles(join(tmpdir(), 'no-such-tiles-directory')), [])
  })
})
