import { readFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

type BoundaryFile = {
  features: {
    properties: { code: string; name: string; city: string }
    geometry: object
  }[]
}

const ACTIVE_CITIES = ['Kota Bandung', 'Kota Cimahi']

const ACTIVE_KAB_BANDUNG_DISTRICTS = [
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
]

export default class ServiceAreaSeeder extends BaseSeeder {
  override async run() {
    const file = await readFile(app.makePath('database/data/service_areas.geojson'), 'utf8')
    const { features } = JSON.parse(file) as BoundaryFile
    const now = new Date()

    await this.client
      .table('service_areas')
      .insert(
        features.map(({ properties, geometry }) => {
          const isActive =
            ACTIVE_CITIES.includes(properties.city) ||
            (properties.city === 'Kabupaten Bandung' &&
              ACTIVE_KAB_BANDUNG_DISTRICTS.includes(properties.name))

          return {
            code: properties.code,
            city: properties.city,
            name: properties.name,
            boundary: this.client.raw('ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(?), 4326))', [
              JSON.stringify(geometry),
            ]),
            is_active: isActive,
            created_at: now,
            updated_at: now,
          }
        })
      )
      .onConflict('code')
      .merge(['city', 'name', 'boundary', 'is_active', 'updated_at'])
  }
}
