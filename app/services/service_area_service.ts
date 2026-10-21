import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import { ActivityAction } from '#enums/activity_enum'
import ServiceDistrict from '#models/service_district'
import type User from '#models/user'
import ActivityService from '#services/activity_service'
import { Geocoder, type GeocodedAddress, type Point } from '#services/geocoder_service'

export {
  Geocoder,
  NominatimGeocoder,
  type GeocodedAddress,
  type Point,
} from '#services/geocoder_service'

export type AreaTone = 'covered' | 'outside' | 'unknown'

export type Coverage = { city: string; districts: string[] | null }[]

export const DEFAULT_COVERAGE: Coverage = [
  { city: 'Kota Bandung', districts: null },
  { city: 'Kota Cimahi', districts: null },
  {
    city: 'Kab. Bandung',
    districts: [
      'Margaasih',
      'Margahayu',
      'Dayeuhkolot',
      'Bojongsoang',
      'Baleendah',
      'Katapang',
      'Soreang',
      'Pameungpeuk',
      'Banjaran',
      'Cangkuang',
    ],
  },
]

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/^(kec\.?|kecamatan)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function bareRegion(value: string) {
  return normalize(value).replace(/^(kota|kab\.?|kabupaten)\s+/, '')
}

function isRegency(name: string) {
  return /^(kab\.?|kabupaten)\s/i.test(name.trim())
}

type CoverageRow = { city: string; district: string | null }

export function coverageRows(coverage: Coverage): CoverageRow[] {
  return coverage.flatMap((entry): CoverageRow[] =>
    entry.districts === null
      ? [{ city: entry.city, district: null }]
      : entry.districts.map((district) => ({ city: entry.city, district }))
  )
}

export function pointArea(
  address: GeocodedAddress | null,
  coverage: Coverage = DEFAULT_COVERAGE
): AreaTone {
  if (!address) {
    return 'unknown'
  }

  const region = address.county ?? address.city ?? address.municipality
  if (!region) {
    return 'unknown'
  }
  const wantsRegency = !!address.county
  const area = coverage.find(
    (entry) =>
      isRegency(entry.city) === wantsRegency && bareRegion(entry.city) === bareRegion(region)
  )
  if (!area) {
    return 'outside'
  }
  if (area.districts === null) {
    return 'covered'
  }

  const covered = area.districts.map(normalize)
  const districts = [address.town, address.city_district, address.district, address.municipality]
    .filter((value): value is string => !!value)
    .map(normalize)
  if (districts.some((district) => covered.includes(district))) {
    return 'covered'
  }
  return districts.length ? 'outside' : 'unknown'
}

@inject()
export default class ServiceAreaService {
  constructor(
    protected geocoder: Geocoder,
    protected activity: ActivityService
  ) {}

  async coverage(): Promise<Coverage> {
    const rows = await ServiceDistrict.query().orderBy('id', 'asc')
    if (!rows.length) {
      return DEFAULT_COVERAGE
    }
    const cities = new Map<string, string[] | null>()
    for (const row of rows) {
      const current = cities.get(row.city)
      if (row.district === null || current === null) {
        cities.set(row.city, null)
      } else {
        cities.set(row.city, [...(current ?? []), row.district])
      }
    }
    return [...cities].map(([city, districts]) => ({ city, districts }))
  }

  async save(owner: User, coverage: Coverage) {
    await db.transaction(async (transaction) => {
      await ServiceDistrict.query({ client: transaction }).delete()
      await ServiceDistrict.createMany(coverageRows(coverage), { client: transaction })
    })
    await this.activity.record({
      actor: owner,
      action: ActivityAction.SETTINGS_CHANGED,
      detail: `Area layanan: ${coverage
        .map((entry) =>
          entry.districts === null
            ? `${entry.city} (seluruh)`
            : `${entry.city} (${entry.districts.length} kec.)`
        )
        .join(', ')}`,
    })
  }

  async check(point: Point): Promise<AreaTone> {
    try {
      return pointArea(await this.geocoder.reverse(point), await this.coverage())
    } catch (error) {
      logger.warn({ err: error }, 'Service area lookup failed')
      return 'unknown'
    }
  }
}
