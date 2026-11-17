# M4a evidence: Maps, area map and landing coverage check

Date: 2026-11-17. Commits: 66f214a for the first stop (`osm:import`), aaca655 for the second (maps, area map, landing coverage check); uncommitted changes are listed in each log header. Every M4a criterion is now covered.

## Checklist

One row per criterion; the first block is the first stop, the second block the second stop. Excerpts are exact lines from `tmp/evidence/M4a/logs/`; terminal colour codes (ANSI escapes) are left out.

| Criterion (req ID) | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| `node ace osm:import` runs the §6.2 pipeline from a dated snapshot, checking MD5 and the clip polygon first, and writes the production artifact (D87–D89, D91) | PASS | `node scripts/evidence_run.ts M4a osm-import -- sh -c 'time node ace osm:import 261101 && ls -l … && cat ….sha256 && podman compose … psql -c "SELECT counts …"'` | see below |
| Production's two commands load the artifact (`pg_restore`, `psql` refill), shown with their development equivalents; rollback is the same with the previous artifact (D89, D90) | PASS | `node scripts/evidence_run.ts M4a load-artifact -- sh -c 'cd storage/osm && sha256sum -c … && … pg-client pg_restore … && … psql --single-transaction -f osm_schema.sql -f osm_build.sql && … counts'` | see below |
| The command refuses a bad snapshot name, a missing snapshot, a non-development environment and a wrong MD5 (D91) | PASS | `node scripts/evidence_run.ts M4a osm-import-refusals -- …`, `node scripts/evidence_run.ts M4a osm-import-md5-mismatch -- …` | see below |
| The committed clip polygon is what `maps/clip_polygon.sql` produces (D88) | PASS | `node scripts/evidence_run.ts M4a clip-polygon-reproducible -- sh -c '… psql -At -f /maps/clip_polygon.sql \| sha256sum && sha256sum maps/clip_polygon.geojson …'` | see below |
| The clip polygon covers every service area, a smaller one does not (D88, unit test) and the whole suite passes | PASS | `node scripts/evidence_run.ts M4a check -- npm run check` | see below |
| The two code commits pass on their own: commit 1 alone, then commit 2 on top, in a clone of `66f214a` (the two docs commits change no code) | PASS | `node scripts/evidence_run.ts M4a commit-1-alone -- sh -c 'cd tmp/verify-commits && git status --short && npm run check'`, then `commit-2-after-1` the same plus `node ace list \| grep -c osm:import` | `ok   lint (23s)` / `ok   typecheck (9s)` / `ok   test (204s)` / `exit 0`, and for commit 2 `ok   test (201s)`, `1`, `exit 0` |
| How `osm:import` runs in development and production | decision recorded | D87–D93 in `docs/ARCHITECTURE.md` §7 | — |
| MAP-2, AREA-1, OWN-9: the owner's area page shows the districts on a MapLibre map from the self-hosted PMTiles file, fonts and sprites; attribution not compact with the OSM and boundary credits; active and inactive differ by fill and solid or dashed outline plus a legend; no request to another host; axe and no sideways scroll at 360, 390, 1440 | PASS | `node scripts/evidence_run.ts M4a maps-browser-with-tiles -- env MAP_TILES_FILE=bandung-raya-20261112.pmtiles EVIDENCE_MILESTONE=M4a node ace test browser --files=tests/browser/maps_flow.spec.ts` | see below |
| GUEST-1, AREA-4: the landing check with "Gunakan lokasi saya" and a draggable pin sends one request per stop to the server check and shows the result; no request to another host | PASS | same run | see below |
| AREA-4, D80, D94: `GET /area/cek` answers covered, not covered (inactive district) and outside; refuses bad input with 422 and the 61st request in a minute with 429 and an Indonesian wait message; every role may use it; the owner page and the landing (only on request) get the shapes; no tiles file in tests | PASS | `node scripts/evidence_run.ts M4a area-check-functional -- node ace test functional --files=tests/functional/area_check.spec.ts` | `Tests  8 passed (8)` / `exit 0` |
| D95: display geometry keeps the 64 districts valid, gap-free and within 150 m of the real borders | PASS | `node scripts/evidence_run.ts M4a display-geometry-unit -- node ace test unit --files=tests/unit/service_area.spec.ts` | `Tests  7 passed (7)` / `exit 0` |
| MAP-2, NFR-3, D97: the build emits MapLibre's worker, and MapLibre is in its own chunk, not in the app entry | PASS | `node scripts/evidence_run.ts M4a build-map-chunks -- sh -c 'node ace build && ls -l build/public/assets … && grep -l maplibregl-canvas build/public/assets/app-*.js …'` | see below |
| The five code commits of the second stop pass one after another in a clone of `aaca655` (the two docs commits change no code) | PASS | `node scripts/evidence_run.ts M4a commit-maps-{1-deps,2-endpoint,3-geometry,4-owner-map,5-landing} -- sh -c 'cd tmp/verify-commits && … npm run check'` | each `ok   lint` / `ok   typecheck` / `ok   test` / `exit 0` (tests 200 s, 199 s, 198 s, 203 s, 230 s) |
| MAP-2: without the tiles file (`.env.test`) the maps draw a plain background and both map tests pass; lint, typecheck and every test pass | PASS | `node scripts/evidence_run.ts M4a check-stop-2-after-fix -- npm run check` (the first run, `check-stop-2`, failed typecheck on a test type: fixed, see Decisions) | `ok   lint (25s)` / `ok   typecheck (9s)` / `ok   test (232s)` / `exit 0` |

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

Excerpt for maps-browser-with-tiles (`tmp/evidence/M4a/logs/maps-browser-with-tiles.log`, then the test's own logs `tmp/evidence/M4a/screenshots/admin-area-peta-screenshots.log` and `landing-area-screenshots.log`):

```text
Tests  2 passed (2)
exit 0
admin-area-peta-360: scrollWidth=360 axe=none
admin-area-peta-390: scrollWidth=390 axe=none
admin-area-peta-1440: scrollWidth=1440 axe=none
landing-area-360: scrollWidth=360 axe=none checks=2 after drag: Terjangkau: Kecamatan Buahbatu, Kota Bandung.
landing-area-390: scrollWidth=390 axe=none checks=2 after drag: Terjangkau: Kecamatan Buahbatu, Kota Bandung.
landing-area-1440: scrollWidth=1440 axe=none checks=2 after drag: Terjangkau: Kecamatan Bandung Kidul, Kota Bandung.
```

The test asserts the credit texts, the legend, one check after "Gunakan lokasi saya" and exactly one more after the pin stops, and an empty list of requests to hosts other than localhost.

Excerpt for build-map-chunks (`tmp/evidence/M4a/logs/build-map-chunks.log`):

```text
public/assets/maplibre-gl-worker-Boc9pDRP.mjs                         519.54 kB
public/assets/area_map-qvkd0SPb.css                                    71.33 kB │ gzip:  10.25 kB
public/assets/service_area_map-2fKMEDxk.js                              1.31 kB │ gzip:   0.69 kB
public/assets/area_map-Cs-xKTal.js                                  1,137.00 kB │ gzip: 308.93 kB
public/assets/server/area_map-CqBoKN2T.js    4.65 kB │ gzip:  1.96 kB
no: the app entry does not contain MapLibre
exit 0
```

## Run & view

From a clean checkout with the map tools image built (`docs/SETUP.md` Step 5):

```sh
curl -fL -o storage/osm/java-261101.osm.pbf https://download.geofabrik.de/asia/indonesia/java-261101.osm.pbf
curl -fL -o storage/osm/java-261101.osm.pbf.md5 https://download.geofabrik.de/asia/indonesia/java-261101.osm.pbf.md5
node ace osm:import 261101      # about 30 s; clipping needs about 4 GB of free memory
```

The result is the `osm` schema of the development database and `storage/osm/osm-import-261101.dump` (+ `.sha256`). Production: `docs/SETUP.md`, "OSM data in production".

Maps (second stop): download the tiles file and the fonts and sprites (`docs/SETUP.md` Step 5, items 5–6), set `MAP_TILES_FILE=bandung-raya-20261112.pmtiles` in `.env`, then `npm run dev`:

- As the seeded owner (`node ace db:seed` prints the account) at `/staf/masuk`, open `/admin/pengaturan/area`: the map above the switches; switch a district off and its outline turns dashed and unfilled.
- As a guest at `/#area-layanan`: press "Gunakan lokasi saya" (allow location) or drag the pin; the result appears under the button. Without `MAP_TILES_FILE` the map has a plain background and works the same.

## Screens

From the run with the tiles file, every file opened:

- `/admin/pengaturan/area` at 360 px: the map card under the search with the districts on the base map, the credit line over two lines, the legend "Aktif"/"Nonaktif", then the switch lists (`tmp/evidence/M4a/screenshots/admin-area-peta-360.png`)
- `/admin/pengaturan/area` at 390 px: the same layout (`tmp/evidence/M4a/screenshots/admin-area-peta-390.png`)
- `/admin/pengaturan/area` at 1440 px: the map across the content width, Kota Bandung, Kota Cimahi and the active Kabupaten districts filled with solid outlines, the others dashed, base map labels (Sumedang, Garut), credit on one row (`tmp/evidence/M4a/screenshots/admin-area-peta-1440.png`)
- `/#area-layanan` at 360, 390 and 1440 px after "Gunakan lokasi saya": badges "Kota Bandung", "Kota Cimahi", "Kabupaten Bandung (sebagian)", the green note "Terjangkau: Kecamatan Buahbatu, Kota Bandung.", the map zoomed to the pin with street names and district borders, the credit line (`tmp/evidence/M4a/screenshots/landing-area-terjangkau-{360,390,1440}.png`)
- `/#area-layanan` at 360, 390 and 1440 px after dragging the pin: the pin moved; at 360 and 390 px still in Buahbatu, at 1440 px "Terjangkau: Kecamatan Bandung Kidul, Kota Bandung." (`tmp/evidence/M4a/screenshots/landing-area-geser-{360,390,1440}.png`)

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

Second stop:

```text
/admin/pengaturan/area → auth, admin ability → ServiceAreasController.index
  → AreaService.getAreaShapes (ST_CoverageSimplify, D95) → ServiceAreaShapeTransformer → props shapes, tilesUrl
  → ServiceAreaMap → import('~/lib/map/area_map') → MapLibre (+ pmtiles and base map layers if tilesUrl) → showAreas
  (a switch: PATCH toggle → redirect back → new props → showAreas sets the new data)

/ (landing) → HomeController.index → services, tilesUrl; areaShapes is optional
  → CoverageSection: section within 400 px → router.reload({ only: ['areaShapes'] }) and the map mounts
  → pin dropped or "Gunakan lokasi saya" → 300 ms → fetch GET /area/cek?lat&lng (Accept: application/json)
  → areaCheckThrottle (60/min/IP) → AreaCheckController.show → checkCoverageValidator
  → AreaService.checkCoverage (full boundaries, D78) → { isCovered, district } → note under the button
```

## Code tour

1. `maps/clip_polygon.sql`: union of the 64 committed kecamatan + 5 km, printed as GeoJSON.
2. `maps/clip_polygon.geojson`: its output (21,155 bytes), kept out of Prettier in `.prettierignore`.
3. `app/models/service_area.ts`: `findNamesOutside`, the clip check.
4. `compose.yaml`: the `pg-client` service and one PostGIS image anchor for `psql` and `pg-client`.
5. `commands/osm_import.ts`: the command (generated with `node ace make:command`).
6. `tests/unit/service_area.spec.ts`: the clip polygon test.
7. `docs/SETUP.md` Step 5 and "OSM data in production"; `docs/ARCHITECTURE.md` §3, §6.2, D6, D87–D93; `docs/DEPENDENCIES.md` §3, §4; `docs/PLAN.md`; `CHANGELOG.md`.

Second stop:

1. `start/env.ts`, `.env.example`, `.env.test`: `MAP_TILES_FILE` (empty in tests); `app/helpers/map.ts`: its URL.
2. `app/services/area_service.ts`: `getAreaShapes` (D95); `app/transformers/service_area_shape_transformer.ts`.
3. `app/validators/area_validator.ts`, `start/validator.ts` (messages), `start/limiter.ts` (`areaCheckThrottle`), `app/controllers/area_check_controller.ts`, `start/routes.ts` (`GET /area/cek`).
4. `app/controllers/service_areas_controller.ts`, `app/controllers/home_controller.ts`: the shapes and tiles props; `.adonisjs/` regenerated by `node ace codegen`.
5. `inertia/lib/map/area_map.ts`: MapLibre setup, worker (D97), colours (D98), credits and locale (D99), district layers, pin.
6. `inertia/components/organisms/service_area_map.tsx`: loads that module and keeps map, areas and pin in sync.
7. `inertia/pages/admin/settings/areas.tsx`: the map card and legend.
8. `inertia/components/organisms/landing/coverage_section.tsx`, `inertia/pages/home.tsx`: the landing section; `site_header.tsx`, `site_footer.tsx`: the "Area Layanan" links (D40).
9. Tests: `tests/unit/service_area.spec.ts` (display geometry), `tests/functional/area_check.spec.ts`, `tests/browser/maps_flow.spec.ts`.
10. `package.json`, `package-lock.json` (`maplibre-gl` 6.18.0, `pmtiles` 4.5.0, `@protomaps/basemaps` 5.7.2); `docs/ARCHITECTURE.md` §3, §6.4, D94–D99; `docs/DEPENDENCIES.md` §1, §4; `docs/SETUP.md` Step 5; `docs/PLAN.md`; `CHANGELOG.md`.

## Decisions & deviations

- D87–D93 (the owner's answers to the plan of 0.3.2): dated monthly snapshot; clip polygon of the 64 kecamatan + 5 km; build in development and ship the staging dump; roll back by loading the previous dump; `osm:import` is development only, production uses `pg_restore` and `psql`; manual refresh; PostGIS image mirrored to `ghcr.io/r3p-dev/` in M12.
- The clip polygon and the coverage check read the committed boundaries, not the development database: that database still holds the simplified boundaries from before D77 (14,605 vertices against 61,408). The command's check runs against `service_areas` (the app's table), and the simplified boundaries lie inside the polygon too.
- Production commands use `podman exec … umimaclean-postgres`; the container name follows the deploy tooling (`<app>-<service>`) and is confirmed with the deployment (M12). They were run here only through their development equivalents.
- The command reports a missing snapshot with the framework's error (`ENOENT …`), which names the missing file.
- Second stop: D94 (JSON endpoint, the owner's exception to CONVENTIONS §9), D95 (display geometry), D96 (self-hosted fonts and sprites; the SETUP sentence that the style and tile majors must match was wrong: Styles 5 go with Tiles 4), D97 and D98 (workarounds: MapLibre's worker URL under Vite, oklch theme colours), D99 (credits, locale, gestures, check delay).
- The 429 body of the area check is read with a hand-written type of `@adonisjs/limiter`'s format (`{ errors: { message }[] }`); the success type comes from the generated registry.
- Visual reference for the landing section: the earlier design's heading, city badges with "(sebagian)" and a one-line result with an icon tone; its order button is left out because that page does not exist yet (D33).
- The browser run with tiles was made before a type-only fix in the test (`ConstructorParameters` instead of `Parameters` for `AxeBuilder`); `check-stop-2-after-fix` ran every test after it.
- The landing test drags the pin to a point inside the map canvas: MapLibre does not end a marker drag over a map control, and at 360 px the uncollapsed credit line covers the bottom of the map.

## Known limitations / deferred

- The production commands have not run on the VPS (no production yet).
- The OSRM build in `docs/SETUP.md` Step 5 reads `storage/osm/bandung-raya.osm.pbf`, which is now clipped with the polygon instead of the box of D6; whether that clip suits routing is checked in M6.
- The development database was reseeded on 2026-11-17 (64 districts, 61,408 vertices, 43 active).
- At 360 px the uncollapsed credit line takes two lines over the bottom of the map; a pin cannot be dropped under it (D99 keeps it uncollapsed for the licences).
- The pin cannot be moved with the keyboard; "Gunakan lokasi saya" is the keyboard path, and text place search (MAP-1) comes for signed-in users in M4b.
- That the owner's map redraws after a switch is not asserted by a test (the map is a canvas); the functional test checks the shapes prop, and the switch tests of M3b check the toggle.
