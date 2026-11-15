# Setup & Teardown Guide

This document describes the reproducible zero-to-running setup (from an empty environment) and the complete teardown/cleanup process for Umima.Clean.

---

## 1. Prerequisites

Ensure your host system has the following tools installed:

- **Node.js**: `>=24.0.0` (as defined in `package.json` `engines`).
- **npm**: matches Node.js 24 (committed `package-lock.json`).
- **Podman** (rootless) with a compose provider (e.g., `podman-compose` 1.6+). Docker-only features are not used.
- **PostgreSQL 18 with PostGIS 3.6**: image `docker.io/postgis/postgis:18-3.6`. In development, this is typically provided by the shared local PostgreSQL server (see `docs/ARCHITECTURE.md` §6.1).

---

## 2. Zero-to-Running Bootstrap

### Step 1: Clone and install dependencies

```sh
git clone <repository-url> umimaclean
cd umimaclean
npm install
npx playwright install chromium
```

### Step 2: Environment configuration

Copy the template environment file and generate the application key:

```sh
cp .env.example .env
node ace generate:key
```

Ensure the database connection variables in `.env` match your local PostgreSQL server:

```ini
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=user
DB_PASSWORD=password
DB_DATABASE=umimaclean_dev
```

Test runs use `.env.test` automatically, which defaults to `DB_DATABASE=umimaclean_dev_test`.

### Step 3: Create databases and enable extensions

Run `database/create_databases.sql` against the administrative `postgres` database:

```sh
podman compose --profile tools run --rm -T psql -d postgres -f /database/create_databases.sql
```

_(Alternatively, via host psql: `PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -f database/create_databases.sql`)_

This creates `umimaclean_dev` and `umimaclean_dev_test` from `template0` and enables `postgis`, `pg_trgm`, and `unaccent`.

### Step 4: Run migrations and seed demo data

```sh
node ace migration:run
node ace db:seed
```

This creates the application tables (`users`, `remember_me_tokens`, `activity_logs`) and seeds demo accounts (one owner, two staff, sample customers). The seeder prints the demo credentials to the console upon completion.

### Step 5: (Optional) Map data and routing setup

For features involving spatial lookups, routing, and interactive maps:

1. **Build map tools image**:

   ```sh
   podman compose --profile tools build map-tools
   ```

2. **Download Java extract and clip to Bandung Raya**:

   ```sh
   mkdir -p storage/osm
   curl -fL -o storage/osm/java-latest.osm.pbf https://download.geofabrik.de/asia/indonesia/java-latest.osm.pbf
   curl -fL -o storage/osm/java-latest.osm.pbf.md5 https://download.geofabrik.de/asia/indonesia/java-latest.osm.pbf.md5
   cd storage/osm && md5sum -c java-latest.osm.pbf.md5 && cd ../..
   podman compose --profile tools run --rm -T map-tools osmium extract --bbox=107.20,-7.37,107.99,-6.76 --strategy=smart --option=types=multipolygon,boundary --overwrite --output=/data/bandung-raya.osm.pbf /data/java-latest.osm.pbf
   ```

3. **Import OSM schema and data**:

   ```sh
   podman compose --profile tools run --rm -T psql -q -f /maps/osm_schema.sql
   podman compose --profile tools run --rm -T psql -q -c 'CREATE SCHEMA IF NOT EXISTS osm_import'
   podman compose --profile tools run --rm -T map-tools sh -c 'PGPASSWORD="$DB_PASSWORD" osm2pgsql --create --output=flex --style=/maps/osm_import.lua --schema=osm_import --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" --database="$DB_DATABASE" /data/bandung-raya.osm.pbf'
   podman compose --profile tools run --rm -T psql -q --single-transaction -f /maps/osm_build.sql
   ```

4. **Build and start OSRM motorbike router**:

   ```sh
   mkdir -p storage/osrm
   cp storage/osm/bandung-raya.osm.pbf storage/osrm/
   podman compose --profile tools run --rm -T osrm-build osrm-extract --profile=/opt/motorbike.lua /data/bandung-raya.osm.pbf
   podman compose --profile tools run --rm -T osrm-build osrm-contract /data/bandung-raya.osrm
   rm storage/osrm/bandung-raya.osm.pbf
   podman compose up -d osrm
   curl -s --retry 10 --retry-connrefused 'http://127.0.0.1:5000/nearest/v1/driving/107.6186,-6.9026'
   ```

5. **Download base map PMTiles**:

   Protomaps publishes daily builds at `https://build.protomaps.com/<YYYYMMDD>.pmtiles` (historical builds remain archived and accessible; metadata is listed at `https://build-metadata.protomaps.dev/builds.json`). To pick a build, ensure its tileset major version matches `@protomaps/basemaps` (v4.x). For example, using build `20261112.pmtiles`:

   ```sh
   mkdir -p public/tiles
   podman compose --profile tools run --rm -T pmtiles extract https://build.protomaps.com/20261112.pmtiles /out/bandung-raya-20261112.pmtiles --bbox=107.20,-7.37,107.99,-6.76
   ```

   _(Optional verification: `podman compose --profile tools run --rm -T pmtiles show /out/bandung-raya-20261112.pmtiles`)_

### Step 6: Start development server

```sh
npm run dev
```

The application is now available at `http://localhost:3333`.

---

## 3. Verification Commands

Run the full verification suite to ensure code quality:

```sh
npm run lint         # ESLint (must exit 0 with no warnings)
npm run typecheck    # TypeScript checks for backend and Inertia frontend
npm test             # Japa test runner (unit, functional, and browser tests)
```

---

## 4. Teardown and Cleanup

To reset the environment or completely tear down local resources:

### Stop application and background containers

1. Stop the Node.js dev server: `Ctrl+C` in the terminal.
2. Stop and remove OSRM and tool containers:
   ```sh
   podman compose down
   ```

### Drop databases

Drop the development and test databases from PostgreSQL:

```sh
podman compose --profile tools run --rm -T psql -d postgres -c 'DROP DATABASE IF EXISTS umimaclean_dev;'
podman compose --profile tools run --rm -T psql -d postgres -c 'DROP DATABASE IF EXISTS umimaclean_dev_test;'
```

_(Note: On a shared database server, do not drop other projects' databases)._

### Delete data files and build artifacts

Remove untracked map data, tiles, compiled assets, and dependency caches:

```sh
rm -rf storage/osm storage/osrm public/tiles
rm -rf build tmp public/assets node_modules
```

### Complete repository reset

To return the Git workspace to a completely clean state (identical to a fresh clone):

```sh
git clean -fdx
```

> **Warning**: `git clean -fdx` permanently deletes all untracked and git-ignored files, including `.env`, `node_modules`, and local test logs.
