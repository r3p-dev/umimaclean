# M4a-fix1 evidence: hero area check, opening hours, base map warnings

Date: 2026-11-17. Commit: a398058 (+ uncommitted changes listed in each log header). Fix stop after the owner's review of M4a; no version (a checkpoint `a`).

## Checklist

Excerpts are exact lines from `tmp/evidence/M4a-fix1/logs/` and the tests' own logs in `tmp/evidence/M4a-fix1/screenshots/`; terminal colour codes are left out.

| Criterion (req ID) | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| Issue 1: the dev map had no base map. `.env` names `bandung-raya-20261112.pmtiles`, the file and the fonts and sprites exist; the dev server's process started at 19:52:06 and `.env` was last written at 19:52:07.6, so it most likely read `.env` before the line was there. The owner restarts `npm run dev` | decision recorded | `stat .env`, `ps -eo pid,lstart,cmd` (not saved as a log; the dev server on port 3333 was not contacted) | — |
| D102: in development an empty `MAP_TILES_FILE` or a missing file is logged as a warning and passed to the owner's map; the map draws no base map in either case | PASS | `node scripts/evidence_run.ts M4a-fix1 dev-tiles-warning -- sh -c 'for file in "" "tidak-ada.pmtiles"; do … env MAP_TILES_FILE="$file" node ace repl …; done'` | see below |
| D102: a base map that fails to load in the browser is shown above the map in a development build | NOT RUN | `npm run dev` with `MAP_TILES_FILE` naming a file that is not a PMTiles file (for example `echo x > public/tiles/broken.pmtiles`), sign in as the owner, open `/admin/pengaturan/area`: a yellow note "Peta dasar /tiles/broken.pmtiles gagal dimuat: …" above the map | — |
| GUEST-1, AREA-4, D100: `GET /area/cek?q=` answers by kecamatan name (case, "Kec."/"Kecamatan", spaces and small typos forgiven; "Jakarta" and "Bandung" find nothing); 422 for a missing or short name; 429 after 60 per minute per IP with the wait time; every role may use it; the owner page keeps 64 shapes; the landing loads none | PASS | `node scripts/evidence_run.ts M4a-fix1 area-check-name -- node ace test unit functional --files=tests/functional/area_check.spec.ts --files=tests/unit/district_name.spec.ts` | `Tests  12 passed (12)` / `exit 0` |
| OWN-8, GUEST-1, D101: hours per day and a temporary closure are saved, logged and validated (closing after opening, seven days); the landing's shared props carry the status and the weekly lines; guests, customers and staff are refused; the status rules (open, before opening, at closing time, next open day, closure until a date or open-ended, closed every day, Asia/Jakarta) | PASS | `node scripts/evidence_run.ts M4a-fix1 opening-hours -- node ace test unit functional --files=tests/unit/opening_hours.spec.ts --files=tests/unit/setting.spec.ts --files=tests/functional/opening_hours.spec.ts --files=tests/functional/store_settings.spec.ts` | `Tests  25 passed (25)` / `exit 0` |
| The hero check, the hours form and the landing status in the browser; the landing requests no MapLibre script; axe and no sideways scroll at 360, 390 and 1440 px; the owner's map unchanged | PASS | `node scripts/evidence_run.ts M4a-fix1 browser-hero-and-hours-after-fix -- env EVIDENCE_MILESTONE=M4a-fix1 node ace test browser --files=tests/browser/maps_flow.spec.ts --files=tests/browser/opening_hours_flow.spec.ts` | see below |
| NFR-3: in the production build the landing links only the app's CSS; MapLibre's CSS stays in the lazy map chunk | PASS | `node scripts/evidence_run.ts M4a-fix1 build-landing-css -- sh -c 'node ace build > /dev/null && node -e "… manifest[\"inertia/app.tsx\"] …"'` | see below |
| The code commit passes on its own in a clone of `a398058` (its 41 paths applied; the two docs commits change no code) | PASS | `node scripts/evidence_run.ts M4a-fix1 commit-1-alone -- sh -c 'cd tmp/verify-commits && git status --short \| wc -l && npm run check'` | `41` / `ok   lint (24s)` / `ok   typecheck (9s)` / `ok   test (254s)` / `exit 0` |
| Lint, typecheck and every test | PASS | `node scripts/evidence_run.ts M4a-fix1 check-after-fix -- npm run check` | `ok   lint (25s)` / `ok   typecheck (9s)` / `ok   test (254s)` / `exit 0` |

Excerpt for dev-tiles-warning (`tmp/evidence/M4a-fix1/logs/dev-tiles-warning.log`):

```text
== MAP_TILES_FILE="" (NODE_ENV from .env: development)
> (js) {"level":40,"time":1794922463366,"pid":135442,"hostname":"fedora","name":"umimaclean","msg":"Peta dasar tidak tampil: MAP_TILES_FILE kosong di .env (docs/SETUP.md Step 5)."}
RESULT {"tilesUrl":null,"devWarning":"Peta dasar tidak tampil: MAP_TILES_FILE kosong di .env (docs/SETUP.md Step 5)."}
== MAP_TILES_FILE="tidak-ada.pmtiles" (NODE_ENV from .env: development)
> (js) {"level":40,"time":1794922471411,"pid":135472,"hostname":"fedora","name":"umimaclean","msg":"Peta dasar tidak tampil: public/tiles/tidak-ada.pmtiles tidak ditemukan."}
RESULT {"tilesUrl":null,"devWarning":"Peta dasar tidak tampil: public/tiles/tidak-ada.pmtiles tidak ditemukan."}
exit 0
```

Excerpt for browser-hero-and-hours-after-fix (`tmp/evidence/M4a-fix1/logs/browser-hero-and-hours-after-fix.log`, then the tests' logs):

```text
Tests  3 passed (3)
exit 0
admin-area-peta-360: scrollWidth=360 axe=none
admin-area-peta-390: scrollWidth=390 axe=none
admin-area-peta-1440: scrollWidth=1440 axe=none
hero-cek-360: scrollWidth=360 axe=none
hero-cek-390: scrollWidth=390 axe=none
hero-cek-1440: scrollWidth=1440 axe=none
jam-buka-360: scrollWidth=360 axe=none
jam-buka-390: scrollWidth=390 axe=none
jam-buka-1440: scrollWidth=1440 axe=none
```

Excerpt for build-landing-css (`tmp/evidence/M4a-fix1/logs/build-landing-css.log`):

```text
CSS linked with the app entry: app-D_UMHAnF.css
lazy map chunk: inertia/lib/map/area_map.ts -> area_map-qvkd0SPb.css
MapLibre CSS linked with the entry: false
exit 0
```

## Run & view

```sh
node ace migration:fresh && node ace db:seed   # seeds the default hours: Monday–Saturday 09.00–20.00, Sunday closed
npm run dev
```

- `/`: the hero shows the shop's status ("Buka · tutup pukul 20.00", "Tutup · buka besok pukul 09.00", …) and "Cek area layanan": type "kec. coblong" → "Coblong terjangkau."; "Cileunyi" → "Cileunyi belum terjangkau."; "Jakarta" → "Kecamatan tidak ditemukan. Periksa ejaannya." The footer lists the week.
- As the seeded owner (the seeder prints the account) at `/staf/masuk`, open `/admin/pengaturan/toko`: the "Jam Buka" card, one row per day with a switch and two times, and "Tutup sementara" with a date and a note; save and reload `/`.
- With `MAP_TILES_FILE` empty in `.env` (and `npm run dev` restarted), `/admin/pengaturan/area` shows the warning above the map and the server log has it too.

## Screens

Every file opened (no tiles file in tests, so the owner map has a plain background):

- `/` at 360, 390 and 1440 px after checking "kec. coblong": status line "Tutup · buka besok pukul 09.00" (the run was in the evening), the green note "Coblong terjangkau." under the input (`tmp/evidence/M4a-fix1/screenshots/hero-cek-terjangkau-{360,390,1440}.png`)
- `/` at 360, 390 and 1440 px after checking "Cileunyi": the yellow note "Cileunyi belum terjangkau." (`tmp/evidence/M4a-fix1/screenshots/hero-cek-belum-{360,390,1440}.png`)
- `/` at 360, 390 and 1440 px after the owner saved a temporary closure: status line "Tutup sementara (Renovasi)", empty check input (`tmp/evidence/M4a-fix1/screenshots/hero-jam-buka-{360,390,1440}.png`)
- `/admin/pengaturan/toko`, the "Jam Buka" card at 360, 390 and 1440 px after saving: Monday–Friday 09:00–20:00, Saturday 09:00–15:00, Sunday off ("Tutup"), "Tutup sementara" on with an empty date and the note "Renovasi" (`tmp/evidence/M4a-fix1/screenshots/jam-buka-form-{360,390,1440}.png`)
- `/admin/pengaturan/area` at 360, 390 and 1440 px: the map card with districts on a plain background, credits and legend, then the switches (`tmp/evidence/M4a-fix1/screenshots/admin-area-peta-{360,390,1440}.png`)

## How it works

```text
/ (hero) → "Cek" → fetch GET /area/cek?q=… (Accept: application/json)
  → areaCheckThrottle (60/min/IP, D80) → AreaCheckController.show → checkAreaNameValidator (3–60 letters)
  → AreaService.findAreaByName: normalise ("Kec. Bojong Soang" → "bojongsoang"), edit distance to each of the
    64 names, the closest within 1 (names ≤ 5 letters) or 2 letters → { area: { name, city, isCovered } | null }
  → one line under the input

/admin/pengaturan/toko → "Simpan Jam Buka" → PUT /admin/pengaturan/jam
  → auth, admin ability → StoreSettingsController.updateHours → openingHoursValidator (7 distinct days,
    HH:mm, closing after opening, closure until YYYY-MM-DD or null, note ≤ 100)
  → SettingService.updateOpeningHours → settings.opening_hours + activity log → redirect back

every page → InertiaMiddleware.share → SettingService.getOpeningHours → openingStatus(now, Asia/Jakarta),
  weeklyHours → props.openingHours → hero status line, footer, terms page

/admin/pengaturan/area → ServiceAreasController.index → mapTiles(): tilesUrl only if the file exists;
  in development a warning (log + prop devWarning) when it does not → ServiceAreaMap shows it above the map
```

## Code tour

1. `app/helpers/district_name.ts`, `app/services/area_service.ts` (`findAreaByName`), `app/validators/area_validator.ts`, `app/controllers/area_check_controller.ts`, `start/validator.ts`: the name check.
2. `inertia/components/molecules/area_check_form.tsx`, `inertia/components/organisms/landing/hero.tsx`: the hero input and the status line; `inertia/pages/home.tsx`, `app/controllers/home_controller.ts`: the landing map section and its props removed (`organisms/landing/coverage_section.tsx` deleted); `site_header.tsx`, `site_footer.tsx`: "Area Layanan" links to `#cek-area`.
3. `app/services/setting_service.ts` (`OpeningHoursSetting`, defaults, get and update; `hours` removed from the store setting), `app/validators/setting_validator.ts`, `app/helpers/opening_hours.ts`: the hours.
4. `app/transformers/opening_hours_transformer.ts`, `app/controllers/store_settings_controller.ts`, `start/routes.ts` (`PUT /admin/pengaturan/jam`), `inertia/components/organisms/settings/opening_hours_form.tsx`, `inertia/pages/admin/settings/store.tsx`: the owner's form.
5. `app/middleware/inertia_middleware.ts` (`openingHours` prop), `site_footer.tsx`, `inertia/pages/legal/terms.tsx`, `inertia/lib/store/contact.ts` (unused `hours` removed).
6. `app/helpers/map.ts` (`mapTiles`, `tilesWarning`), `app/controllers/service_areas_controller.ts`, `inertia/lib/map/area_map.ts` (error reporting; the pin and cooperative gestures removed), `inertia/components/organisms/service_area_map.tsx`, `inertia/pages/admin/settings/areas.tsx`: the warnings.
7. `.adonisjs/` regenerated by `node ace codegen`.
8. Tests: `tests/unit/district_name.spec.ts`, `tests/unit/opening_hours.spec.ts`, `tests/unit/setting.spec.ts`, `tests/functional/area_check.spec.ts`, `tests/functional/opening_hours.spec.ts`, `tests/functional/store_settings.spec.ts`, `tests/browser/maps_flow.spec.ts`, `tests/browser/opening_hours_flow.spec.ts`.
9. Docs: `docs/PRD/guest.md` (GUEST-1), `docs/PRD/owner.md` (OWN-8), `docs/ARCHITECTURE.md` (§3, D94/D95/D99 notes, D100–D102), `docs/SETUP.md` Step 5, `docs/PLAN.md`, `CHANGELOG.md`.

## Decisions & deviations

- D100 (hero name check), D101 (opening hours), D102 (base map warnings), with notes on D94, D95 and D99, whose landing parts D100 replaces.
- Tests changed where they checked behaviour that intentionally changed: `tests/unit/setting.spec.ts` and `tests/functional/store_settings.spec.ts` no longer send or read the removed `hours` text (the unit test checks the default hours instead); `tests/functional/area_check.spec.ts` and the landing test of `tests/browser/maps_flow.spec.ts` were rewritten for the name check.
- The switch "Tutup sementara" first carried its text as the Switch's children, which React Aria draws inside the switch track (axe `color-contrast`); it now follows the project's pattern, `aria-label` plus a visible text beside it. The browser test clicks it with `force`, as `settings_flow.spec.ts` does (React Aria's label covers the hidden input).
- The landing test ignores `.css` requests when checking that no map code loads: in development Vite links the CSS of every module the server render can reach (the owner map's lazy chunk); the production manifest links only the app's CSS (`build-landing-css`).
- The first browser run (`browser-hero-and-hours.log`) showed "Toko Tutup …" in the hero and clipped time fields; after the fix the superseded screenshots in `tmp/evidence/M4a-fix1/screenshots/` were deleted and the run repeated (`browser-hero-and-hours-after-fix.log`); `check-after-fix` ran after it.
- While deleting the landing section, a command also ran `git rm --cached` on it, which staged the deletion; it was undone at once with `git restore --staged` (nothing is staged now). AGENTS.md forbids staging; the file is deleted only in the working tree.

## Known limitations / deferred

- The tests' Chromium uses the en-US locale, so time fields show "09:00 AM"; at 360 px a 12-hour value is slightly clipped in its field (Indonesian devices show 24-hour "09.00").
- The development-build note for a base map that fails to load is NOT RUN (above).
- `app/middleware/inertia_middleware.ts` has a pre-existing `catch {}` that swallows a database error when reading the settings; not changed in this stop.
- The production build warns that the lazy MapLibre chunk is larger than 500 kB; it loads only with the owner's map.
