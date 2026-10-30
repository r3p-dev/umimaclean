/*
 * OSM lookup tables for address search, nearby places and reverse lookup (PlaceService).
 * Not a Lucid migration: the osm schema is outside the public schema that migration:fresh,
 * db:wipe and the test reset touch, and it is filled by `node ace osm:import` (or restored from a
 * pg_dump on the server). Every statement is idempotent; the import and the test setup both run it.
 *
 * - osm.normalize: lower case, no accents, punctuation as spaces, a leading "jalan"/"jl"/"jln"
 *   dropped. IMMUTABLE so it can back the generated search columns and their trigram indexes
 *   (unaccent() itself is only STABLE).
 * - roads: named highways merged per name and kelurahan, so one street is one row.
 * - pois: named amenities, shops, offices, places and similar; category is "key=value".
 * - areas: admin boundaries, level 5 kota/kabupaten, 6 kecamatan, 7 kelurahan/desa; postcode
 *   from the boundary's postal_code tag.
 * - search: GIN gin_trgm_ops for prefix, substring and typo matches; GIST on geom for KNN and
 *   containment.
 * - compact: GIN gin_trgm_ops on search without spaces, so "dipati ukur" finds "dipatiukur".
 */
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE SCHEMA IF NOT EXISTS osm;

CREATE OR REPLACE FUNCTION osm.normalize(value text) RETURNS text
  LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
  RETURN regexp_replace(
    btrim(regexp_replace(lower(public.unaccent('public.unaccent'::regdictionary, value)), '[^a-z0-9]+', ' ', 'g')),
    '^(jalan|jln|jl) ',
    ''
  );

CREATE TABLE IF NOT EXISTS osm.roads (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  highway text NOT NULL,
  search text GENERATED ALWAYS AS (osm.normalize(name)) STORED,
  geom geometry(MultiLineString, 4326) NOT NULL
);
CREATE INDEX IF NOT EXISTS roads_search_index ON osm.roads USING gin (search gin_trgm_ops);
CREATE INDEX IF NOT EXISTS roads_compact_index ON osm.roads USING gin (replace(search, ' ', '') gin_trgm_ops);
CREATE INDEX IF NOT EXISTS roads_geom_index ON osm.roads USING gist (geom);

CREATE TABLE IF NOT EXISTS osm.pois (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  street text,
  search text GENERATED ALWAYS AS (osm.normalize(name)) STORED,
  geom geometry(Point, 4326) NOT NULL
);
CREATE INDEX IF NOT EXISTS pois_search_index ON osm.pois USING gin (search gin_trgm_ops);
CREATE INDEX IF NOT EXISTS pois_compact_index ON osm.pois USING gin (replace(search, ' ', '') gin_trgm_ops);
CREATE INDEX IF NOT EXISTS pois_geom_index ON osm.pois USING gist (geom);

CREATE TABLE IF NOT EXISTS osm.areas (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  level smallint NOT NULL,
  name text NOT NULL,
  postcode text,
  geom geometry(MultiPolygon, 4326) NOT NULL
);
CREATE INDEX IF NOT EXISTS areas_geom_index ON osm.areas USING gist (geom);
