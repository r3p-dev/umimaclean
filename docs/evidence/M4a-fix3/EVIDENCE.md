# M4a-fix3 evidence: design for the landing hero and store settings, pickup dates from opening hours

Date: 2026-11-18. Commit: 306e9a0 (+ uncommitted changes listed in each log header).

## Checklist

| Criterion (req ID) | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| SLOT-1, OWN-8, D104: pickup dates follow the opening hours and the closure (`pickupDates`); no `pickup_days` setting or switches | PASS | `node scripts/evidence_run.ts M4a-fix3 pickup-dates -- node ace test unit functional --files tests/unit/opening_hours.spec.ts --files tests/unit/setting.spec.ts --files tests/functional/store_settings.spec.ts --files tests/functional/opening_hours.spec.ts` | see below |
| SVC-1: a service without item kinds is refused with "Pilih minimal satu jenis barang." (`itemKinds.array.minLength`) | PASS | `node scripts/evidence_run.ts M4a-fix3 item-kinds-message -- node ace test functional --files tests/functional/services.spec.ts` | see below |
| GUEST-1, D105: hero area check card (checks as you type, Enter at once); landing order hero → items → how it works → prices → reviews → FAQ; OWN-8, D105: store settings layout; 360/390/1440, axe clean, no horizontal scroll | PASS | `EVIDENCE_MILESTONE=M4a-fix3 node scripts/evidence_run.ts M4a-fix3 browser-landing-settings -- node ace test browser --files tests/browser/maps_flow.spec.ts --files tests/browser/services_flow.spec.ts --files tests/browser/opening_hours_flow.spec.ts --files tests/browser/settings_flow.spec.ts` | see below |
| The new tests fail on the old code | PASS (expected failures) | the four changed unit/functional spec files copied into a throwaway clone of 306e9a0 (`new-tests-on-old-code`, `new-tests-on-old-code-others`) | see below |
| The development database has no stale `pickup_days` row | PASS | `node scripts/evidence_run.ts M4a-fix3 dev-drop-pickup-days -- sh -c "… \| node ace repl"` (a one-line delete) | see below |
| `npm run check` (lint, typecheck, all tests, no deprecation warnings) | PASS | `node scripts/evidence_run.ts M4a-fix3 check -- npm run check` | see below |
| Commit 1 (store settings) passes `npm run check` on its own | PASS | `node scripts/evidence_run.ts M4a-fix3 commit-1-alone -- sh -c 'cd tmp/verify-commits && npm run check'` | see below |

Excerpt for the pickup dates (`tmp/evidence/M4a-fix3/logs/pickup-dates.log`):

```text
Tests  34 passed (34)
exit 0
```

Excerpt for the item kinds message (`tmp/evidence/M4a-fix3/logs/item-kinds-message.log`):

```text
Tests  12 passed (12)
exit 0
```

Excerpt for the browser run (`tmp/evidence/M4a-fix3/logs/browser-landing-settings.log`, and the screenshot logs in `tmp/evidence/M4a-fix3/screenshots/`):

```text
Tests  8 passed (8)
exit 0
jam-buka-360: navigator.language=en-US saturday=15.00 scrollWidth=360 axe=none
jam-buka-390: navigator.language=en-US saturday=15.00 scrollWidth=390 axe=none
jam-buka-1440: navigator.language=en-US saturday=15.00 scrollWidth=1440 axe=none
hero-cek-360: scrollWidth=360 axe=none
hero-cek-390: scrollWidth=390 axe=none
hero-cek-1440: scrollWidth=1440 axe=none
admin-pengaturan-toko-360: path=/admin/pengaturan/toko scrollWidth=360 axe=none
admin-pengaturan-slot-360: path=/admin/pengaturan/toko (slot section) scrollWidth=360 axe=none
```

Excerpt for the new tests on the old code. `tests/unit/opening_hours.spec.ts` cannot even load there (`tmp/evidence/M4a-fix3/logs/new-tests-on-old-code.log`; that run did not exit after the import error and was stopped):

```text
ℹ SyntaxError: The requested module '#helpers/opening_hours' does not provide an export named 'closurePhase'
```

The other three files (`tmp/evidence/M4a-fix3/logs/new-tests-on-old-code-others.log`):

```text
❯ Services & Prices (SVC-1..5, OWN-7, GUEST-1) / a service without any item kind is refused in Indonesian (SVC-1)
ℹ AssertionError: expected { …(7) } to contain subset { Object (errors) }
❯ Store Settings & Pickup Slots (OWN-8, SLOT-2) / owner updates pickup slots and logs activity (SLOT-2)
ℹ AssertionError: expected 6 to equal 10
❯ Store Settings & Pickup Slots (OWN-8, SLOT-2) / pickup days follow the opening hours: there is no separate setting (SLOT-1, D104)
ℹ AssertionError: expected { …(9) } to not have nested property 'pickupDays'
Tests  24 passed, 3 failed (27)
```

The clone (`tmp/verify-commits`, node_modules linked, a local copy of `.env`) was removed afterwards. The section-order browser test was not run against the old code; the old landing had the price list right after the hero, which the test's heading list rejects.

Excerpt for the dev database (`tmp/evidence/M4a-fix3/logs/dev-drop-pickup-days.log`):

```text
> (js) > (js) deleted [1] left 0
```

Excerpt for the full check (`tmp/evidence/M4a-fix3/logs/check.log`, totals from its copy `check-test.log`):

```text
ok   lint (29s)
ok   typecheck (9s)
ok   test (291s)
Tests  255 passed (255)
```

Excerpt for commit 1 alone (`tmp/evidence/M4a-fix3/logs/commit-1-alone.log`, totals from `commit-1-alone-test.log`; one test fewer, the section-order test, which comes with commit 2):

```text
ok   lint (22s)
ok   typecheck (9s)
ok   test (291s)
Tests  254 passed (254)
```

## Run & view

1. Restart `npm run dev` (no new package, no migration; the dev database row `pickup_days` is already deleted).
2. `/` as a guest: the hero card "Cek dulu, alamat Anda bisa dijemput?". Type `kec. coblong` and pause: "Kec. Coblong, Kota Bandung masuk area layanan. Antar-jemput gratis." Type `Cileunyi` and press Enter: "… belum masuk area layanan. Hubungi kami via WhatsApp …". `Jakarta`: "Kecamatan tidak ditemukan. …". Fewer than 3 letters shows the hint. Scroll: Yang kami cuci → Cara kerjanya → Daftar Layanan & Harga → Kata pelanggan → Pertanyaan umum.
3. `/admin/pengaturan/toko` as the owner: left column Profil toko, Jam operasional (Buka/Tutup, 24-hour fields, **Samakan Selasa–Sabtu dengan Senin**), Slot penjemputan (− / + stepper). Right column (bottom on a phone) Tutup sementara: fill **Dari**, **Sampai**, **Alasan**, then **Jadwalkan tutup**. While it lasts, a yellow banner and the badge "Berlangsung" (a future one says "Terjadwal", a past one "Selesai"); the bin removes it.

## Screens

All opened. Landing and store settings pages, from `opening_hours_flow.spec.ts` (closure from one hour ago to three days ahead at 20.00, Monday copied to Tuesday–Saturday at 08.00, Saturday closing 15.00):

- `/admin/pengaturan/toko` full page at 360 px: Profil toko, Jam operasional (08.00/20.00, Saturday 15.00, Sunday Tutup; the copy button wraps on two lines), Slot penjemputan with steppers, then Tutup sementara with the yellow banner, the window "18 Nov 2026 05.49 – 21 Nov 2026 20.00", badge "Berlangsung", note "Renovasi" (`tmp/evidence/M4a-fix3/screenshots/pengaturan-toko-360.png`)
- same at 390 px, the copy button on one line (`tmp/evidence/M4a-fix3/screenshots/pengaturan-toko-390.png`)
- same at 1440 px: two columns, the closure card top right; the fixed sidebar is shifted down in the full-page capture, as in earlier milestones (`tmp/evidence/M4a-fix3/screenshots/pengaturan-toko-1440.png`)
- the closure card alone at 360/390/1440 px (`tmp/evidence/M4a-fix3/screenshots/tutup-sementara-{360,390,1440}.png`)
- the hours card alone at 360/390/1440 px: two-digit 24-hour times in an `en-US` browser; at 1440 one row per day with "sampai" between the fields (`tmp/evidence/M4a-fix3/screenshots/jam-buka-form-{360,390,1440}.png`)
- `/` full page at 360/390/1440 px: hero with the open-now line "Tutup sementara sampai Sabtu 20.00 (Renovasi)", the area card (hint state), "Sudah punya akun? Masuk", compare slider; then items, how it works, price list, reviews, FAQ; footer "Senin–Jumat 08.00–20.00 / Sabtu 08.00–15.00 / Minggu tutup" (`tmp/evidence/M4a-fix3/screenshots/landing-{360,390,1440}.png`)
- the hero alone at 360/390/1440 px, same state (`tmp/evidence/M4a-fix3/screenshots/hero-jam-buka-{360,390,1440}.png`)

From `maps_flow.spec.ts` (hero check):

- hero at 360/390/1440 px after typing "kec. coblong": focused field with the search icon, green check icon and "Kec. Coblong, Kota Bandung masuk area layanan. Antar-jemput gratis." (`tmp/evidence/M4a-fix3/screenshots/hero-cek-terjangkau-{360,390,1440}.png`)
- hero at 360/390/1440 px after "Cileunyi" + Enter: red cross icon and "Kec. Cileunyi, Kabupaten Bandung belum masuk area layanan. Hubungi kami via WhatsApp untuk info perluasan area." (`tmp/evidence/M4a-fix3/screenshots/hero-cek-belum-{360,390,1440}.png`)

From `services_flow.spec.ts` and `settings_flow.spec.ts` (regression, same pages):

- `/` full page at 360/390/1440 px with the Helm tab of the price list open, placed after "Cara kerjanya" (`tmp/evidence/M4a-fix3/screenshots/landing-harga-helm-{360,390,1440}.png`)
- `/` full page at 360/390/1440 px before 09.00 ("Tutup · buka pukul 09.00"), footer "Senin–Sabtu 09.00–20.00 / Minggu tutup" (`tmp/evidence/M4a-fix3/screenshots/landing-footer-{360,390,1440}.png`)
- `/admin/pengaturan/toko` at 360/390/1440 px with no closure: the "Jadwalkan tutup" form (Dari, Sampai with the placeholder "hh/bb/tttt, --.--", Alasan, "Ditampilkan ke pelanggan."); a leftover area toast at the top (`tmp/evidence/M4a-fix3/screenshots/admin-pengaturan-toko-{360,390,1440}.png`)
- the same with the profile errors "Minimal 2 karakter." and the WhatsApp format error (`tmp/evidence/M4a-fix3/screenshots/admin-pengaturan-toko-error-{360,390,1440}.png`)
- the same after pressing + on the first slot: capacity 7, the + button focused (`tmp/evidence/M4a-fix3/screenshots/admin-pengaturan-slot-{360,390,1440}.png`)
- the owner navigation open over the page at 360/390 px; the desktop sidebar at 1440 px (`tmp/evidence/M4a-fix3/screenshots/admin-nav-mobile-{360,390,1440}.png`)

The same browser run also captured the service and area admin pages, which this stop does not change (`admin-layanan-*`, `admin-menu-layanan-*`, `admin-area-*`, `admin-area-peta-*`); those copies were deleted from `tmp/` unopened.

## How it works

Hero check: typing → `AreaCheckForm` waits 400 ms (or Enter) → `GET /area/cek?q=` (60/min/IP, D80) → `AreaCheckController.show` → `checkAreaNameValidator` → `AreaService.findAreaByName` → `{ area }` → one line in a `role="status"` region with an icon. A newer keystroke aborts the older request (`AbortController`).

Hours: the hours card sends `{ days, closure: <saved closure> }`; the closure card sends `{ days: <saved days>, closure }` to the same `PUT /admin/pengaturan/jam`, so neither saves the other's unsaved edits. `InertiaMiddleware` shares `openingHours.closurePhase` (`upcoming | active | ended | null`, Asia/Jakarta) for the banner and the badge.

Pickup dates (for M5a): `pickupDates(hours, from, to)` walks the days in Asia/Jakarta, keeps open weekdays and drops a day when `closure.startsAt < day closes` and `closure.endsAt > day opens`.

## Code tour

- `app/helpers/opening_hours.ts`: `closurePhase`, `pickupDates`.
- `app/services/setting_service.ts`, `app/validators/setting_validator.ts`, `app/controllers/store_settings_controller.ts`: `pickup_days` removed.
- `start/validator.ts`: `itemKinds.array.minLength`; the pickup days message removed.
- `app/middleware/inertia_middleware.ts`: shares `closurePhase`.
- `inertia/components/atoms/note.tsx`: `plain` variant and `danger` tone.
- `inertia/components/molecules/area_check_form.tsx`: the hero card, check as you type.
- `inertia/components/organisms/landing/hero.tsx`, `inertia/pages/home.tsx`: the card in the hero; section order.
- `inertia/components/molecules/number_stepper.tsx`: React Aria `NumberField` with − / +.
- `inertia/components/organisms/settings/opening_hours_form.tsx`: Jam operasional, copy Monday.
- `inertia/components/organisms/settings/closure_card.tsx`: schedule, show and remove the closure.
- `inertia/lib/store/days.ts`: `formatStamp`.
- `inertia/pages/admin/settings/store.tsx`: the two-column layout, Profil toko, Slot penjemputan.
- Tests: `tests/unit/opening_hours.spec.ts`, `tests/unit/setting.spec.ts`, `tests/functional/store_settings.spec.ts`, `tests/functional/services.spec.ts`, `tests/browser/{maps_flow,services_flow,opening_hours_flow,settings_flow}.spec.ts`.

## Decisions & deviations

- D104 (new) replaces the pickup days part of D103; D105 (new) records the design and the owner's answers on the conflicts (see `docs/ARCHITECTURE.md` §7).
- Kept against the design, as the owner approved: before/after slider, photo credit, open-now line, headline without helmets, "Sudah punya akun? Masuk", unchanged header, unchanged area page, one closure with times, per-card saves, no payment, inactivity or staff-account cards, no JetBrains Mono.
- Per-day pickup slots: deferred to M5a, recorded in the PLAN handoff as an open design request.
- Small copy changes: the not-found line suggests "Sukajadi atau Bojongsoang" (the design's "Lembang" is outside the service areas); the profile description moved under the address.
- The design tints the input border by result; here the coloured line and its icon carry it (one tone map in `Note`).
- No package added: the shadcn registry for this style has no number field, so React Aria's `NumberField` (already installed) is used directly.
- A throwaway debug spec found a 1 px overflow at 360 px (grid columns without `min-w-0`, the copy button not wrapping); fixed, and the debug spec deleted.

## Known limitations / deferred

- `pickupDates` removes a whole day that a closure touches; per-slot checks come with M5a.
- The closure card's "tidak bisa memesan" holds once ordering exists (M5a); the design's "N penjemputan sudah terjadwal" warning needs orders.
- Header links still list "Layanan & Harga" before "Cara Kerja" (header unchanged by the owner's answer 4).
- Carried over: the 360 px credit line on the owner's map (D99).
