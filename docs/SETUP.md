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

Test runs use `.env.test` automatically, which configures `PORT=3334` and `APP_URL=http://${HOST}:${PORT}` (so `npm test` runs without port collisions against a running dev server on 3333, D71) and defaults to `DB_DATABASE=umimaclean_dev_test`.

`TRUSTED_PROXIES` lists the addresses allowed to set `X-Forwarded-For` (comma-separated IPs, CIDR ranges or `loopback`; default `loopback`). Behind a reverse proxy on the same machine nothing needs to change. **In production** the app runs behind Traefik in rootless Podman and sees Traefik's address on the container network, not loopback, so set `TRUSTED_PROXIES` to that Podman network's subnet. Find it with `podman network inspect <network> --format '{{range .Subnets}}{{.Subnet}} {{end}}'` and set, for example, `TRUSTED_PROXIES=10.89.0.0/24`. Without it, every request looks like it comes from Traefik and the per-IP sign-in limit (ACC-3) would block all customers together.

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

This creates the application tables and seeds the demo data: one owner, two staff, sample customers, the price list, the store settings and the service areas. `database/seeders/main/index_seeder.ts` runs the seeders in order and, in development only, prints the demo accounts when it finishes (tests and production print nothing).

### Step 5: (Optional) Map data and routing setup

For features involving spatial lookups, routing, and interactive maps:

1. **Build map tools image**:

   ```sh
   podman compose --profile tools build map-tools
   ```

2. **Download a dated monthly Java snapshot** (`docs/ARCHITECTURE.md` D87; pick the first of a recent month from <https://download.geofabrik.de/asia/indonesia/>):

   ```sh
   mkdir -p storage/osm
   curl -fL -o storage/osm/java-261101.osm.pbf https://download.geofabrik.de/asia/indonesia/java-261101.osm.pbf
   curl -fL -o storage/osm/java-261101.osm.pbf.md5 https://download.geofabrik.de/asia/indonesia/java-261101.osm.pbf.md5
   ```

3. **Import it into the `osm` schema** (D88–D91; development only, clipping needs about 4 GB of free memory):

   ```sh
   node ace osm:import 261101
   ```

   The command checks the snapshot's MD5 and that `maps/clip_polygon.geojson` covers every service area, clips the snapshot to `storage/osm/bandung-raya.osm.pbf`, loads the staging schema `osm_import` with osm2pgsql, writes the production artifact `storage/osm/osm-import-261101.dump` with its `.sha256`, and refills `osm` in one transaction. It prints the snapshot's SHA-256 for `docs/DEPENDENCIES.md` §4. After a change to `database/data/service_areas_full.geojson`, regenerate the clip polygon first:

   ```sh
   podman compose --profile tools run --rm -T psql -At -f /maps/clip_polygon.sql > maps/clip_polygon.geojson
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

### OSM data in production

Production never runs the map tools (D89). Copy the artifact and its `.sha256` from `storage/osm/` to the server, then run two commands in the database container (named `umimaclean-postgres` by the deploy tooling, `<app>-<service>`; confirmed with the deployment in M12):

```sh
sha256sum -c osm-import-261101.dump.sha256
podman exec -i umimaclean-postgres sh -c 'pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < osm-import-261101.dump
cat osm_schema.sql osm_build.sql | podman exec -i umimaclean-postgres sh -c 'psql -v ON_ERROR_STOP=1 --single-transaction -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

The first restores the staging schema `osm_import`; the second (`maps/osm_schema.sql` and `maps/osm_build.sql`, copied with the artifact) refills `osm` in one transaction, so searches wait a moment and never see empty tables, and a failure changes nothing. **Rollback** (D90): run the same commands with the previous artifact. **Refresh** (D92): by hand, with a newer monthly snapshot, when there is a reason.

The same two steps in development, for example to load exactly what production has:

```sh
cd storage/osm && sha256sum -c osm-import-261101.dump.sha256 && cd ../..
podman compose --profile tools run --rm -T pg-client sh -c 'pg_restore --clean --if-exists --no-owner -d "$PGDATABASE" /data/osm-import-261101.dump'
podman compose --profile tools run --rm -T psql -q --single-transaction -f /maps/osm_schema.sql -f /maps/osm_build.sql
```

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

`npm run check` runs the three steps above with one line of output per step; a failing step prints its name and the end of its log (full logs in `tmp/check/`). `VERBOSE=1 npm run check` prints the full output. The tests run with Japa's `dot` reporter there; `npm test` keeps the default reporter.

A test run never changes a committed file. Browser tests save their screenshots and axe logs in the git-ignored `tmp/screenshots/`.

**Evidence for a milestone** is written only on request and only into the git-ignored `tmp/evidence/<milestone>/`; it is never committed (`docs/ARCHITECTURE.md` D84, `docs/evidence/README.md`).

- Verification logs: run each command through the evidence runner. The command's output goes only to `tmp/evidence/<milestone>/logs/<name>.log`, with a header (time, command, commit, uncommitted changes); the runner prints one line, `PASS|FAIL exit=<n> log=<path>`, plus the last 40 lines on failure, and exits with the command's exit code. An existing log is never overwritten.
- Screenshots and axe logs: set `EVIDENCE_MILESTONE` to the milestone and run the browser tests of that milestone. Each file is copied to `tmp/evidence/<milestone>/screenshots/` as well, and a test fails rather than overwrite a file that already exists.

```sh
node scripts/evidence_run.ts M4a lint -- npm run lint
node scripts/evidence_run.ts M4a browser-area -- env EVIDENCE_MILESTONE=M4a node ace test browser --files=tests/browser/<spec>.spec.ts
```

The runner starts the command without a shell, so set variables with `env NAME=value cmd`, which works the same in bash and fish.

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
