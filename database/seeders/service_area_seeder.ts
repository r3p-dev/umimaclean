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

const ACTIVE_DISTRICTS: Record<string, string[]> = {
  'Kabupaten Bandung': [
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
}

export default class extends BaseSeeder {
  override async run() {
    const file = await readFile(app.makePath('database/data/service_areas.geojson'), 'utf8')
    const { features } = JSON.parse(file) as BoundaryFile
    const now = new Date()

    await this.client
      .table('service_areas')
      .insert(
        features.map(({ properties, geometry }) => ({
          code: properties.code,
          city: properties.city,
          name: properties.name,
          boundary: this.client.raw('ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(?), 4326))', [
            JSON.stringify(geometry),
          ]),
          is_active:
            ACTIVE_CITIES.includes(properties.city) ||
            (ACTIVE_DISTRICTS[properties.city] ?? []).includes(properties.name),
          created_at: now,
          updated_at: now,
        }))
      )
      .onConflict('code')
      .merge(['city', 'name', 'boundary', 'updated_at'])
  }
}
