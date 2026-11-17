#!/usr/bin/env bash
# Measures the M0 OSM import pipeline (docs/SETUP.md step 5) in a throwaway database, with the
# tool containers capped at 4 CPUs like the VPS. Usage: measure_osm_import.sh <repo> <work-dir>
set -u
repo="$1"; work="$2"
db=umimaclean_osm_measure
pg_image=docker.io/postgis/postgis:18-3.6@sha256:4a43e3c3e5d55b9208240fc71db543b79c638766280c625a425bd0a2390989c4
cd "$repo" || exit 1
mkdir -p "$work"

psql_run() {  # psql against the shared server with the .env credentials; extra args passed through
  podman run --rm -i --network host --env-file .env -v "$work:/work:z" -v "$repo/maps:/maps:ro,z" \
    --entrypoint sh "$pg_image" -c 'PGPASSWORD="$DB_PASSWORD" exec psql -v ON_ERROR_STOP=1 -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$@"' psql "$@"
}
tool_run() {  # map-tools with 4 CPUs; prints wall time and the container's peak memory
  local start end
  start=$(date +%s.%N)
  podman run --rm -i --network host --cpus=4 ${TOOL_MEMORY:+--memory=$TOOL_MEMORY --memory-swap=$TOOL_MEMORY} -e OSMIUM_POOL_THREADS=4 --env-file .env \
    -v "$repo/storage/osm:/data:z" -v "$work:/work:z" -v "$repo/maps:/maps:ro,z" \
    localhost/umimaclean-map-tools sh -c "$1"' ; status=$?; echo "memory.peak_bytes=$(cat /sys/fs/cgroup/memory.peak)"; exit $status'
  local status=$?
  end=$(date +%s.%N)
  echo "wall_seconds=$(echo "$end - $start" | bc) exit=$status"
}
sample_postgres() {  # samples the shared postgres container memory every second until killed
  while true; do podman stats --no-stream --format '{{.MemUsage}}' postgres; sleep 1; done
}

echo "== machine: $(nproc) cores, $(free -g | awk '/Mem:/ {print $2}') GB RAM (tools capped with --cpus=4)"
echo "== input"
ls -l storage/osm/java-latest.osm.pbf
(cd storage/osm && md5sum -c java-latest.osm.pbf.md5)

echo; echo "== throwaway database $db"
psql_run -d postgres -c "DROP DATABASE IF EXISTS $db" -c "CREATE DATABASE $db TEMPLATE template0"
psql_run -d $db -q -c 'CREATE EXTENSION postgis' -c 'CREATE EXTENSION pg_trgm' -c 'CREATE EXTENSION unaccent'

echo; echo "== clip polygon: union of the 64 full-resolution kecamatan, buffered 5 km on geography"
python3 -I "$(dirname "$0")/geojson_to_sql.py" database/data/service_areas_full.geojson service_areas "$work/service_areas.sql"
psql_run -d $db -q -f /work/service_areas.sql
psql_run -d $db -At -c "SELECT json_build_object('type','FeatureCollection','features',json_build_array(json_build_object('type','Feature','properties',json_build_object(),'geometry',ST_AsGeoJSON(ST_Buffer(ST_Union(geom)::geography, 5000)::geometry, 7)::json))) FROM service_areas" > "$work/clip_polygon.geojson"
psql_run -d $db -c "SELECT round((ST_Area(ST_Buffer(ST_Union(geom)::geography, 5000)) / 1e6)::numeric) AS polygon_km2, round((ST_Area(ST_MakeEnvelope(107.20, -7.37, 107.99, -6.76, 4326)::geography) / 1e6)::numeric) AS bbox_km2, ST_Within(ST_Union(geom), ST_MakeEnvelope(107.20, -7.37, 107.99, -6.76, 4326)) AS bbox_contains_all_areas FROM service_areas"
ls -l "$work/clip_polygon.geojson"; sha256sum "$work/clip_polygon.geojson"

echo; echo "== osmium extract, bounding box (D6, current)"
tool_run 'osmium extract --bbox=107.20,-7.37,107.99,-6.76 --strategy=smart --option=types=multipolygon,boundary --overwrite --output=/work/bbox.osm.pbf /data/java-latest.osm.pbf'
ls -l "$work/bbox.osm.pbf"

echo; echo "== osmium extract, clip polygon"
tool_run 'osmium extract --polygon=/work/clip_polygon.geojson --strategy=smart --option=types=multipolygon,boundary --overwrite --output=/work/polygon.osm.pbf /data/java-latest.osm.pbf'
ls -l "$work/polygon.osm.pbf"

echo; echo "== osmium extract, clip polygon, limited to 512 MB without swap (the VPS default per container)"
TOOL_MEMORY=512m tool_run 'osmium extract --polygon=/work/clip_polygon.geojson --strategy=smart --option=types=multipolygon,boundary --overwrite --output=/work/polygon-512m.osm.pbf /data/java-latest.osm.pbf'
cmp "$work/polygon.osm.pbf" "$work/polygon-512m.osm.pbf" && echo "same output as the unlimited run"

echo; echo "== postgres memory before import"
podman stats --no-stream --format 'postgres {{.MemUsage}}' postgres

sample_postgres > "$work/postgres_mem.txt" &
sampler=$!

echo; echo "== osm schema + osm2pgsql into osm_import (polygon extract)"
psql_run -d $db -q -f /maps/osm_schema.sql
psql_run -d $db -q -c 'CREATE SCHEMA osm_import'
tool_run "PGPASSWORD=\"\$DB_PASSWORD\" osm2pgsql --create --output=flex --style=/maps/osm_import.lua --schema=osm_import --number-processes=4 --host=\"\$DB_HOST\" --port=\"\$DB_PORT\" --user=\"\$DB_USER\" --database=$db /work/polygon.osm.pbf 2>&1"
echo; echo "== osm2pgsql again, limited to 512 MB without swap (recreates osm_import)"
TOOL_MEMORY=512m tool_run "PGPASSWORD=\"\$DB_PASSWORD\" osm2pgsql --create --output=flex --style=/maps/osm_import.lua --schema=osm_import --number-processes=4 --host=\"\$DB_HOST\" --port=\"\$DB_PORT\" --user=\"\$DB_USER\" --database=$db /work/polygon.osm.pbf 2>&1"
psql_run -d $db -c "SELECT pg_size_pretty(sum(pg_total_relation_size(c.oid))) AS osm_import_size FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'osm_import' AND c.relkind = 'r'"

echo; echo "== osm_build.sql (one transaction: refill osm, drop osm_import)"
start=$(date +%s.%N)
psql_run -d $db -q --single-transaction -f /maps/osm_build.sql; echo "exit=$?"
echo "wall_seconds=$(echo "$(date +%s.%N) - $start" | bc)"

kill $sampler
echo "postgres memory samples during osm2pgsql + build: $(wc -l < "$work/postgres_mem.txt"), highest:"
sort -h "$work/postgres_mem.txt" | tail -1

echo; echo "== result"
psql_run -d $db -c "SELECT (SELECT count(*) FROM osm.roads) AS roads, (SELECT count(*) FROM osm.pois) AS pois, (SELECT count(*) FROM osm.areas) AS areas, pg_size_pretty(sum(pg_total_relation_size(c.oid))) AS osm_size FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'osm' AND c.relkind = 'r'"

echo; echo "== pg_dump of the osm schema (shipping option)"
start=$(date +%s.%N)
podman run --rm --network host --env-file .env -v "$work:/work:z" --entrypoint sh "$pg_image" -c "PGPASSWORD=\"\$DB_PASSWORD\" pg_dump -h \"\$DB_HOST\" -p \"\$DB_PORT\" -U \"\$DB_USER\" -d $db -n osm -Fc -f /work/osm.dump"; echo "exit=$?"
echo "wall_seconds=$(echo "$(date +%s.%N) - $start" | bc)"
ls -l "$work/osm.dump"

echo; echo "== drop throwaway database"
psql_run -d postgres -c "DROP DATABASE $db" -c "SELECT count(*) AS leftover FROM pg_database WHERE datname = '$db'"
