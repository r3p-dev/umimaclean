# 0.3.1 evidence: M3 follow-ups

Date: 2026-11-17. Patch release after the M3 review, before M4a.

## 1. Summary

- **Screenshots no longer change committed evidence (D76).** Browser tests save screenshots and axe logs through `tests/helpers/screenshots.ts` into the git-ignored `tmp/screenshots/`. They are copied to an evidence folder only when `EVIDENCE_DIR` names one, and an existing file is never overwritten (`COPYFILE_EXCL`). Before: a plain `npm test` rewrote 11 committed screenshots in `../M3a-fix/` and rewrote `../M3b/` (byte-identical that time).
- **Full-resolution district boundaries (D77, AREA-1, AREA-4).** `../../../database/data/service_areas_full.geojson` replaces the simplified file. The simplified boundaries were up to **10.0 m** from the source (mean 9.8 m per district).
- **Shared border counts as covered (D78, AREA-4).** `AreaService.checkCoverage` orders matching districts by `is_active` descending, then `code`.
- **One index seeder (D79).** `../../../database/seeders/main/index_seeder.ts` runs the seeders in a fixed order and prints the demo accounts only in development.
- **Licence attribution planned for the M4a maps** (§6.4).
- **Map rate limits in the PRD (D80), M4 split (D81), saved addresses in a district turned off later (D82).**
- **Landing price list redesigned (D83, GUEST-1, SVC-1, SVC-4).**

## 2. How to run and see it

```sh
node ace migration:run
node ace db:seed          # prints the demo accounts (development only)
npm run dev               # http://localhost:3333/#harga
npm test                  # changes no committed file
EVIDENCE_DIR=docs/evidence/<new-folder> node ace test browser --files=tests/browser/landing_pricing.spec.ts
```

## 3. Screenshots

Section `#harga` only (element screenshots), Chromium at 360 × 780, 390 × 844 and 1440 × 900, each checked with axe (WCAG 2.1 A and AA, scoped to the section) and for horizontal scrolling.

| State                                    | Folder                           | Files                                       | Axe | Scroll |
| ---------------------------------------- | -------------------------------- | ------------------------------------------- | --- | ------ |
| Before (0.3.0), default view             | [harga-sebelum/](harga-sebelum/) | `landing-harga-{360,390,1440}.png`          | 0   | none   |
| After, default tab (Sepatu)              | [harga-sesudah/](harga-sesudah/) | `landing-harga-{360,390,1440}.png`          | 0   | none   |
| After, Helm tab with the store-only note | [harga-sesudah/](harga-sesudah/) | `landing-harga-tab-helm-{360,390,1440}.png` | 0   | none   |

Logs written by the tests: [harga-sebelum/landing-harga-screenshots.log](harga-sebelum/landing-harga-screenshots.log), [harga-sesudah/landing-harga-screenshots.log](harga-sesudah/landing-harga-screenshots.log), [harga-sesudah/landing-harga-tab-helm-screenshots.log](harga-sesudah/landing-harga-tab-helm-screenshots.log). The "before" shots were taken with the 0.3.0 component restored in the working tree for that one run.

## 4. How it works

- **Screenshots**: a spec calls `saveScreenshot(page, name)` or `saveElementScreenshot(locator, name)` → the file is written to `tmp/screenshots/` → if `EVIDENCE_DIR` is set, it is copied there with `COPYFILE_EXCL`, so a second run into the same folder fails with `EEXIST`.
- **Seeding**: `node ace db:seed` (and `testUtils.db().seed()`) → Lucid reads only `database/seeders/main` (`config/database.ts`) → `IndexSeeder` runs users, settings, services, service areas → prints the demo accounts when `app.inDev`.
- **Coverage**: `checkCoverage(lat, lng)` → `ST_Intersects` on the full boundaries → active districts first, then by code → the first row decides `isCovered`.
- **Price list**: `GET /` → `HomeController` → active services (`PriceListService`) → `ServiceTransformer` → `pricing_section.tsx` groups them per item kind into tabs.

## 5. Code tour

1. `tests/helpers/screenshots.ts`, then the two specs that use it (`tests/browser/services_flow.spec.ts`, `tests/browser/settings_flow.spec.ts`).
2. `config/database.ts` (`seeders.paths`), `database/seeders/main/index_seeder.ts`, `database/seeders/user_seeder.ts` (banner removed).
3. `database/data/service_areas_full.geojson`, `database/seeders/service_area_seeder.ts`, `.prettierignore`.
4. `app/services/area_service.ts` (order), `tests/unit/service_area.spec.ts` (`sharedBorderVertex`, the D78 test, point 4).
5. `inertia/components/ui/tabs.tsx`, `inertia/components/organisms/landing/pricing_section.tsx`, `tests/browser/landing_pricing.spec.ts`.
6. Docs: `docs/ARCHITECTURE.md` D76–D83, `docs/DEPENDENCIES.md` §4, `docs/PRD/shared.md` (AREA-4, MAP-1), `docs/PRD/guest.md` (GUEST-1), `docs/PLAN.md`, `docs/SETUP.md`, `CHANGELOG.md`.

## 6. Decisions and deviations

### 6.1 Boundaries (D77)

- The HDX zip re-downloaded from its resource URL (recorded now in `docs/DEPENDENCIES.md` §4): 456,203,094 bytes, SHA-256 `d285a40f…0970`, the same as recorded ([hdx-download.log](hdx-download.log)).
- The processing command recorded in M3 does not run on this download: its fields are `adm2_pcode`, `adm3_name`, … not `admin2Pcod`, … ([mapshaper-recorded-command.log](mapshaper-recorded-command.log)). The same command with the real field names gives a 226,379-byte file, not the committed one ([mapshaper-simplified-reproduction.log](mapshaper-simplified-reproduction.log)). The removed file's exact processing is therefore unknown; its vertices all lie within 0.1 m of the source boundaries, so it was derived from this source with a simplification of about 10 m.
- New file, no simplification ([mapshaper-full.log](mapshaper-full.log)): 2,253,838 bytes, SHA-256 `23fadc8c0068ebbfa884a8aaa2f5fae9d4255094e466cf56ce465e6d18a186a4`, 64 kecamatan, 61,408 vertices, identical on a second run. The same 64 code, name and city values as before.
- Distance between the removed and the new boundaries ([hausdorff.sql](hausdorff.sql), [hausdorff.log](hausdorff.log)), loaded into a throwaway database that was dropped afterwards ([drop-tmp-database.log](drop-tmp-database.log)): Hausdorff distance in EPSG:32748 (WGS 84 / UTM 48S), and a cross-check on geography as the farthest vertex of each boundary from the other boundary, in both directions. Both give a maximum of **10.0 m**; mean 9.8 m.
- The same log shows the server's GEOS 3.14.1 (PostGIS 3.6.4), which M4a needs for `ST_CoverageSimplify`.
- `.prettierignore` gains `database/data`, so the formatter never rewrites a file whose checksum is recorded.

### 6.2 AREA-4 test, point 4: a wrong fixture, not a weaker test

Point 4 used the literal `(-6.938641, 107.669824)` as "the shared edge between Buahbatu and Rancasari". With the new boundaries the test returned Arcamanik. PostGIS ([test-point-4.log](test-point-4.log)):

```
        source        |   name    | contains_point | metres_to_boundary
----------------------+-----------+----------------+--------------------
 committed_simplified | Arcamanik | t              |                0.0
 committed_simplified | Buahbatu  | t              |                0.0
 committed_simplified | Rancasari | t              |                0.0
 full                 | Arcamanik | t              |                0.0
 full                 | Buahbatu  | f              |                0.0
 full                 | Rancasari | f              |                0.0
```

In the simplified data the literal sat on a triple junction of three districts, so the test passed only because PostgreSQL happened to return Buahbatu or Rancasari first; in the full data it lies centimetres inside Arcamanik. The literal is replaced by `sharedBorderVertex('Buahbatu', 'Rancasari')`: a vertex both districts share and no third district touches, computed in SQL. The assertions are unchanged. PostGIS ([test-shared-border-vertices.log](test-shared-border-vertices.log)):

```
== Shared border vertex Buahbatu / Rancasari (full boundaries) and every district containing it
        lat         |        lng         |   name    | is_active
--------------------+--------------------+-----------+-----------
 -6.966462099999944 | 107.66055440000014 | Buahbatu  | t
 -6.966462099999944 | 107.66055440000014 | Rancasari | t
```

The D78 test uses the same function for Cibiru (active) and Cileunyi (inactive). Without the new order in `checkCoverage` it failed in 3 of 3 runs.

### 6.3 Price list (D83)

- `tabs.tsx` from `npx shadcn add tabs --yes` (shadcn 4.23.0, `components.json`). The first attempt timed out reaching the registry ([shadcn-add-tabs.log](shadcn-add-tabs.log)); the retry worked ([shadcn-add-tabs-retry.log](shadcn-add-tabs-retry.log)). Changes from the CLI output ([shadcn-tabs.diff](shadcn-tabs.diff)): `dark:` classes removed (D27), `import * as React` replaced by `import type { ComponentProps }` (D54), canonical class names (`p-0.75`, `data-disabled:`, `after:-bottom-1.25`), Prettier.
- Composition in `pricing_section.tsx`: tab list height `h-11` (44 px tap targets, CONVENTIONS §9.2), tab text `text-base` (16 px) and `text-muted-foreground` for unselected tabs (the generated `text-foreground/60` failed axe `color-contrast`).
- Tests updated where they checked layout that changed: in `tests/browser/services_flow.spec.ts` the filter buttons became tabs (`getByRole('button')` → `getByRole('tab')`) and the "Semua Layanan" assertions were removed with the filter. Nothing else changed in those tests.

### 6.4 Licence attribution (plan for M4a)

CC BY-IGO 3.0 ([legal code](https://creativecommons.org/licenses/by/3.0/igo/legalcode)):

- §3(b): adaptations are allowed "provided that You clearly label, demarcate or otherwise identify that changes were made to the original Work."
- §4(a): "You must include a copy of, or the Uniform Resource Identifier (URI) for, this License with every copy of the Work You Distribute or Publicly Perform."

The district data is an adaptation (64 of 7,069 kecamatan kept, fields renamed). Every M4a map gets an attribution control with `compact: false` showing "© OpenStreetMap contributors" (MAP-2) and the boundary credit naming BPS via OCHA/HDX, linking the licence and saying the data was modified (AREA-1).

### 6.5 Other

- `docs/PLAN.md` and `CHANGELOG.md` were formatted with Prettier while editing them (both were unformatted at 0.3.0). `docs/ARCHITECTURE.md` was not: it was unformatted at 0.3.0 too, and formatting it would re-pad the whole decisions table.
- The scratch directory prefix in the paths printed by mapshaper and psql was shortened to the file name in the copied logs; nothing else in any log was changed.

## 7. Verification

| Check                          | Before (0.3.0)                                           | After                                                                                                              |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm run lint`                 | [baseline-lint.log](baseline-lint.log), exit 0           | [lint.log](lint.log), exit 0                                                                                       |
| `npm run typecheck`            | [baseline-typecheck.log](baseline-typecheck.log), exit 0 | [typecheck.log](typecheck.log), exit 0                                                                             |
| `npm test`                     | [baseline-test.log](baseline-test.log), 210 passed       | [test.log](test.log), 213 passed                                                                                   |
| `git status` around `npm test` | 11 files in `../M3a-fix/` changed                        | [git-status-around-test.log](git-status-around-test.log): identical, `M3a-fix` and `M3b` unchanged, 0 demo banners |

The "before" `git status` was observed in the terminal and is not a saved log.

## 8. Corrections to earlier evidence

- `../M3b/EVIDENCE.md` §1 lists **Cileunyi** among the 10 active kecamatan of Kabupaten Bandung. The correct district, as in PRD AREA-2, the seeder and its test, is **Pameungpeuk**; Cileunyi starts inactive.
- `../M3b/EVIDENCE.md` §1 and `docs/DEPENDENCIES.md` (0.3.0) recorded a mapshaper command with field names the downloaded data does not have and a size of 335,630 bytes; the committed file was 335,125 bytes with the recorded SHA-256. See §6.1.

## 9. Known limitations

- The full boundaries make the seeded GeoJSON 2.25 MB; a full test run still takes 3 minutes.
- The demo banner lists the default owner number even when `ADMIN_PHONE` overrides it in development (unchanged from 0.3.0).
