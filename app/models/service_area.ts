import db from '@adonisjs/lucid/services/db'
import { ServiceAreaSchema } from '#database/schema'

export type Point = { lat: number; lng: number }
export type Bounds = { west: number; south: number; east: number; north: number }

export default class ServiceArea extends ServiceAreaSchema {
  static summary() {
    return ServiceArea.query()
      .select('id', 'city', 'name', 'code', 'is_active')
      .orderBy('city', 'asc')
      .orderBy('name', 'asc')
  }

  static active() {
    return ServiceArea.summary().where('is_active', true)
  }

  static contains(point: Point) {
    return ServiceArea.active()
      .whereRaw('ST_Contains(boundary, ST_SetSRID(ST_MakePoint(?, ?), 4326))', [
        point.lng,
        point.lat,
      ])
      .first()
  }

  static async findExtent(): Promise<Bounds | null> {
    const [extent] = await ServiceArea.query()
      .select(
        db.raw('ST_XMin(ST_Extent(boundary)) AS west'),
        db.raw('ST_YMin(ST_Extent(boundary)) AS south'),
        db.raw('ST_XMax(ST_Extent(boundary)) AS east'),
        db.raw('ST_YMax(ST_Extent(boundary)) AS north')
      )
      .pojo<{ west: number | null; south: number; east: number; north: number }>()
    return extent.west === null ? null : (extent as Bounds)
  }
}
