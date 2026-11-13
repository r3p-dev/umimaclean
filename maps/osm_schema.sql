-- The `osm` schema: OpenStreetMap lookup tables for address search, nearby places and the street
-- label under a map pin (MAP-1). Not a Lucid migration: it is outside the `public` schema that
-- migrations and test resets touch, and it is filled from an OSM extract (docs/ARCHITECTURE.md §6.2).
-- Every statement is idempotent.
--
-- roads: named highways merged per name and kelurahan, so one street is one search result.
-- pois:  named amenities, shops, offices, places and stations; category is "key=value".
-- areas: admin boundaries, level 5 kota/kabupaten, 6 kecamatan, 7 kelurahan/desa, with postcode.
-- Each `search` column has a trigram index for prefix, substring and typo matches, and a second
-- trigram index on the same text without spaces, so "dipati ukur" finds "dipatiukur".
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE SCHEMA IF NOT EXISTS osm;

-- Generated columns need an IMMUTABLE function, but unaccent(text) is only STABLE because it looks
-- up its dictionary through the search_path. Naming the dictionary explicitly removes that lookup,
-- which is what makes the IMMUTABLE label safe. A leading "jalan"/"jln"/"jl" is dropped.
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
