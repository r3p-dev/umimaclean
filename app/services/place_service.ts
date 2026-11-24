import db from '@adonisjs/lucid/services/db'
import { searchTerm } from '#helpers/place_search'

export interface Place {
  id: string
  name: string
  detail: string
  // What choosing the place writes into the address field, e.g. "Jalan Dipatiukur, Lebakgede, Coblong".
  fullName: string
  lat: number
  lng: number
}

export interface PointLabel {
  street: string | null
  kelurahan: string | null
}

type PlaceRow = {
  kind: 'road' | 'poi'
  id: number
  name: string
  lat: number
  lng: number
  kelurahan: string | null
  kecamatan: string | null
}

const PLACE_LIMIT = 5
// Degrees, not metres: about 220 m for the street under a pin.
const STREET_DEGREES = 0.002

// The kelurahan and kecamatan a candidate point lies in, for the line under its name.
const PLACE_COLUMNS = `
  SELECT candidate.kind, candidate.id, candidate.name,
    ST_Y(candidate.point) AS lat, ST_X(candidate.point) AS lng,
    kelurahan.name AS kelurahan, kecamatan.name AS kecamatan
  FROM candidates candidate
  LEFT JOIN LATERAL (
    SELECT area.name FROM osm.areas area
    WHERE area.level = 7 AND ST_Covers(area.geom, candidate.point) LIMIT 1
  ) kelurahan ON true
  LEFT JOIN LATERAL (
    SELECT area.name FROM osm.areas area
    WHERE area.level = 6 AND ST_Covers(area.geom, candidate.point) LIMIT 1
  ) kecamatan ON true`

// Matches with and without spaces ("dipati ukur" finds "dipatiukur"), or by trigram word
// similarity for typos ("dipatiukr"); names that start with the term first, then the closest.
const SEARCH_SQL = `
  WITH input AS (
    SELECT osm.normalize(?) AS term, ST_SetSRID(ST_MakePoint(?, ?), 4326) AS near
  ), candidates AS (
    SELECT 'road' AS kind, road.id, road.name, ST_ClosestPoint(road.geom, input.near) AS point,
      replace(road.search, ' ', '') LIKE replace(input.term, ' ', '') || '%' AS is_prefix,
      word_similarity(input.term, road.search) AS similarity,
      road.geom <-> input.near AS distance
    FROM osm.roads road, input
    WHERE replace(road.search, ' ', '') LIKE '%' || replace(input.term, ' ', '') || '%'
      OR input.term <% road.search
    UNION ALL
    SELECT 'poi', poi.id, poi.name, poi.geom,
      replace(poi.search, ' ', '') LIKE replace(input.term, ' ', '') || '%',
      word_similarity(input.term, poi.search),
      poi.geom <-> input.near
    FROM osm.pois poi, input
    WHERE replace(poi.search, ' ', '') LIKE '%' || replace(input.term, ' ', '') || '%'
      OR input.term <% poi.search
    ORDER BY is_prefix DESC, similarity DESC, distance
    LIMIT ${PLACE_LIMIT}
  )
  ${PLACE_COLUMNS}
  ORDER BY candidate.is_prefix DESC, candidate.similarity DESC, candidate.distance`

const LABEL_SQL = `
  WITH input AS (SELECT ST_SetSRID(ST_MakePoint(?, ?), 4326) AS point)
  SELECT road.name AS street, kelurahan.name AS kelurahan
  FROM input
  LEFT JOIN LATERAL (
    SELECT road.name FROM osm.roads road
    WHERE ST_DWithin(road.geom, input.point, ${STREET_DEGREES})
    ORDER BY road.geom <-> input.point LIMIT 1
  ) road ON true
  LEFT JOIN LATERAL (
    SELECT area.name FROM osm.areas area
    WHERE area.level = 7 AND ST_Covers(area.geom, input.point) LIMIT 1
  ) kelurahan ON true`

// Place search and the street under a pin, from our own OSM data (MAP-1). The `osm`
// schema is loaded by a command, not by migrations, so it may be missing: then every method
// returns null and the pin is placed by hand (NFR-4).
export default class PlaceService {
  // Asked before every query: a failed query would abort a surrounding transaction, and the data can
  // be loaded while the server runs.
  async isAvailable() {
    const result = await db.rawQuery("SELECT to_regclass('osm.roads') IS NOT NULL AS is_available")
    return result.rows[0].is_available as boolean
  }

  async searchPlaces(text: string, near: { lat: number; lng: number }): Promise<Place[] | null> {
    if (!(await this.isAvailable())) {
      return null
    }
    const result = await db.rawQuery(SEARCH_SQL, [searchTerm(text), near.lng, near.lat])
    return result.rows.map((row: PlaceRow) => this.#toPlace(row))
  }

  async describePoint(point: { lat: number; lng: number }): Promise<PointLabel | null> {
    if (!(await this.isAvailable())) {
      return null
    }
    const result = await db.rawQuery(LABEL_SQL, [point.lng, point.lat])
    return result.rows[0] as PointLabel
  }

  #toPlace(row: PlaceRow): Place {
    return {
      id: `${row.kind}-${row.id}`,
      name: row.name,
      detail: [row.kelurahan, row.kecamatan && `Kec. ${row.kecamatan}`].filter(Boolean).join(', '),
      fullName: [row.name, row.kelurahan, row.kecamatan].filter(Boolean).join(', '),
      lat: row.lat,
      lng: row.lng,
    }
  }
}
