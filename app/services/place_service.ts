import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import { searchTerms } from '#helpers/place'
import ServiceArea, { type Bounds, type Point } from '#models/service_area'
import type { PlaceRow, PointAddress } from '#services/types'

const NEAR = 'ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)'
const TERM = 'osm.normalize(:term)'
const COMPACT_TERM = `replace(${TERM}, ' ', '')`
const COMPACT = `replace(place.search, ' ', '')`
const SEARCH_BOUNDS = 'ST_MakeEnvelope(:west, :south, :east, :north, 4326)'
const BOUNDS_BUFFER_DEGREES = 0.03
const WORD_SIMILARITY = 0.5
const NEARBY_DEGREES = 0.009
const ROAD_DEGREES = 0.002
const CANDIDATES = 12
const SUGGESTIONS = 5
const MISSING_OBJECT_CODES = new Set(['42P01', '3F000', '42883'])

const CONTEXT_COLUMNS = `kelurahan.name AS kelurahan,
  coalesce(service.name, kecamatan.name) AS kecamatan,
  coalesce(service.city, city.name) AS city`

function contextJoins(point: string) {
  return `
  LEFT JOIN LATERAL (
    SELECT area.name, area.postcode FROM osm.areas area
    WHERE area.level = 7 AND ST_Contains(area.geom, ${point}) LIMIT 1
  ) kelurahan ON true
  LEFT JOIN LATERAL (
    SELECT service.name, service.city FROM public.service_areas service
    WHERE ST_Contains(service.boundary, ${point}) LIMIT 1
  ) service ON true
  LEFT JOIN LATERAL (
    SELECT area.name FROM osm.areas area
    WHERE service.name IS NULL AND area.level = 6 AND ST_Contains(area.geom, ${point}) LIMIT 1
  ) kecamatan ON true
  LEFT JOIN LATERAL (
    SELECT area.name FROM osm.areas area
    WHERE service.name IS NULL AND area.level = 5 AND ST_Contains(area.geom, ${point}) LIMIT 1
  ) city ON true`
}

function candidateColumns(table: 'roads' | 'pois') {
  return table === 'roads'
    ? `'road' AS kind, false AS is_poi, place.id, place.name, NULL AS street, ST_ClosestPoint(place.geom, ${NEAR}) AS point`
    : `'poi' AS kind, true AS is_poi, place.id, place.name, place.street, place.geom AS point`
}

function searchCandidates(table: 'roads' | 'pois') {
  return `(
    SELECT ${candidateColumns(table)},
      CASE
        WHEN place.search LIKE ${TERM} || '%' OR ${COMPACT} LIKE ${COMPACT_TERM} || '%' THEN 0
        WHEN place.search LIKE '% ' || ${TERM} || '%' THEN 1
        WHEN place.search LIKE '%' || ${TERM} || '%'
          OR ${COMPACT} LIKE '%' || ${COMPACT_TERM} || '%' THEN 2
        ELSE 3
      END AS rank,
      round(CAST(word_similarity(${TERM}, place.search) AS numeric), 1) AS similarity,
      place.geom <-> ${NEAR} AS distance
    FROM osm.${table} place
    WHERE length(${TERM}) >= 3
      AND place.geom && ${SEARCH_BOUNDS}
      AND (
        place.search LIKE '%' || ${TERM} || '%'
        OR ${COMPACT} LIKE '%' || ${COMPACT_TERM} || '%'
        OR ${TERM} <% place.search
      )
    ORDER BY rank, similarity DESC, distance
    LIMIT ${CANDIDATES}
  )`
}

const SEARCH_SQL = `
  SELECT candidate.kind, candidate.id, candidate.name, candidate.street,
    ST_Y(candidate.point) AS lat, ST_X(candidate.point) AS lng, ${CONTEXT_COLUMNS}
  FROM (
    ${searchCandidates('roads')}
    UNION ALL
    ${searchCandidates('pois')}
    ORDER BY rank, similarity DESC, is_poi, distance
    LIMIT ${CANDIDATES}
  ) candidate
  ${contextJoins('candidate.point')}
  ORDER BY candidate.rank, candidate.similarity DESC, candidate.is_poi, candidate.distance`

function nearbyCandidates(table: 'roads' | 'pois') {
  return `(
    SELECT ${candidateColumns(table)}, place.geom <-> ${NEAR} AS distance
    FROM osm.${table} place
    WHERE ST_DWithin(place.geom, ${NEAR}, ${NEARBY_DEGREES})
    ORDER BY place.geom <-> ${NEAR}
    LIMIT ${CANDIDATES}
  )`
}

const NEARBY_SQL = `
  SELECT candidate.kind, candidate.id, candidate.name, candidate.street,
    ST_Y(candidate.point) AS lat, ST_X(candidate.point) AS lng, ${CONTEXT_COLUMNS}
  FROM (
    ${nearbyCandidates('roads')}
    UNION ALL
    ${nearbyCandidates('pois')}
    ORDER BY distance
    LIMIT ${CANDIDATES}
  ) candidate
  ${contextJoins('candidate.point')}
  ORDER BY candidate.distance`

const DESCRIBE_SQL = `
  SELECT road.name AS road, ${CONTEXT_COLUMNS}, kelurahan.postcode
  FROM (SELECT ${NEAR} AS point) input
  LEFT JOIN LATERAL (
    SELECT place.name FROM osm.roads place
    WHERE ST_DWithin(place.geom, input.point, ${ROAD_DEGREES})
    ORDER BY place.geom <-> input.point
    LIMIT 1
  ) road ON true
  ${contextJoins('input.point')}`

export default class PlaceService {
  static #searchBounds?: Bounds

  async searchPlaces(text: string, near: Point) {
    const bounds = await this.#findSearchBounds()
    if (!bounds) {
      return []
    }
    for (const term of searchTerms(text)) {
      const rows = await this.#rows<PlaceRow>(() =>
        db.transaction(async (transaction) => {
          await transaction.rawQuery(
            `SET LOCAL pg_trgm.word_similarity_threshold = ${WORD_SIMILARITY}`
          )
          return transaction.rawQuery(SEARCH_SQL, { term, ...near, ...bounds })
        })
      )
      if (rows.length) {
        return this.#distinct(rows)
      }
    }
    return []
  }

  async findNearbyPlaces(near: Point) {
    return this.#distinct(await this.#rows<PlaceRow>(() => db.rawQuery(NEARBY_SQL, near)))
  }

  async describePoint(point: Point) {
    const [row] = await this.#rows<PointAddress>(() => db.rawQuery(DESCRIBE_SQL, point))
    return row?.road || row?.kelurahan || row?.kecamatan ? row : null
  }

  #distinct(rows: PlaceRow[]) {
    const seen = new Set<string>()
    return rows
      .filter((row) => {
        const key = [row.name, row.street, row.kelurahan, row.kecamatan].join('|').toLowerCase()
        if (seen.has(key)) {
          return false
        }
        seen.add(key)
        return true
      })
      .slice(0, SUGGESTIONS)
  }

  async #findSearchBounds() {
    if (!PlaceService.#searchBounds) {
      const extent = await ServiceArea.findExtent()
      if (!extent) {
        return null
      }
      PlaceService.#searchBounds = {
        west: extent.west - BOUNDS_BUFFER_DEGREES,
        south: extent.south - BOUNDS_BUFFER_DEGREES,
        east: extent.east + BOUNDS_BUFFER_DEGREES,
        north: extent.north + BOUNDS_BUFFER_DEGREES,
      }
    }
    return PlaceService.#searchBounds
  }

  async #rows<T>(query: () => Promise<{ rows: T[] }>): Promise<T[]> {
    try {
      const result = await query()
      return result.rows
    } catch (error) {
      if (MISSING_OBJECT_CODES.has((error as { code?: string }).code ?? '')) {
        logger.warn('osm schema is missing, run `node ace osm:import`')
        return []
      }
      throw error
    }
  }
}
