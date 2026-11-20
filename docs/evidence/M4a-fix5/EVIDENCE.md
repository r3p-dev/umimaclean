# M4a-fix5 evidence: UI polish (compact phone rows, menus, sheets, one sign-out)

Date: 2026-11-18. Commit: 0c4af90 (+ uncommitted changes listed in each log header).

## Checklist

| Criterion | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| 1. Pickup slots on phones: day buttons ≥ 44 px, scrolling sideways; one compact row per slot (switch, time, stepper, ⋯ with delete); "Tambah slot" opens a bottom sheet | PASS | `EVIDENCE_MILESTONE=M4a-fix5 node scripts/evidence_run.ts M4a-fix5 browser-slots-after-fix -- node ace test browser --files tests/browser/pickup_slots_flow.spec.ts` | see below |
| 2. Services list: one compact row per service (name, price, duration, active switch), edit/delete in ⋯; checkbox kept for the bulk on/off | PASS | `EVIDENCE_MILESTONE=M4a-fix5 node scripts/evidence_run.ts M4a-fix5 browser-services-after-fix -- node ace test browser --files tests/browser/services_flow.spec.ts` | see below |
| 3. Service form: full screen on phones, dialog on desktop | PASS | same run (`admin-layanan-error-*`) | see Screens |
| 4. "Bagian: …" disclosure: equal padding, text centred | PASS | `browser-slots-after-fix` (`pengaturan-nav-*`) and `browser-account-area-after-fix` (`admin-pengaturan-toko-*`, `admin-area-*`) | see Screens |
| 5. Areas: grouped list with switches, search, Semua/Aktif/Nonaktif filter, map as a preview | PASS | `EVIDENCE_MILESTONE=M4a-fix5 node scripts/evidence_run.ts M4a-fix5 browser-account-area-after-fix -- node ace test browser --files tests/browser/account_ui_flow.spec.ts --files tests/browser/settings_flow.spec.ts` | see below |
| 6. Staff queue reuses the owner's stat card (one component) | PASS | same run (`beranda-*`, `[data-slot="stat-card"]` counted on both pages) | see below |
| 7. Sign-out: one `LogoutButton` in the "Akun" card of every Profil page and the desktop side nav of staff and owner; customers use an account menu | PASS | same run, plus `tests/browser/auth_flow.spec.ts` in `browser-polish` | see below |
| `npm run check` (lint, typecheck, all tests, no deprecation warnings) | PASS | `node scripts/evidence_run.ts M4a-fix5 check -- npm run check` | see below |
| Commit 1 (shared components) passes `npm run check` on its own | PASS | `node scripts/evidence_run.ts M4a-fix5 commit-1-alone -- sh -c 'cd tmp/verify-commits && npm run check'` | see below |

Excerpt for the browser runs (`tmp/evidence/M4a-fix5/logs/browser-polish.log`, `browser-slots-after-fix.log`, `browser-services-after-fix.log`, `browser-account-area-after-fix.log`, and the screenshot logs):

```text
browser-polish: Tests  18 passed (18)
browser-slots-after-fix: Tests  1 passed (1)
browser-services-after-fix: Tests  4 passed (4)
browser-account-area-after-fix: Tests  4 passed (4)
pengaturan-slot-360: day=Selasa scrollWidth=360 axe=none
pengaturan-slot-390: day=Rabu scrollWidth=390 axe=none
pengaturan-slot-1440: day=Kamis scrollWidth=1440 axe=none
profil-pelanggan-360: scrollWidth=360 axe=none
profil-staf-360: scrollWidth=360 axe=none
profil-owner-360: scrollWidth=360 axe=none
profil-owner-1440: scrollWidth=1440 axe=none
```

(The first line of each run is its `Tests` line, prefixed here with the log name. Each profile page is also checked for exactly one "Keluar" in the desktop side nav at 1440 px for staff and owner, and each test ends by signing out from the "Akun" card.)

Excerpt for the full check (`tmp/evidence/M4a-fix5/logs/check.log`, totals from `check-test.log`):

```text
ok   lint (27s)
ok   typecheck (9s)
ok   test (348s)
Tests  267 passed (267)
```

A first full check (`check-dark-class.log`, `check-dark-class-test.log`) failed one test: `dropdown_menu.tsx has a dark: class` (the project's one-light-theme test). The CLI component's `dark:` classes were removed, as for the other `ui/` components, and the check was run again.

Excerpt for commit 1 alone (`tmp/evidence/M4a-fix5/logs/commit-1-alone.log`, totals from `commit-1-alone-test.log`):

```text
ok   lint (24s)
ok   typecheck (9s)
ok   test (352s)
Tests  267 passed (267)
```

## Run & view

Restart `npm run dev` (no migration, no new package; `dropdown-menu` came from the shadcn CLI). Then:

1. Owner, phone width: `/admin/pengaturan/slot` — swipe the day row; each slot is one line; ⋯ → "Hapus slot"; "Tambah slot Senin" slides a sheet up from the bottom.
2. `/admin/layanan` — one line per service; ⋯ → Ubah opens the form full screen on a phone, as a dialog on desktop; tick two services for "Aktifkan / Nonaktifkan".
3. `/admin/pengaturan/area` — Semua / Aktif / Nonaktif with counts, the search box, the smaller map.
4. `/admin`, `/staf` — the same number cards.
5. Profil for each role — "Akun" card with "Keluar" at the bottom; staff and owner also have "Keluar" at the bottom of the desktop side nav. Customer header: initials (and the name from `sm` up) open a menu with Profil and Keluar.

## Screens

All 45 opened. Final runs only; earlier copies listed at the end.

- `/admin/pengaturan/slot` at 360/390 px: closed "Bagian: Slot penjemputan"; day buttons (Sen 3 slot …) wider than 44 px, the row cut at the right edge to show it scrolls; three one-line slots (switch, "09.00–12.00", − 6 +, ⋯); "Tambah slot …", "Salin …", "Simpan …" (`tmp/evidence/M4a-fix5/screenshots/pengaturan-slot-{360,390}.png`)
- the same at 1440 px: the 7-column day grid, rows with "Kapasitas" and the stepper on the right, ⋯ (`tmp/evidence/M4a-fix5/screenshots/pengaturan-slot-1440.png`)
- "Tambah slot" at 360/390 px: a bottom sheet with title, the 24-hour note, Mulai 18.00, Selesai 20.00 (minutes in focus), "Tambah ke daftar" shown disabled at the moment of the capture (the test presses it right after and the slot is added); at 1440 px the same as a centred dialog (`tmp/evidence/M4a-fix5/screenshots/pengaturan-slot-tambah-{360,390,1440}.png`)
- after adding 11.00–13.00 and saving, at 360/390/1440 px: four rows, red "Slot 11.00–13.00 bertabrakan dengan 09.00–12.00.", "Salin" disabled with "Simpan dulu sebelum menyalin." (`tmp/evidence/M4a-fix5/screenshots/pengaturan-slot-tabrakan-{360,390,1440}.png`)
- after copying Thursday, at 1440 px: Monday with 09.00–12.00, 12.00–15.00, 18.00–20.00 (`tmp/evidence/M4a-fix5/screenshots/pengaturan-slot-salin-1440.png`)
- the "Bagian" disclosure open at 360/390 px: title and chevron centred with even padding, Toko / Slot penjemputan (highlighted) / Area layanan (`tmp/evidence/M4a-fix5/screenshots/pengaturan-nav-{360,390}.png`)
- `/admin/layanan` at 360/390 px with two rows ticked: the bulk bar, then one line per service — name, "mulai dari Rp120.000 · 5 hari · …" on the second line, switch, ⋯; at 1440 px the same list with Estimasi and Harga columns and the "Mulai dari" badge (`tmp/evidence/M4a-fix5/screenshots/admin-layanan-bulk-{360,390,1440}.png`)
- the delete dialog opened from ⋯ → Hapus, at 360/390/1440 px (`tmp/evidence/M4a-fix5/screenshots/admin-layanan-delete-{360,390,1440}.png`)
- the empty service form submitted, at 360/390 px: the form fills the screen (full-page capture, scrolled inside to the "Nama layanan wajib diisi." field; the list continues below the capture's first screen); at 1440 px the centred dialog (`tmp/evidence/M4a-fix5/screenshots/admin-layanan-error-{360,390,1440}.png`)
- `/admin/pengaturan/area` at 360/390/1440 px: search, "Semua (64) | Aktif (43) | Nonaktif (21)" on one line (smaller text below `sm`), "Pratinjau peta" at its new height, the groups with switches (`tmp/evidence/M4a-fix5/screenshots/admin-area-{360,390,1440}.png`)
- `/admin/pengaturan/toko` at 360/390/1440 px: "Bagian: Toko" with even padding; the closure card unchanged; a leftover area toast (`tmp/evidence/M4a-fix5/screenshots/admin-pengaturan-toko-{360,390,1440}.png`)
- `/staf` at 360/390 px: Jemput, Proses, Antar as full-width stat cards; at 1440 px three in a row (`tmp/evidence/M4a-fix5/screenshots/beranda-staf-{360,390,1440}.png`)
- `/admin` at 360/390/1440 px: the four money cards, the same component (`tmp/evidence/M4a-fix5/screenshots/beranda-owner-{360,390,1440}.png`)
- `/beranda` with the account menu open at 360/390/1440 px: Profil, separator, Keluar; initials only on phones, the name at 1440 (`tmp/evidence/M4a-fix5/screenshots/menu-akun-{360,390,1440}.png`)
- `/profil` (customer) at 360/390/1440 px: identity, devices, "Akun" card with "Keluar"; at 360 px the long name is cut by the "Ubah" button, as before this stop (`tmp/evidence/M4a-fix5/screenshots/profil-pelanggan-{360,390,1440}.png`)
- `/staf/profil` at 360/390/1440 px: "Akun" card last; the old red "Keluar" inside the devices card is gone; at 1440 the side nav ends with Profil and Keluar; on phones the fixed tab bar is drawn over the middle of the full-page capture (`tmp/evidence/M4a-fix5/screenshots/profil-staf-{360,390,1440}.png`)
- `/admin/profil` at 360/390/1440 px: "Akun" card across both columns at 1440 (`tmp/evidence/M4a-fix5/screenshots/profil-owner-{360,390,1440}.png`)

Superseded after opening, deleted from `tmp/`: the first slot set (at 360 px the range wrapped to "09.00–" / "12.00"; fixed with a smaller stepper below `sm`, `whitespace-nowrap`); the first service set (names cut short by the "Mulai dari" badge on phones; the badge moved into the second line); the first account and area set (the menu caught mid-animation; staff labels cut to "Jem…" in three columns; "Nonaktif (21)" wrapping at 360 px). Deleted unopened: screenshots of unchanged pages from the same runs (`landing-*`, `admin-layanan-empty/inactive-*`, `admin-menu-layanan-*`, `admin-area-toggle-*`, `admin-pengaturan-toko-error-*`, `admin-pengaturan-slot-*`, `admin-nav-mobile-*`). A rerun of `services_flow` first stopped at its end (`browser-services-after-fix-eexist.log`) because the evidence copy refuses to overwrite `screenshots.log`; the earlier log was renamed (`screenshots-browser-polish.log`, `screenshots-services.log`), never overwritten.

## How it works

- Sign-out: `LogoutButton` posts `session.destroy` with the CSRF field (unchanged route). `AccountCard` holds it on every Profil page; the owner and staff side navs pass their own classes. The customer menu item calls `router.post(urlFor('session.destroy'))`.
- Menus: `DropdownMenuTrigger` wraps a `Button` and a `DropdownMenu`; `onAction` runs the row action (open the form, open the delete dialog, remove a draft slot).
- Phone layouts: `BOTTOM_SHEET_ON_PHONE` and `FULL_SCREEN_ON_PHONE` (`inertia/lib/ui/dialog_layouts.ts`) are `max-sm:` classes merged into the one `Dialog`; nothing is decided in JavaScript, so the server render matches.
- Area filter: client-side over the `areas` prop (search and status together); the map gets all shapes as before.

## Code tour

- `inertia/components/ui/dropdown_menu.tsx` (shadcn CLI; renamed to snake case, shadowed names renamed, `min-w-24`, `dark:` classes removed).
- `inertia/components/molecules/stat_card.tsx`, `logout_button.tsx` (new); `number_stepper.tsx` (smaller below `sm`).
- `inertia/lib/ui/dialog_layouts.ts` (new).
- `inertia/components/organisms/account_security.tsx` (`AccountCard`); `owner_navigation.tsx`, `staff_navigation.tsx` (`LogoutButton`); `customer_navigation.tsx` (account menu).
- `inertia/components/organisms/settings/pickup_slots_card.tsx` (scrolling days, compact rows, ⋯, sheet); `settings_nav.tsx` (padding).
- `inertia/pages/admin/services.tsx` (one list, ⋯, full-screen form on phones); `inertia/pages/admin/settings/areas.tsx` (filter, preview).
- `inertia/pages/admin/dashboard.tsx`, `inertia/pages/staff/dashboard.tsx` (`StatCard`); `inertia/pages/{admin,staff}/profile.tsx`, `inertia/pages/customer/profile/show.tsx` (`AccountCard`).
- Tests: `tests/browser/account_ui_flow.spec.ts` (new); `pickup_slots_flow`, `services_flow`, `settings_flow`, `auth_flow` (selectors for the new UI).

## Decisions & deviations

- D107 (new): the shared pieces and where sign-out lives.
- The services checkbox stays: it drives the existing bulk on/off (`/admin/layanan/bulk-toggle`).
- No separate drawer component: the dialog gets phone classes instead (one component to keep).
- The customer account button's name is its visible text plus a hidden ", menu akun" (axe `label-content-name-mismatch` refused an `aria-label` that differed from the shown name).
- A closing menu popover is briefly a `dialog` too, so the services test finds the delete dialog by name.
- The temporary closure card is unchanged (date-only closure on hold, as the owner asked).

## Known limitations / deferred

- At 360 px a long customer name is cut on the Profil identity card next to "Ubah" (unchanged here).
- The bottom-sheet "Tambah ke daftar" is enabled only once the time field has both segments; the capture shows it a moment before.
- Carried over: the 360 px credit line on the owner's map (D99).
