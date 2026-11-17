\echo '== Server versions'
SELECT version();
SELECT postgis_full_version();

\echo '== Features and vertices per file'
SELECT 'simplified' AS file, count(*) AS districts, sum(ST_NPoints(geom)) AS vertices FROM simplified
UNION ALL
SELECT 'full', count(*), sum(ST_NPoints(geom)) FROM full_res;

\echo '== Hausdorff distance per district, EPSG:32748 (WGS 84 / UTM zone 48S), metres'
SELECT s.code, s.name, s.city,
       round(ST_HausdorffDistance(ST_Transform(s.geom, 32748), ST_Transform(f.geom, 32748))::numeric, 1) AS hausdorff_utm48s_m
FROM simplified s JOIN full_res f USING (code)
ORDER BY hausdorff_utm48s_m DESC;

\echo '== Cross-check on geography (spheroid): farthest vertex of each boundary from the other boundary, metres'
WITH simplified_to_full AS (
  SELECT s.code, max(ST_Distance(vertex.geom::geography, ST_Boundary(f.geom)::geography)) AS metres
  FROM simplified s JOIN full_res f USING (code)
  CROSS JOIN LATERAL ST_DumpPoints(s.geom) AS vertex
  GROUP BY s.code
), full_to_simplified AS (
  SELECT f.code, max(ST_Distance(vertex.geom::geography, ST_Boundary(s.geom)::geography)) AS metres
  FROM full_res f JOIN simplified s USING (code)
  CROSS JOIN LATERAL ST_DumpPoints(f.geom) AS vertex
  GROUP BY f.code
)
SELECT s.code, f.name,
       round(simplified_to_full.metres::numeric, 1) AS simplified_to_full_m,
       round(full_to_simplified.metres::numeric, 1) AS full_to_simplified_m,
       round(greatest(simplified_to_full.metres, full_to_simplified.metres)::numeric, 1) AS hausdorff_geography_m,
       round(ST_HausdorffDistance(ST_Transform(s.geom, 32748), ST_Transform(f.geom, 32748))::numeric, 1) AS hausdorff_utm48s_m
FROM simplified s
JOIN full_res f USING (code)
JOIN simplified_to_full USING (code)
JOIN full_to_simplified USING (code)
ORDER BY hausdorff_geography_m DESC;

\echo '== Summary over all 64 districts'
SELECT round(max(ST_HausdorffDistance(ST_Transform(s.geom, 32748), ST_Transform(f.geom, 32748)))::numeric, 1) AS max_hausdorff_utm48s_m,
       round(avg(ST_HausdorffDistance(ST_Transform(s.geom, 32748), ST_Transform(f.geom, 32748)))::numeric, 1) AS mean_hausdorff_utm48s_m
FROM simplified s JOIN full_res f USING (code);
