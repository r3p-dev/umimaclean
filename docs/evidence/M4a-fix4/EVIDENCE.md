# M4a-fix4 evidence: pickup slots per weekday, settings side navigation, header order

Date: 2026-11-18. Commit: b68a6be (+ uncommitted changes listed in each log header).

## Checklist

| Criterion (req ID) | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| SLOT-2, D106: a `pickup_slots` table; the old setting becomes rows on every open day; defaults seeded on every open day | PASS | `node scripts/evidence_run.ts M4a-fix4 dev-migrate -- sh -c "node ace migration:run && … \| node ace repl"` | see below |
| SLOT-2, OWN-8, D104, D106: save a day (ids kept), end after start, no overlap (touching allowed), closed day refused, copy to the other open days; `pickupDates` needs an active slot; owner only | PASS | `node scripts/evidence_run.ts M4a-fix4 slots-backend -- node ace test unit functional --files tests/unit/pickup_slot_service.spec.ts --files tests/unit/opening_hours.spec.ts --files tests/functional/pickup_slots.spec.ts --files tests/functional/store_settings.spec.ts` | see below |
| OWN-8, D106: the slots page (day buttons with counts, closed Sunday, switch, range, stepper, delete, Mulai/Selesai, Tambah, Salin, Simpan), the settings side navigation (column / disclosure), one "Pengaturan" in the owner sidebar, header links in section order; 360/390/1440, axe clean, no horizontal scroll | PASS | `EVIDENCE_MILESTONE=M4a-fix4 node scripts/evidence_run.ts M4a-fix4 browser-slots-nav -- node ace test browser --files tests/browser/pickup_slots_flow.spec.ts --files tests/browser/settings_flow.spec.ts --files tests/browser/services_flow.spec.ts`, then `browser-slots-after-fix` and `browser-settings-after-fix` (see Screens) | see below |
| The new tests fail on the old code | PASS (expected failures) | the changed functional specs copied into a throwaway clone of b68a6be (`new-tests-on-old-code`, `new-tests-on-old-code-store`) | see below |
| `npm run check` (lint, typecheck, all tests, no deprecation warnings) | PASS | `node scripts/evidence_run.ts M4a-fix4 check -- npm run check` | see below |
| Commit 1 (slots and settings navigation) passes `npm run check` on its own | PASS | `node scripts/evidence_run.ts M4a-fix4 commit-1-alone -- sh -c 'cd tmp/verify-commits && npm run check'` | see below |

Excerpt for the migration on the development database (`tmp/evidence/M4a-fix4/logs/dev-migrate.log`):

```text
Migrated in 91 ms
> (js) > (js) slots per weekday [{"weekday":1,"n":"3"},{"weekday":2,"n":"3"},{"weekday":3,"n":"3"},{"weekday":4,"n":"3"},{"weekday":5,"n":"3"},{"weekday":6,"n":"3"}] old setting rows 0
```

Excerpt for the backend (`tmp/evidence/M4a-fix4/logs/slots-backend.log`):

```text
Tests  33 passed (33)
exit 0
```

Excerpt for the browser runs (`tmp/evidence/M4a-fix4/logs/browser-slots-nav.log`, `browser-slots-after-fix.log`, `browser-settings-after-fix.log`, and the screenshot logs):

```text
Tests  6 passed (6)
Tests  1 passed (1)
Tests  2 passed (2)
pengaturan-slot-360: day=Selasa scrollWidth=360 axe=none
pengaturan-slot-390: day=Rabu scrollWidth=390 axe=none
pengaturan-slot-1440: day=Kamis scrollWidth=1440 axe=none
admin-area-360: path=/admin/pengaturan/area scrollWidth=360 axe=none
admin-pengaturan-toko-360: path=/admin/pengaturan/toko scrollWidth=360 axe=none
admin-nav-mobile-360: path=/admin/pengaturan/toko (navigation menu) scrollWidth=360 axe=none
```

Excerpt for the new tests on the old code. `tests/functional/pickup_slots.spec.ts` cannot load there (`tmp/evidence/M4a-fix4/logs/new-tests-on-old-code.log`; the run did not exit after the import error and was stopped):

```text
ℹ Error: Cannot find module '/home/r3p/Projects/someshit/umimaclean/tmp/verify-commits/app/models/pickup_slot.js' imported from /home/r3p/Projects/someshit/umimaclean/tmp/verify-commits/tests/function
```

`tests/functional/store_settings.spec.ts` alone (`tmp/evidence/M4a-fix4/logs/new-tests-on-old-code-store.log`):

```text
❯ Store Settings & Pickup Slots (OWN-8, SLOT-2) / owner opens /admin/pengaturan/toko and receives the opening hours; slots have their own page (D106)
ℹ AssertionError: expected { …(8) } to not have nested property 'slots'
Tests  7 passed, 1 failed (8)
```

The clone (`tmp/verify-commits`, node_modules linked, a local copy of `.env`) was removed afterwards. The browser tests were not run against the old code; the slots page and the side navigation do not exist there.

Excerpt for the full check (`tmp/evidence/M4a-fix4/logs/check.log`, totals from its copy `check-test.log`):

```text
ok   lint (27s)
ok   typecheck (9s)
ok   test (318s)
Tests  264 passed (264)
```

Excerpt for commit 1 alone (`tmp/evidence/M4a-fix4/logs/commit-1-alone.log`, totals from `commit-1-alone-test.log`; the header order assertion comes with commit 2 inside an existing test, so the count is the same):

```text
ok   lint (24s)
ok   typecheck (9s)
ok   test (318s)
Tests  264 passed (264)
```

## Run & view

1. `node ace migration:run` (already done on the development database: the old setting became 3 slots on Monday–Saturday), then restart `npm run dev`. A fresh database gets the same from `node ace db:seed`.
2. Owner sidebar: Ringkasan, Layanan & Harga, **Pengaturan**. In Pengaturan, the side navigation (on a phone the "Bagian: …" disclosure): Toko, Slot penjemputan, Area layanan. Layanan & Harga has no side navigation.
3. `/admin/pengaturan/slot`: pick a day (Minggu says "Tutup" and cannot be picked). Switch a slot off, change its capacity with − / +, delete one, fill **Mulai** and **Selesai** then **Tambah slot <hari>**, then **Simpan slot <hari>**. Adding 11.00–13.00 next to 09.00–12.00 and saving says "Slot 11.00–13.00 bertabrakan dengan 09.00–12.00." **Salin slot <hari> ke hari buka lain** (enabled when nothing is unsaved) replaces the other open days' slots.
4. `/`: the header and footer list Cara Kerja, Layanan & Harga, Area Layanan, Ulasan, Pertanyaan Umum.

## Screens

All opened. From `pickup_slots_flow.spec.ts` (each width edits its own day; final run `browser-slots-after-fix`, then the nav ones again in `browser-settings-after-fix`):

- `/admin/pengaturan/slot` at 360/390 px after saving: disclosure "Bagian: Slot penjemputan" (closed), card with day buttons showing the count only ("3"), Sunday "Tutup" greyed, the chosen day's 09.00–12.00, 12.00–15.00, 18.00–20.00 with switches, steppers and bins, empty Mulai/Selesai, "Tambah slot …" disabled, "Salin …", "Simpan …" disabled (`tmp/evidence/M4a-fix4/screenshots/pengaturan-slot-{360,390}.png`)
- the same at 1440 px: side navigation with "Slot penjemputan" highlighted, buttons "Kam 3 slot" selected, the sidebar's single "Pengaturan" entry (`tmp/evidence/M4a-fix4/screenshots/pengaturan-slot-1440.png`)
- after adding 11.00–13.00 and saving, at 360/390/1440 px: four rows, the red line "Slot 11.00–13.00 bertabrakan dengan 09.00–12.00.", "Salin" disabled with "Simpan dulu sebelum menyalin." (`tmp/evidence/M4a-fix4/screenshots/pengaturan-slot-tabrakan-{360,390,1440}.png`)
- after copying Thursday, at 1440 px: Monday selected with 09.00–12.00, 12.00–15.00, 18.00–20.00 (`tmp/evidence/M4a-fix4/screenshots/pengaturan-slot-salin-1440.png`)
- the settings disclosure open at 360/390 px: Toko, Slot penjemputan (highlighted), Area layanan, chevron up (`tmp/evidence/M4a-fix4/screenshots/pengaturan-nav-{360,390}.png`)

From `settings_flow.spec.ts` (`browser-settings-after-fix`):

- `/admin/pengaturan/toko` at 360/390 px: disclosure "Bagian: Toko", Profil toko, Jam operasional, Tutup sementara (Dari, Sampai, Alasan); a leftover area toast at the top (`tmp/evidence/M4a-fix4/screenshots/admin-pengaturan-toko-{360,390}.png`)
- the same at 1440 px: side navigation, two columns, the closure fields one per row in the narrow right column; the area toast (`tmp/evidence/M4a-fix4/screenshots/admin-pengaturan-toko-1440.png`)
- `/admin/pengaturan/area` at 360/390 px: disclosure "Bagian: Area layanan", the map and the switches; at 1440 px the side navigation with "Area layanan" highlighted (`tmp/evidence/M4a-fix4/screenshots/admin-area-{360,390,1440}.png`)
- the owner menu open at 360/390 px: Ringkasan, Layanan & Harga, Pengaturan (highlighted), Profil, Keluar; at 1440 px the desktop sidebar on the store page (`tmp/evidence/M4a-fix4/screenshots/admin-nav-mobile-{360,390,1440}.png`)
- `/` full page at 360/390/1440 px: the 1440 header reads Cara Kerja · Layanan & Harga · Area Layanan · Ulasan · Pertanyaan Umum; the footer "Layanan" column in the same order (`tmp/evidence/M4a-fix4/screenshots/landing-footer-{360,390,1440}.png`)

From `services_flow.spec.ts` (`browser-slots-nav`):

- `/admin/layanan` with the owner menu at 360/390 px and the sidebar at 1440 px: "Layanan & Harga" highlighted as its own entry, no settings side navigation (`tmp/evidence/M4a-fix4/screenshots/admin-menu-layanan-{360,390,1440}.png`)

Deleted from `tmp/` unopened: the service admin screenshots of `services_flow` (`admin-layanan-*`) and, from `settings_flow`, `admin-area-toggle-*`, `admin-pengaturan-slot-*` (a duplicate of the slots page) and `admin-pengaturan-toko-error-*`, `landing-harga-helm-*`. Superseded and deleted after opening: the first `pengaturan-slot*` set (the count "3 slot" wrapped on two lines at 360/390 px), and the first nav and store screenshots (the chevron caught mid-rotation; the closure date fields clipped at 1440 px); both fixed, then retaken.

## How it works

Save a day: "Simpan slot Kamis" → `PUT /admin/pengaturan/slot/4` → auth + owner → `PickupSlotsController.update` → `pickupDaySlotsValidator` with `meta.openDays` from the opening hours (open day, each slot ends after it starts, no overlap) → `PickupSlotService.replaceDay` in one transaction (delete missing ids, update listed ones, create new ones, ActivityLog) → redirect back → the page gets new `slots` and remounts the card with a fresh draft.

Copy: `POST /admin/pengaturan/slot/4/salin` → same open-day check → `copyDay`: delete the slots of the other open days, insert copies, log.

For M5a: `pickupDates(hours, await pickupSlotService.weekdaysWithActiveSlots(), from, to)`, then `pickupSlotService.forWeekday(date.weekday)`.

## Code tour

- `database/migrations/1794962723316_create_pickup_slots_table.ts`: the table, its CHECKs, and the conversion of the old setting.
- `database/schema.ts`: `PickupSlotSchema` (generated, formatted with Prettier).
- `app/models/pickup_slot.ts`: `time` columns read as "HH:mm"; `ordered` scope.
- `app/validators/pickup_slot_validator.ts`: `endsAfterStarts`, `noOverlap`, `openDay`.
- `app/services/pickup_slot_service.ts`: `all`, `forWeekday`, `weekdaysWithActiveSlots`, `replaceDay`, `copyDay`, `DEFAULT_DAY_SLOTS`.
- `app/controllers/pickup_slots_controller.ts`, `start/routes.ts`: the page, save and copy.
- `database/seeders/pickup_slot_seeder.ts`, `database/seeders/main/index_seeder.ts`: defaults on open days when empty.
- `app/helpers/opening_hours.ts`: `pickupDates` takes the weekdays with slots.
- `app/services/setting_service.ts`, `app/validators/setting_validator.ts`, `app/controllers/store_settings_controller.ts`, `app/transformers/pickup_slot_transformer.ts`: the old slot setting removed; the transformer now shapes a row.
- `inertia/components/organisms/settings/settings_nav.tsx` (replaces `settings_tabs.tsx`), `inertia/lib/navigation/owner_links.ts`, `inertia/components/organisms/owner_navigation.tsx`: the navigation.
- `inertia/pages/admin/settings/slots.tsx`, `inertia/components/organisms/settings/pickup_slots_card.tsx`: the slots page.
- `inertia/pages/admin/settings/store.tsx`, `inertia/pages/admin/settings/areas.tsx`, `inertia/components/organisms/settings/closure_card.tsx`: side navigation; closure fields one per row on wide screens.
- `inertia/components/organisms/site_header.tsx`, `site_footer.tsx`: link order.
- Tests: `tests/unit/pickup_slot_service.spec.ts`, `tests/functional/pickup_slots.spec.ts`, `tests/browser/pickup_slots_flow.spec.ts` (new); `tests/unit/opening_hours.spec.ts`, `tests/unit/setting.spec.ts`, `tests/functional/store_settings.spec.ts`, `tests/browser/settings_flow.spec.ts`, `tests/browser/services_flow.spec.ts` (changed).

## Decisions & deviations

- D106 (new): per-day slots in a table, save a day at once, copy, the side navigation; replaces the per-day part of D105 and moves slots out of the settings of D75.
- The design saves on one page-wide button; here each day saves with "Simpan slot <hari>" (per-card saves, D105), and copying uses the saved slots, so it is disabled while the day has unsaved changes.
- The phone disclosure uses React Aria's `Disclosure`, not the shadcn accordion: the accordion's trigger is a heading, which made a second "Area Layanan" heading on the area page (caught by `settings_flow`).
- The day buttons show only the count on phones ("3"); their accessible name always says "Selasa, 3 slot".
- No overlap exclusion constraint in the database (would need `btree_gist`); the validator refuses overlaps, and only the owner edits slots.
- A React hydration warning about `caret-color` appeared once in a combined browser run before the disclosure change; it did not appear in the four later runs (`grep -c caret-color` gave 0).

## Known limitations / deferred

- Deleting or copying over a slot that already has orders: decided in M5a (handoff).
- Slots on a day later closed in the opening hours stay stored but are not shown or offered; they come back if the day reopens.
- Slots are not checked against the day's opening hours (a slot may start before the shop opens); not asked for.
- Carried over: the 360 px credit line on the owner's map (D99).
