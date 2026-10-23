import { ServiceAreaSchema } from '#database/schema'

export type Point = { lat: number; lng: number }

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
}
