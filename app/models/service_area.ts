import { scope } from '@adonisjs/lucid/orm'
import { ServiceAreaSchema } from '#database/schema'

export default class ServiceArea extends ServiceAreaSchema {
  static active = scope((query) => {
    query.where('is_active', true)
  })

  static ordered = scope((query) => {
    query.orderBy('city', 'asc').orderBy('name', 'asc')
  })

  // The districts a GeoJSON polygon does not fully cover: the OSM clip must cover them all (D88).
  static async findNamesOutside(polygonGeoJson: string) {
    const areas = await this.query()
      .whereRaw('NOT ST_CoveredBy(boundary, ST_SetSRID(ST_GeomFromGeoJSON(?), 4326))', [
        polygonGeoJson,
      ])
      .orderBy('name', 'asc')
    return areas.map((area) => area.name)
  }
}
