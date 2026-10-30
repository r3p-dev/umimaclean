import { readFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'

export const OSM_POINTS = {
  dipatiukur: { lat: -6.8895, lng: 107.6101 },
  merdekaNear: { lat: -6.921, lng: 107.581 },
  outsideAreas: { lat: -6.9, lng: 107.83 },
  empty: { lat: -6.7, lng: 107.9 },
}

function box(west: number, south: number, east: number, north: number) {
  return `MULTIPOLYGON(((${west} ${south},${east} ${south},${east} ${north},${west} ${north},${west} ${south})))`
}

const AREAS = [
  [5, 'Kota Fiksi', null, box(107.5, -7.0, 107.9, -6.8)],
  [6, 'Cibiru Fiksi', null, box(107.8, -6.98, 107.88, -6.85)],
  [7, 'Lebakgede', '40132', box(107.6, -6.9, 107.62, -6.88)],
  [7, 'Desa Luar', '40619', box(107.82, -6.92, 107.85, -6.88)],
] as const

const ROADS = [
  ['Jalan Dipatiukur', 'secondary', 'MULTILINESTRING((107.605 -6.895,107.615 -6.885))'],
  ['Jalan Dipati Raya', 'residential', 'MULTILINESTRING((107.64 -6.93,107.645 -6.935))'],
  ['Jalan Merdeka', 'primary', 'MULTILINESTRING((107.58 -6.92,107.582 -6.922))'],
  ['Jalan Merdeka', 'residential', 'MULTILINESTRING((107.65 -6.86,107.652 -6.862))'],
  ['Jalan Sukaluar', 'residential', 'MULTILINESTRING((107.829 -6.9,107.831 -6.9))'],
  ['Jalan Dipatiluar', 'residential', 'MULTILINESTRING((108.2 -6.9,108.21 -6.9))'],
] as const

const POIS = [
  ['Kopi Dipatiukur', 'amenity=cafe', 'Jalan Dipatiukur', 'POINT(107.611 -6.889)'],
  ['Taman Merdeka', 'leisure=park', null, 'POINT(107.5812 -6.9212)'],
] as const

export async function loadOsmFixtures() {
  await db.rawQuery(await readFile(app.makePath('database/osm/schema.sql'), 'utf8'))
  await db.rawQuery('TRUNCATE osm.roads, osm.pois, osm.areas RESTART IDENTITY')
  for (const [level, name, postcode, geom] of AREAS) {
    await db.rawQuery(
      'INSERT INTO osm.areas (level, name, postcode, geom) VALUES (?, ?, ?, ST_GeomFromText(?, 4326))',
      [level, name, postcode, geom]
    )
  }
  for (const [name, highway, geom] of ROADS) {
    await db.rawQuery(
      'INSERT INTO osm.roads (name, highway, geom) VALUES (?, ?, ST_GeomFromText(?, 4326))',
      [name, highway, geom]
    )
  }
  for (const [name, category, street, geom] of POIS) {
    await db.rawQuery(
      'INSERT INTO osm.pois (name, category, street, geom) VALUES (?, ?, ?, ST_GeomFromText(?, 4326))',
      [name, category, street, geom]
    )
  }
}
