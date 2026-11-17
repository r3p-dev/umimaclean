# 0.3.2 evidence: review fixes and the OSM import measurements for M4a

Date: 2026-11-17. Patch release after the 0.3.1 review (AGENTS.md §6), and the measurements behind the M4a import plan. Nothing of the import is built yet.

## 1. Summary

- **"Mulai dari" line (GUEST-1, STAFF-9).** A price list tab that holds at least one "mulai dari" price says under its list: "Harga bertanda “mulai dari” dipastikan setelah barang diperiksa." Staff may raise such a price at inspection (STAFF-9), so a customer needs to know. GUEST-1 had no line asking for it; it now does (`docs/PRD/guest.md`).
- **Demo banner (D79).** The banner printed after seeding in development is built from the same account list the user seeder creates (`demoAccounts()` in `database/seeders/user_seeder.ts`), so the owner number is the one actually created, including one set with `ADMIN_PHONE`.
- **Every 0.3.1 commit checked on its own** in a throwaway clone (§4).
- **OSM import measured** in a throwaway database (§5).

## 2. How to run and see it

```sh
node ace db:seed      # development: the banner lists the owner number from ADMIN_PHONE, or the default
npm run dev           # http://localhost:3333/#harga, tab Sepatu: the line under the list; tab Helm: no line
```

## 3. Screenshots

Section `#harga`, Chromium at 360 × 780, 390 × 844 and 1440 × 900, axe (WCAG 2.1 A and AA, scoped to the section) and the horizontal scroll check, written through `EVIDENCE_DIR=docs/evidence/M3-0.3.2/harga`:

| State                                  | Files                                              | Axe | Scroll |
| -------------------------------------- | -------------------------------------------------- | --- | ------ |
| Tab Sepatu, with the "mulai dari" line | [harga/harga-mulai-dari-sepatu-\*.png](harga/)     | 0   | none   |
| Tab Helm, store-only note, no line     | [harga/harga-tanpa-mulai-dari-helm-\*.png](harga/) | 0   | none   |

Logs written by the tests: [harga/harga-mulai-dari-sepatu-screenshots.log](harga/harga-mulai-dari-sepatu-screenshots.log), [harga/harga-tanpa-mulai-dari-helm-screenshots.log](harga/harga-tanpa-mulai-dari-helm-screenshots.log).

## 4. Banner test and per-commit check

- [banner-test.log](banner-test.log): `tests/unit/demo_accounts.spec.ts`, 2 passed.
- [banner-test-old-behaviour.log](banner-test-old-behaviour.log): the same tests with `demoAccountsBanner()` temporarily returning the 0.3.1 banner text: both fail. The first fails for the reason the fix is about (the `ADMIN_PHONE` number is missing); the second also fails because the old text wrote numbers as `0813…` and the banner now uses `formatPhone` (`+62 813 …`).
- [commits-v0.3.1/](commits-v0.3.1/): every commit in `v0.3.0..v0.3.1`, in order, in a clone under `tmp/verify-commits` with only `.env` copied; `npm ci` before the first and the release commit (the only ones whose package files differ); lint, typecheck and `npm test` each. Commits 2–9 pass. Commit 1 (`c333f4e`) failed its first run with a database error whose message fell outside the 25 log lines kept; run again in the same clone without any change it passes 210 of 210 ([01-c333f4e-rerun.log](commits-v0.3.1/01-c333f4e-rerun.log); its header and `exit` line were added from the command's exit status). The most likely cause is the test database left behind by an earlier run of the same check that a machine restart interrupted; the first commit's run ended with the usual rollback, after which every later commit passed. Not a failure of the commit, so nothing is changed at HEAD.

- [commits-suggested/](commits-suggested/): the four suggested commits of this release, checked the same way: the clone reset to `v0.3.1`, then each commit's paths copied from the working tree in order (the release step runs `npm version 0.3.2 --no-git-tag-version` and `npm ci`), with lint, typecheck and `npm test` after each: 213, 215, 215 and 215 passed. The clone's final `git status` ([5-clone-status.log](commits-suggested/5-clone-status.log)) also lists 11 screenshots in `docs/evidence/M3a-fix/`: they were written at 10:37–10:38 by the rerun of `c333f4e` (the only commit whose tests still wrote there), before the first suggested-commit run, and the checkout kept them as local changes ([6-clone-leftover-screenshots.log](commits-suggested/6-clone-leftover-screenshots.log)). The clone was deleted afterwards.

## 5. OSM import measurements

Script: [measure_osm_import.sh](measure_osm_import.sh) (with [geojson_to_sql.py](geojson_to_sql.py)), output [osm-measure.log](osm-measure.log) and [osmium-memory-limits.log](osmium-memory-limits.log). Development machine: AMD Ryzen 5 4600H, 12 threads, 14 GB RAM; tool containers capped with `--cpus=4` (a CPU quota; the machine does not delegate `cpuset` to rootless containers, so the tools were also told to use 4 threads). Input: the Geofabrik Java extract of 2026-11-12 already in `storage/osm/` (899,525,941 bytes, MD5 checked). Database: `umimaclean_osm_measure` on the shared server, dropped at the end.

| Step                                                 | Wall time | Peak memory                                                                      | Output                                               |
| ---------------------------------------------------- | --------- | -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Clip polygon (union of the 64 full kecamatan + 5 km) | —         | —                                                                                | 21,155 bytes, 3,290 km²                              |
| `osmium extract --bbox` (D6, 5,888 km²)              | 20.8 s    | 4.99 GB (`memory.peak`, includes page cache)                                     | 76,269,019 bytes                                     |
| `osmium extract --polygon`                           | 18.4 s    | 4.05 GB; killed at 512 MB, 1 GB, 2 GB, 3 GB; passes at 4 GB with the same output | 57,427,138 bytes                                     |
| `osmium extract --polygon --strategy=simple`         | —         | killed at 512 MB and 1 GB                                                        | —                                                    |
| `osm2pgsql` into `osm_import`                        | 8.9 s     | 232 MB; passes at 512 MB (201 MB)                                                | 10 MB of tables                                      |
| `maps/osm_build.sql` (one transaction)               | 2.2 s     | PostgreSQL container 82 MB → 96 MB (sampled each second)                         | `osm`: 25 MB, 12,240 roads, 12,533 places, 302 areas |
| `pg_dump -n osm -Fc`                                 | 0.7 s     | —                                                                                | 4,975,098 bytes                                      |

The box of D6 contains every service area (`bbox_contains_all_areas = t`). The polygon file is [clip_polygon.geojson](clip_polygon.geojson) (SHA-256 `c2d409c8a9e880cafc2069eb84b38e770bf69f8ca73cd9c7b5b278c3c59bb193`). Times on the VPS were not measured.

## 6. Known limitations

- The banner prints numbers as `+62 …` (`formatPhone`) instead of `0…`; sign-in accepts both.
- The scratch directory prefix in the paths of the copied measurement logs was shortened to the file name; nothing else was changed.
