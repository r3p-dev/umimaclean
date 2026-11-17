# M4a-fix2 evidence: 24-hour times, closure window, pickup days, loud settings errors

Date: 2026-11-18. Commit: 76f3b79 (+ uncommitted changes listed in each log header).

## Checklist

| Criterion (req ID) | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| OWN-8, GUEST-1, D103: a closure has a start and an end (end after start); the landing shows "Tutup sementara sampai Kamis 20.00 (note)" only in between; the normal hours resume after the end | PASS | `node scripts/evidence_run.ts M4a-fix2 hours-closure-24h -- node ace test unit functional --files tests/unit/opening_hours.spec.ts --files tests/functional/opening_hours.spec.ts` | see below |
| SLOT-1, OWN-8, D103: pickup days are a setting (default Monday–Saturday), saved with the slots, at least one, logged | PASS | `node scripts/evidence_run.ts M4a-fix2 pickup-days -- node ace test unit functional --files tests/unit/setting.spec.ts --files tests/functional/store_settings.spec.ts` | see below |
| A database error in the shared page props is logged and fails the page in dev/test (old `catch {}` removed) | PASS | `node scripts/evidence_run.ts M4a-fix2 middleware-fails-loudly -- node ace test functional --files tests/functional/inertia_middleware.spec.ts` | see below |
| OWN-8, D103: 24-hour time in the owner's fields (in an `en-US` browser), hero and footer; no clipping at 360 px; pickup-day switches; axe clean | PASS | `EVIDENCE_MILESTONE=M4a-fix2 node scripts/evidence_run.ts M4a-fix2 browser-hours-pickup-after-fix -- node ace test browser --files tests/browser/opening_hours_flow.spec.ts --files tests/browser/settings_flow.spec.ts` | see below |
| The new tests fail on the old code | PASS (expected failures) | the five new or changed unit/functional spec files copied into a throwaway clone of 76f3b79, run as `new-tests-on-old-code` | see below |
| The development database uses the new setting shape | PASS | `node scripts/evidence_run.ts M4a-fix2 dev-db-seed -- node ace db:seed` | see below |
| `npm run check` (lint, typecheck, all tests, no deprecation warnings) | PASS | `node scripts/evidence_run.ts M4a-fix2 check -- npm run check` | see below |
| Commit 1 (middleware fix) passes `npm run check` on its own | PASS | `node scripts/evidence_run.ts M4a-fix2 commit-1-alone -- sh -c 'cd tmp/verify-commits && npm run check'` | see below |

Excerpt for the closure window (`tmp/evidence/M4a-fix2/logs/hours-closure-24h.log`):

```text
Tests  15 passed (15)
exit 0
```

Excerpt for the pickup days (`tmp/evidence/M4a-fix2/logs/pickup-days.log`):

```text
Tests  18 passed (18)
exit 0
```

Excerpt for the middleware (`tmp/evidence/M4a-fix2/logs/middleware-fails-loudly.log`; the error log line is the one the middleware writes before rethrowing):

```text
"msg":"Store settings could not be read for the shared page props"
"status":500}
Tests  1 passed (1)
exit 0
```

Excerpt for the browser run (`tmp/evidence/M4a-fix2/logs/browser-hours-pickup-after-fix.log` and `tmp/evidence/M4a-fix2/screenshots/jam-buka-screenshots.log`):

```text
Tests  2 passed (2)
exit 0
jam-buka-360: navigator.language=en-US saturday=15.00 scrollWidth=360 axe=none
jam-buka-390: navigator.language=en-US saturday=15.00 scrollWidth=390 axe=none
jam-buka-1440: navigator.language=en-US saturday=15.00 scrollWidth=1440 axe=none
```

Excerpt for the new tests on the old code (`tmp/evidence/M4a-fix2/logs/new-tests-on-old-code.log`; every failure is a test of changed behaviour):

```text
❯ Opening hours (OWN-8, GUEST-1) / a temporary closure shows only between its start and its end, with its note (D103)
❯ Opening hours (OWN-8, GUEST-1) / the normal schedule resumes by itself once the closure ends (D103)
❯ Opening hours (OWN-8, GUEST-1) / before a closure starts, the hours say when the shop really closes and opens (D103)
❯ Store Settings & Pickup Slots (OWN-8, SLOT-2) / reads default store settings and pickup slots successfully
❯ Store Settings & Pickup Slots (OWN-8, SLOT-2) / updates pickup days in weekday order and logs them (SLOT-1, D103)
❯ Store Settings & Pickup Slots (OWN-8, SLOT-2) / rejects no pickup day, a repeated day or a day outside 1..7 (SLOT-1)
❯ Shared page props / a database error while reading the store settings fails the page in tests instead of being hidden
❯ Opening hours PUT /admin/pengaturan/jam (OWN-8, GUEST-1) / the owner saves hours per day, logged, and the landing shows them (OWN-8)
❯ Opening hours PUT /admin/pengaturan/jam (OWN-8, GUEST-1) / a temporary closure shows on the landing only while it lasts, with its end and note (GUEST-1, D103)
❯ Opening hours PUT /admin/pengaturan/jam (OWN-8, GUEST-1) / a closure needs a start and an end, the end after the start (OWN-8, D103)
❯ Store Settings & Pickup Slots (OWN-8, SLOT-2) / owner updates pickup slots and logs activity (SLOT-2)
❯ Store Settings & Pickup Slots (OWN-8, SLOT-2) / the owner page gets the pickup days, Monday to Saturday by default (SLOT-1, D103)
❯ Store Settings & Pickup Slots (OWN-8, SLOT-2) / saving without any pickup day is refused with its message (SLOT-1)
Tests  21 passed, 13 failed (34)
```

The old-code run used a `git clone` of 76f3b79 in `tmp/verify-commits` (node_modules linked, a local copy of `.env`), removed afterwards. A first attempt without `.env` stopped at boot (`Missing environment variable "LOG_LEVEL"`); its log is kept as `new-tests-on-old-code-no-env.log`. The old browser test was not run against the old code: the new one locates React Aria field groups that the native time inputs never had.

Excerpt for the dev seed (`tmp/evidence/M4a-fix2/logs/dev-db-seed.log`):

```text
# command: node ace db:seed
❯ completed database/seeders/main/index_seeder
exit 0
```

A REPL read afterwards returned `["pickup_days",[1,2,3,4,5,6]]` and `"closure":{"note":null,"endsAt":null,"isClosed":false,"startsAt":null}` from the development database. The seeder resets every setting to its default (store details included).

Excerpt for the full check (`tmp/evidence/M4a-fix2/logs/check.log`, totals from its copy `check-test.log`):

```text
ok   lint (24s)
ok   typecheck (9s)
ok   test (275s)
Tests  252 passed (252)
```

Excerpt for commit 1 alone (`tmp/evidence/M4a-fix2/logs/commit-1-alone.log`, totals from `commit-1-alone-test.log`):

```text
ok   lint (22s)
ok   typecheck (8s)
ok   test (251s)
Tests  244 passed (244)
```

## Run & view

1. `npm install` (adds `@internationalized/date` to the direct dependencies; already present in `node_modules`), then `node ace db:seed` once so the `opening_hours` row has the new closure shape and `pickup_days` exists.
2. Restart `npm run dev` and sign in as the owner (credentials printed by the seeder).
3. `/admin/pengaturan/toko`, card **Jam Buka**: every time reads `09.00`/`20.00` even in an English browser. Click the hour, type `15`, then `00`. Switch on **Tutup sementara**, fill **Tutup mulai** and **Buka lagi** (day, month, year, hour, minute), optionally a note, then **Simpan Jam Buka**. An end before or equal to the start says "Waktu selesai harus setelah waktu mulai."
4. `/`: while the closure lasts, the hero shows "Tutup sementara sampai <hari> 20.00 (<catatan>)"; before it starts and after it ends, the usual "Buka · tutup pukul …" or "Tutup · buka …".
5. Card **Slot Penjemputan**: switches **Hari penjemputan** per weekday (Monday–Saturday on by default), saved with **Simpan Jadwal Slot**. Turning all off says "Pilih minimal satu hari penjemputan."

## Screens

All opened. From `opening_hours_flow.spec.ts` (browser in `en-US`, closure from one hour ago to three days ahead at 20.00, Saturday closing at 15.00, Sunday pickups on):

- `/admin/pengaturan/toko` hours card at 360 px: seven rows with two-digit 24-hour times (`09.00 – 20.00`, Saturday `09.00 – 15.00`), Sunday "Tutup", closure on with "18/11/2026, 04.04" and "21/11/2026, 20.00", note "Renovasi"; nothing clipped (`tmp/evidence/M4a-fix2/screenshots/jam-buka-form-360.png`)
- same at 390 px (`tmp/evidence/M4a-fix2/screenshots/jam-buka-form-390.png`)
- same at 1440 px: the day rows on one line each; the two closure fields side by side (`tmp/evidence/M4a-fix2/screenshots/jam-buka-form-1440.png`)
- `/` hero at 360 px: "Tutup sementara sampai Sabtu 20.00 (Renovasi)" wrapping over two lines under the badge (`tmp/evidence/M4a-fix2/screenshots/hero-jam-buka-360.png`)
- same at 390 px, on one line (`tmp/evidence/M4a-fix2/screenshots/hero-jam-buka-390.png`)
- same at 1440 px, the line above the headline, photo on the right (`tmp/evidence/M4a-fix2/screenshots/hero-jam-buka-1440.png`)
- slot card at 360 px: "Hari penjemputan" with seven switches in two columns, all on (Sunday switched on by the test), then the three slots (`tmp/evidence/M4a-fix2/screenshots/hari-jemput-360.png`)
- same at 390 px (`tmp/evidence/M4a-fix2/screenshots/hari-jemput-390.png`)
- same at 1440 px, switches in four columns (`tmp/evidence/M4a-fix2/screenshots/hari-jemput-1440.png`)

From the regression run of `settings_flow.spec.ts` (unchanged test; pages now show the new fields):

- `/admin/pengaturan/toko` at 360/390/1440 px: the three cards; hours at `09.00`/`20.00`, closure off, pickup days Monday–Saturday on and Sunday off; a leftover area toast at the top at 360/390/1440 (`tmp/evidence/M4a-fix2/screenshots/admin-pengaturan-toko-{360,390,1440}.png`)
- the same page with errors at 360/390/1440 px: "Minimal 2 karakter." and the WhatsApp format error; hours and slot cards unchanged (`tmp/evidence/M4a-fix2/screenshots/admin-pengaturan-toko-error-{360,390,1440}.png`)
- the slot section at 360/390/1440 px with slot 1's capacity at 10 in focus; at 1440 the full-page capture shows the fixed sidebar shifted down, as in earlier milestones (`tmp/evidence/M4a-fix2/screenshots/admin-pengaturan-slot-{360,390,1440}.png`)
- the owner mobile navigation at 360/390 px open over the settings page; at 1440 px the desktop sidebar (`tmp/evidence/M4a-fix2/screenshots/admin-nav-mobile-{360,390,1440}.png`)
- `/admin/pengaturan/area` at 360/390/1440 px: the district map and the 64 switches, 43 active (`tmp/evidence/M4a-fix2/screenshots/admin-area-{360,390,1440}.png`)
- the same after switching Coblong off, toast "Area "Coblong" (Kota Bandung) berhasil dinonaktifkan.", 42 active (`tmp/evidence/M4a-fix2/screenshots/admin-area-toggle-{360,390,1440}.png`)
- `/` full page at 360/390/1440 px: hero status "Tutup · buka pukul 09.00" (the run was before 09.00 Jakarta time), footer "Senin–Sabtu 09.00–20.00 / Minggu tutup" (`tmp/evidence/M4a-fix2/screenshots/landing-footer-{360,390,1440}.png`)

A first browser run (`browser-hours-pickup.log`, PASS) showed one-digit hours ("9.00", "4.02"): `id-ID` formats hours without a leading zero. Its screenshots were deleted from `tmp/` unpublished, `shouldForceLeadingZeros` was added with a test assert on Monday's `09.00`, and the run was repeated as `browser-hours-pickup-after-fix`.

## How it works

Hours: `PUT /admin/pengaturan/jam` → auth + owner middleware → `StoreSettingsController.updateHours` → `openingHoursValidator` (each day closes after it opens; `closureWindow`: both stamps when on, end after start) → `SettingService.updateOpeningHours` → `settings.opening_hours` + an ActivityLog line → redirect back. On every page `InertiaMiddleware.share` reads it and shares `openingStatus(hours, now)`:

1. If `startsAt ≤ now < endsAt` (local Jakarta stamps compared as strings): "Tutup sementara sampai {pukul HH.mm | besok HH.mm | Hari HH.mm | Hari, d Bulan HH.mm}" with the note.
2. Otherwise it walks forward day by day (past the end of a coming closure): an opening moment inside the closure moves to its end; if `now` is inside today's window it is "Buka · tutup pukul …" (the closure's start if that comes first), else "Tutup · buka …".

Pickup days: `PUT /admin/pengaturan/slot` with `{ slots, pickupDays }` → `pickupSlotsSettingValidator` → `updatePickupSlots` and `updatePickupDays` (sorted, logged as "Memperbarui hari penjemputan (Senin, …)") → `settings.pickup_days`. Nothing reads it yet besides the page; SLOT-1 reads `getPickupDays()` from M5a.

Shared props errors: `getStoreSettings`/`getOpeningHours` throw → `logger.error` → rethrown unless `app.inProduction` → the exception handler (status pages only in production) answers 500; in production the page renders with the defaults and the error is in the log.

## Code tour

- `app/helpers/opening_hours.ts`: `isInClosure`, `when` (the time phrase), `openingStatus` with the closure window; `DAY_NAMES` exported.
- `app/validators/setting_validator.ts`: `localDateTime`, `closureWindow`, `pickupDaysSchema`, `pickupDaysArrayValidator`.
- `start/validator.ts`: `pickupDays.array.minLength` message.
- `app/services/setting_service.ts`: closure type, `DEFAULT_PICKUP_DAYS`, `getPickupDays`, `updatePickupDays`, closure log text.
- `app/transformers/opening_hours_transformer.ts`: `startsAt`, `endsAt`.
- `app/controllers/store_settings_controller.ts`: `pickupDays` prop and save.
- `app/middleware/inertia_middleware.ts`: log and rethrow outside production.
- `inertia/components/molecules/time_fields.tsx`: `TimeInput`, `DateTimeInput` (React Aria, `id-ID`, 24 h, leading zeros).
- `inertia/lib/store/days.ts`: the Indonesian day names for the frontend.
- `inertia/components/organisms/settings/opening_hours_form.tsx`: the new fields and errors.
- `inertia/pages/admin/settings/store.tsx`: the pickup-day switches.
- Tests: `tests/unit/opening_hours.spec.ts`, `tests/unit/setting.spec.ts`, `tests/functional/opening_hours.spec.ts`, `tests/functional/store_settings.spec.ts`, `tests/functional/inertia_middleware.spec.ts` (new), `tests/browser/opening_hours_flow.spec.ts`.

## Decisions & deviations

- D103 (new): 24-hour React Aria fields, the closure window, the pickup days setting. D101 gets a note that its open-ended closure is replaced.
- The shadcn registry for `aria-vega` has no `date-field`, `time-field` or `date-picker` (`npx shadcn view date-field`: "was not found"), so React Aria's fields are used directly, as the owner allowed; `@internationalized/date` is recorded in `docs/DEPENDENCIES.md`.
- The owner's "Tuesday/Thursday" remark did not match the code or the PRD (SLOT-1 said "never Sunday"); the owner chose Monday–Saturday as the default.
- A closure that is switched on must have both a start and an end, so "until further notice" is no longer possible; the owner sets a far end date instead.
- `docs/ARCHITECTURE.md` §3 still mentioned the removed draggable pin and had a double comma; both corrected.
- VineJS names the array rule `array.minLength`, so the message key is `pickupDays.array.minLength`.

## Known limitations / deferred

- `itemKinds.minLength` in `start/validator.ts` never applies (same `array.minLength` naming), so a service saved without item kinds shows VineJS's English message; not changed in this stop (open question to the owner).
- Pickup days are stored and edited only; ordering (SLOT-1) uses them from M5a.
- The closure stamps are not checked against real calendar days (`2026-02-31` passes the pattern); the date field never produces one.
- During a closure that ends mid-day, the hero says "Tutup sementara sampai pukul 12.00" even when the normal hours would also be closed then; the line after the end shows the real hours.
- Carried over: the 360 px credit line on the owner's map (D99).
