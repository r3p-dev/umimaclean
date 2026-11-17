-- The polygon that clips the OSM extract (docs/ARCHITECTURE.md D88): the union of the 64 kecamatan of
-- database/data/service_areas_full.geojson, buffered 5 km on the spheroid so streets and places just
-- outside a border stay in. Reads the committed file, not the service_areas table, so the result
-- depends only on that file. Prints one GeoJSON FeatureCollection:
--   podman compose --profile tools run --rm -T psql -At -f /maps/clip_polygon.sql > maps/clip_polygon.geojson
\set boundaries `cat /database/data/service_areas_full.geojson`
SELECT json_build_object(
  'type', 'FeatureCollection',
  'features', json_build_array(json_build_object(
    'type', 'Feature',
    'properties', json_build_object(),
    'geometry', ST_AsGeoJSON(
      ST_Buffer(ST_Union(ST_SetSRID(ST_GeomFromGeoJSON(feature -> 'geometry'), 4326))::geography, 5000)::geometry,
      7
    )::json
  ))
)
FROM jsonb_array_elements(:'boundaries'::jsonb -> 'features') AS feature;
