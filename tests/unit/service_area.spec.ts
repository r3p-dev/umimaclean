import { test } from '@japa/runner'
import {
  DEFAULT_COVERAGE,
  pointArea,
  type Coverage,
  type GeocodedAddress,
} from '#services/area_service'

type ClientArea = {
  checkPointArea: (address: GeocodedAddress | null, coverage: Coverage) => string
}

const client: ClientArea = await import(
  new URL('../../inertia/lib/location/service_area.ts', import.meta.url).href
)

const SAMPLES: { label: string; address: GeocodedAddress | null; tone: string }[] = [
  {
    label: 'Kota Bandung',
    address: { city: 'Kota Bandung', district: 'Coblong' },
    tone: 'covered',
  },
  { label: 'Cimahi', address: { city: 'Cimahi', village: 'Karangmekar' }, tone: 'covered' },
  {
    label: 'Dayeuhkolot',
    address: { town: 'Dayeuhkolot', county: 'Kabupaten Bandung' },
    tone: 'covered',
  },
  {
    label: 'Banjaran',
    address: { town: 'Banjaran', county: 'Kabupaten Bandung' },
    tone: 'covered',
  },
  {
    label: 'Cileunyi',
    address: { town: 'Cileunyi', county: 'Kabupaten Bandung' },
    tone: 'outside',
  },
  {
    label: 'Lembang (KBB)',
    address: { town: 'Lembang', county: 'Bandung Barat' },
    tone: 'outside',
  },
  {
    label: 'Jatinangor',
    address: { town: 'Jatinangor', county: 'Kabupaten Sumedang' },
    tone: 'outside',
  },
  {
    label: 'Kab. Bandung without kecamatan',
    address: { village: 'Pamekaran', county: 'Kabupaten Bandung' },
    tone: 'unknown',
  },
  { label: 'nothing', address: null, tone: 'unknown' },
]

const EDITED: Coverage = [
  { city: 'Kota Bandung', districts: ['Coblong'] },
  { city: 'Kab. Bandung Barat', districts: ['Lembang'] },
]

test.group('Service area', () => {
  test('{label} with the default coverage')
    .with(SAMPLES)
    .run(({ assert }, sample) => {
      assert.equal(pointArea(sample.address), sample.tone)
      assert.equal(client.checkPointArea(sample.address, DEFAULT_COVERAGE), sample.tone)
    })

  test('an edited coverage changes the result the same way on both sides', ({ assert }) => {
    const cases: [GeocodedAddress, string][] = [
      [{ city: 'Kota Bandung', district: 'Coblong' }, 'covered'],
      [{ city: 'Kota Bandung', district: 'Antapani' }, 'outside'],
      [{ city: 'Cimahi', village: 'Karangmekar' }, 'outside'],
      [{ town: 'Lembang', county: 'Bandung Barat' }, 'covered'],
    ]
    for (const [address, tone] of cases) {
      assert.equal(pointArea(address, EDITED), tone)
      assert.equal(client.checkPointArea(address, EDITED), tone)
    }
  })
})
