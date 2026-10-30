TRUNCATE osm.roads, osm.pois, osm.areas RESTART IDENTITY;

INSERT INTO osm.areas (level, name, postcode, geom)
SELECT level, name, postcode, geom
FROM osm_import.boundaries
WHERE NOT ST_IsEmpty(geom);

INSERT INTO osm.roads (name, highway, geom)
SELECT name, mode() WITHIN GROUP (ORDER BY highway), ST_Multi(ST_LineMerge(ST_Collect(geom)))
FROM (
  SELECT
    road.name,
    road.highway,
    road.geom,
    coalesce(kelurahan.id::text, ST_AsText(ST_SnapToGrid(ST_PointOnSurface(road.geom), 0.02))) AS place
  FROM osm_import.roads road
  LEFT JOIN LATERAL (
    SELECT area.id
    FROM osm.areas area
    WHERE area.level = 7 AND ST_Intersects(area.geom, ST_PointOnSurface(road.geom))
    LIMIT 1
  ) kelurahan ON true
) located
GROUP BY name, place;

INSERT INTO osm.pois (name, category, street, geom)
SELECT name, category, street, geom
FROM osm_import.pois;

ANALYZE osm.roads, osm.pois, osm.areas;
