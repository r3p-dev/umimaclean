import { readFile } from 'node:fs/promises'
import db from '@adonisjs/lucid/services/db'

// Inside Coblong: on Jalan Dipatiukur, in kelurahan Lebakgede.
export const DIPATIUKUR = { lat: -6.881768, lng: 107.61421 }

// A few OSM rows around Jalan Dipatiukur in the test database (MAP-1). The schema comes from the same
// file the import uses; call it inside the test's global transaction, so it is rolled back with it
// and the next test runs without `osm` again.
export async function loadOsmFixture() {
  await db.rawQuery(await readFile('maps/osm_schema.sql', 'utf8'))
  await db.rawQuery(`
    INSERT INTO osm.areas (level, name, postcode, geom) VALUES
      (6, 'Coblong', NULL, ST_Multi(ST_MakeEnvelope(107.59, -6.91, 107.64, -6.86, 4326))),
      (7, 'Lebakgede', '40132', ST_Multi(ST_MakeEnvelope(107.605, -6.895, 107.625, -6.875, 4326)));
    INSERT INTO osm.roads (name, highway, geom) VALUES
      ('Jalan Dipatiukur', 'secondary',
        ST_Multi(ST_GeomFromText('LINESTRING(107.6135 -6.8830, 107.6150 -6.8800)', 4326))),
      ('Gang Sukaluyu', 'residential',
        ST_Multi(ST_GeomFromText('LINESTRING(107.6290 -6.8990, 107.6300 -6.8985)', 4326))),
      ('Jalan Adipati Agung', 'tertiary',
        ST_Multi(ST_GeomFromText('LINESTRING(107.6250 -6.9100, 107.6260 -6.9110)', 4326)));
    INSERT INTO osm.pois (name, category, street, geom) VALUES
      ('Hotel NEO Dipatiukur', 'tourism=hotel', 'Jalan Dipatiukur',
        ST_SetSRID(ST_MakePoint(107.6160, -6.8898), 4326)),
      ('Masjid Salman', 'amenity=place_of_worship', NULL,
        ST_SetSRID(ST_MakePoint(107.6110, -6.8935), 4326));
  `)
}
