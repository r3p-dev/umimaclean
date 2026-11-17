# M4a evidence: Maps, area map and landing coverage check

Date: 2026-11-17. Commit: 66f214a (+ uncommitted changes listed in each log header). **First stop of M4a: `osm:import` only**; the other M4a criteria come in the next stops.

## Checklist

One row per criterion of this stop. Excerpts are exact lines from `tmp/evidence/M4a/logs/`; terminal colour codes (ANSI escapes) are left out.

| Criterion (req ID) | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| `node ace osm:import` runs the §6.2 pipeline from a dated snapshot, checking MD5 and the clip polygon first, and writes the production artifact (D87–D89, D91) | PASS | `node scripts/evidence_run.ts M4a osm-import -- sh -c 'time node ace osm:import 261101 && ls -l … && cat ….sha256 && podman compose … psql -c "SELECT counts …"'` | see below |
| Production's two commands load the artifact (`pg_restore`, `psql` refill), shown with their development equivalents; rollback is the same with the previous artifact (D89, D90) | PASS | `node scripts/evidence_run.ts M4a load-artifact -- sh -c 'cd storage/osm && sha256sum -c … && … pg-client pg_restore … && … psql --single-transaction -f osm_schema.sql -f osm_build.sql && … counts'` | see below |
| The command refuses a bad snapshot name, a missing snapshot, a non-development environment and a wrong MD5 (D91) | PASS | `node scripts/evidence_run.ts M4a osm-import-refusals -- …`, `node scripts/evidence_run.ts M4a osm-import-md5-mismatch -- …` | see below |
| The committed clip polygon is what `maps/clip_polygon.sql` produces (D88) | PASS | `node scripts/evidence_run.ts M4a clip-polygon-reproducible -- sh -c '… psql -At -f /maps/clip_polygon.sql \| sha256sum && sha256sum maps/clip_polygon.geojson …'` | see below |
| The clip polygon covers every service area, a smaller one does not (D88, unit test) and the whole suite passes | PASS | `node scripts/evidence_run.ts M4a check -- npm run check` | see below |
| The two code commits pass on their own: commit 1 alone, then commit 2 on top, in a clone of `66f214a` (the two docs commits change no code) | PASS | `node scripts/evidence_run.ts M4a commit-1-alone -- sh -c 'cd tmp/verify-commits && git status --short && npm run check'`, then `commit-2-after-1` the same plus `node ace list \| grep -c osm:import` | `ok   lint (23s)` / `ok   typecheck (9s)` / `ok   test (204s)` / `exit 0`, and for commit 2 `ok   test (201s)`, `1`, `exit 0` |
| How `osm:import` runs in development and production | decision recorded | D87–D93 in `docs/ARCHITECTURE.md` §7 | — |

Excerpt for osm-import (`tmp/evidence/M4a/logs/osm-import.log`, lines 15, 16, 54, 77, 79, 82–89):

```text
[ info ] java-261101.osm.pbf: MD5 b5a374892ed0233203a63a1d4df8d89d, SHA-256 a68762d6e2724c70b542872f5ba1866b7479dc5fd7a49963c0b97ac71992c296
[ info ] maps/clip_polygon.geojson covers every service area
[ info ] Wrote storage/osm/osm-import-261101.dump and its .sha256
[ success ] osm schema loaded from java-261101.osm.pbf
real	0m28,427s
-rw-r--r--. 1 r3p r3p 57401054 Nov 17 15:59 storage/osm/bandung-raya.osm.pbf
-rw-r--r--. 1 r3p r3p  5041066 Nov 17 15:59 storage/osm/osm-import-261101.dump
5ec51758c18fa1adfed9cd936e10324f85d15c86d58b9003e699dc8d764d4669  osm-import-261101.dump
 roads | pois  | areas | staging_schemas_left | osm_size
-------+-------+-------+----------------------+----------
 12235 | 12518 |   302 |                    0 | 25 MB
```

Excerpt for load-artifact (`tmp/evidence/M4a/logs/load-artifact.log`):

```text
osm-import-261101.dump: OK
DETAIL:  drop cascades to table osm_import.boundaries
drop cascades to table osm_import.osm2pgsql_properties
drop cascades to table osm_import.pois
drop cascades to table osm_import.roads
 roads | pois  | areas | staging_schemas_left
-------+-------+-------+----------------------
 12235 | 12518 |   302 |                    0
(1 row)
```

Excerpt for the refusals (`tmp/evidence/M4a/logs/osm-import-refusals.log` and `osm-import-md5-mismatch.log`; for the missing file the log shows `Error: ENOENT: no such file or directory, open '…/storage/osm/java-250101.osm.pbf.md5'` and a stack trace, left out here because they hold absolute paths):

```text
== bad snapshot format
[ error ] The snapshot is a date like 261101 (java-261101.osm.pbf)
== snapshot file missing
== outside development
[ error ] osm:import runs only in development; see docs/SETUP.md for production
exit 0
[ error ] MD5 of java-000101.osm.pbf is 0632d04c8ec91b3c8c4ea5ae1e38908a, Geofabrik says 00000000000000000000000000000000
exit 0
```

Excerpt for clip-polygon-reproducible (`tmp/evidence/M4a/logs/clip-polygon-reproducible.log`):

```text
c2d409c8a9e880cafc2069eb84b38e770bf69f8ca73cd9c7b5b278c3c59bb193  -
c2d409c8a9e880cafc2069eb84b38e770bf69f8ca73cd9c7b5b278c3c59bb193  maps/clip_polygon.geojson
21155 maps/clip_polygon.geojson
exit 0
```

Excerpt for check (`tmp/evidence/M4a/logs/check.log`):

```text
ok   lint (20s)
ok   typecheck (8s)
ok   test (200s)
exit 0
```

## Run & view

From a clean checkout with the map tools image built (`docs/SETUP.md` Step 5):

```sh
curl -fL -o storage/osm/java-261101.osm.pbf https://download.geofabrik.de/asia/indonesia/java-261101.osm.pbf
curl -fL -o storage/osm/java-261101.osm.pbf.md5 https://download.geofabrik.de/asia/indonesia/java-261101.osm.pbf.md5
node ace osm:import 261101      # about 30 s; clipping needs about 4 GB of free memory
```

The result is the `osm` schema of the development database and `storage/osm/osm-import-261101.dump` (+ `.sha256`). Production: `docs/SETUP.md`, "OSM data in production". No page changed in this stop, so there are no screens.

## Screens

None: this stop adds no page.

## How it works

```text
node ace osm:import 261101
  → MD5 of storage/osm/java-261101.osm.pbf against its .md5 (stop on mismatch), print SHA-256
  → ServiceArea.findNamesOutside(maps/clip_polygon.geojson) must be empty (stop otherwise)
  → map-tools: osmium extract --polygon → storage/osm/bandung-raya.osm.pbf
  → psql: DROP/CREATE SCHEMA osm_import → map-tools: osm2pgsql → osm_import.{roads,pois,boundaries}
  → pg-client: pg_dump osm_import → storage/osm/osm-import-261101.dump (+ .sha256)
  → psql --single-transaction: osm_schema.sql + osm_build.sql (refill osm, drop osm_import)
production: sha256sum -c → pg_restore → psql refill (same two files)
```

## Code tour

1. `maps/clip_polygon.sql`: union of the 64 committed kecamatan + 5 km, printed as GeoJSON.
2. `maps/clip_polygon.geojson`: its output (21,155 bytes), kept out of Prettier in `.prettierignore`.
3. `app/models/service_area.ts`: `findNamesOutside`, the clip check.
4. `compose.yaml`: the `pg-client` service and one PostGIS image anchor for `psql` and `pg-client`.
5. `commands/osm_import.ts`: the command (generated with `node ace make:command`).
6. `tests/unit/service_area.spec.ts`: the clip polygon test.
7. `docs/SETUP.md` Step 5 and "OSM data in production"; `docs/ARCHITECTURE.md` §3, §6.2, D6, D87–D93; `docs/DEPENDENCIES.md` §3, §4; `docs/PLAN.md`; `CHANGELOG.md`.

## Decisions & deviations

- D87–D93 (the owner's answers to the plan of 0.3.2): dated monthly snapshot; clip polygon of the 64 kecamatan + 5 km; build in development and ship the staging dump; roll back by loading the previous dump; `osm:import` is development only, production uses `pg_restore` and `psql`; manual refresh; PostGIS image mirrored to `ghcr.io/r3p-dev/` in M12.
- The clip polygon and the coverage check read the committed boundaries, not the development database: that database still holds the simplified boundaries from before D77 (14,605 vertices against 61,408). The command's check runs against `service_areas` (the app's table), and the simplified boundaries lie inside the polygon too.
- Production commands use `podman exec … umimaclean-postgres`; the container name follows the deploy tooling (`<app>-<service>`) and is confirmed with the deployment (M12). They were run here only through their development equivalents.
- The command reports a missing snapshot with the framework's error (`ENOENT …`), which names the missing file.

## Known limitations / deferred

- The rest of M4a (maps, attribution, display geometry, area map, landing coverage check) is not built yet.
- The production commands have not run on the VPS (no production yet).
- The OSRM build in `docs/SETUP.md` Step 5 reads `storage/osm/bandung-raya.osm.pbf`, which is now clipped with the polygon instead of the box of D6; whether that clip suits routing is checked in M6.
- The development database's boundaries predate D77; `node ace db:seed` reloads them and resets the areas' on/off switches.
