# M4-0.4.1 evidence: M4b-fix1, map UX after the owner's review

Date: 2026-11-24. Commit: 1858608 (v0.4.0) + uncommitted changes listed in each log header.

The owner's review of M4b asked for five fixes (named M4b-fix1). M4b shipped 0.4.0, so they are patch **0.4.1** (AGENTS.md › Versioning) and this folder follows the patch naming.

## Checklist

| Criterion | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| 1. Credits folded into an ⓘ button on every map, full text on press (MAP-2, AREA-1); 2. "Gunakan lokasi saya" round on the map, hidden when refused; 3. no arrow buttons, a tap or click and the arrow keys move the pin (WCAG 2.5.7), axe clean; 4. "Alamat lengkap" is the only search field and keeps the typed text; 5. a refused save's error clears when the pin moves and the next save succeeds | PASS | `node scripts/evidence_run.ts M4-0.4.1 browser-maps-addresses-rerun -- env EVIDENCE_MILESTONE=M4-0.4.1 node ace test browser --files=tests/browser/maps_flow.spec.ts --files=tests/browser/addresses_flow.spec.ts` | see below |
| 5. The new browser test fails on the old code (the `clearErrors` line commented out for this run only, then restored) | PASS (the run failed as expected) | `node scripts/evidence_run.ts M4-0.4.1 bug5-test-fails-without-fix -- node ace test browser --files=tests/browser/addresses_flow.spec.ts --tests="a save refused for a pin outside the area clears once the pin moves inside (AREA-4)"` | see below |
| 4. The address text is searchable: house details, RT/RW and the part after the first comma are dropped (MAP-1) | PASS | `node scripts/evidence_run.ts M4-0.4.1 search-term -- node ace test unit --files=tests/unit/place_search.spec.ts --files=tests/unit/place_service.spec.ts` | see below |
| Version 0.4.1, every test: `npm run check` | PASS | `node scripts/evidence_run.ts M4-0.4.1 check -- npm run check` | see below |

Excerpt for the browser tests (`tmp/evidence/M4-0.4.1/logs/browser-maps-addresses-rerun.log` and `tmp/evidence/M4-0.4.1/screenshots/*.log`):

```text
 PASSED 

Tests  8 passed (8)
 Time  48s

exit 0
```

```text
admin-area-peta-360: scrollWidth=360 axe=none
admin-area-peta-390: scrollWidth=390 axe=none
admin-area-peta-1440: scrollWidth=1440 axe=none
alamat-tambah-360: scrollWidth=360 axe=none
alamat-tambah-1440: scrollWidth=1440 axe=none
alamat-cari-360: results open scrollWidth=360
alamat-cari-1440: results open scrollWidth=1440
alamat-label-360: street label shown
alamat-label-1440: street label shown
```

(An earlier run, `browser-maps-addresses.log`, also passed; its `alamat-label-*` screenshots were taken while a resize re-checked the pin, so the test now pauses after each resize and the screenshots were taken again.)

Excerpt for the test on the old code (`tmp/evidence/M4-0.4.1/logs/bug5-test-fails-without-fix.log`, ANSI colour codes removed):

```text
ℹ TimeoutError: locator.waitFor: Timeout 30000ms exceeded.
Call log:
  - waiting for getByText('Titik ini di luar area layanan. Geser peta ke alamat di area antar-jemput gratis.') to be detached
    63 × locator resolved to visible <div role="alert" id="lat-error" data-slot="field-error" class="text-sm font-normal text-destructive">Titik ini di luar area layanan. Geser peta ke ala…</div>
```

```text
 FAILED 

Tests  1 failed (1)
 Time  35s

exit 1

```

Excerpt for the search term (`tmp/evidence/M4-0.4.1/logs/search-term.log`):

```text
 PASSED 

Tests  9 passed (9)
 Time  185ms

exit 0
```

Excerpt for `npm run check` (`tmp/evidence/M4-0.4.1/logs/check.log`):

```text
> umimaclean@0.4.1 check
> node scripts/check.ts

ok   lint (30s)
ok   typecheck (11s)
ok   test (415s)

exit 0
```

## Run & view

```sh
npm run dev
```

Sign in at `http://localhost:3333/masuk` as Pelanggan 1 (`0821 1122 3344` / `password123`), open Profil → Alamat → Ubah on "Kantor":

1. The ⓘ at the bottom left of the map opens the credits; it folds again on the next drag.
2. The round button at the bottom right moves the pin to the device (`localhost` may use location); refuse the permission and it disappears.
3. Tap a spot on the map: it slides under the pin. Tab to the map and press the arrow keys: it pans.
4. Type "Jl. Dipatiukur No. 35, RT 02/RW 05" in "Alamat lengkap" (needs the `osm` schema, `docs/SETUP.md` Step 5), pick "Jalan Dipatiukur": the map jumps, the street appears above the coverage line, and the field still holds what you typed.
5. Move the pin outside (for example to Cileunyi with the location button or by tapping east), press "Simpan alamat": the red error appears under the map. Move the pin back inside: the error goes, the coverage line says "Masuk area layanan…", and saving works.

The owner's area map (`/admin/pengaturan/area`) has the same ⓘ.

## Screens

- `/profil/alamat/baru` at 360 px: "Alamat lengkap" as one field with its placeholder and help; the map with the pin, zoom buttons top right, ⓘ bottom left, the round location button bottom right, no arrow buttons; "Masuk area layanan: Kec. Coblong, Kota Bandung." (`tmp/evidence/M4-0.4.1/screenshots/alamat-tambah-360.png`)
- the same at 1440 px, fields left and map right (`tmp/evidence/M4-0.4.1/screenshots/alamat-tambah-1440.png`)
- `/profil/alamat/:id/ubah` at 360 px with "Jl. Dipati Ukur No. 35, RT 02/RW 05" typed: the suggestions "Jalan Dipatiukur" and "Hotel NEO Dipatiukur" (each "Lebakgede, Kec. Coblong") under the field, within the screen width (`tmp/evidence/M4-0.4.1/screenshots/alamat-cari-360.png`)
- the same at 1440 px (`tmp/evidence/M4-0.4.1/screenshots/alamat-cari-1440.png`)
- after picking at 360 px: the field still holds the typed text, "Jalan Dipatiukur, Lebakgede" above "Masuk area layanan: Kec. Coblong, Kota Bandung." (`tmp/evidence/M4-0.4.1/screenshots/alamat-label-360.png`)
- the same at 1440 px (`tmp/evidence/M4-0.4.1/screenshots/alamat-label-1440.png`)
- `/admin/pengaturan/area` at 360, 390 and 1440 px: the map preview with the ⓘ folded bottom left (`tmp/evidence/M4-0.4.1/screenshots/admin-area-peta-360.png`, `…-390.png`, `…-1440.png`; full pages, the map is near the top)
- the same after pressing ⓘ: the white credits box with "© OpenStreetMap contributors | Batas kecamatan: BPS via OCHA/HDX, CC BY-IGO 3.0, diubah" (`tmp/evidence/M4-0.4.1/screenshots/admin-area-peta-atribusi-360.png`, `…-390.png`, `…-1440.png`)
- `/profil/alamat` at 360 and 1440 px: unchanged from 0.4.0 (`tmp/evidence/M4-0.4.1/screenshots/alamat-daftar-360.png`, `alamat-daftar-1440.png`)

## How it works

- **Credits:** `createAreaMap` adds MapLibre's `AttributionControl` with `compact: true` at the bottom left, then removes its `maplibregl-compact-show` class once, so it starts as the ⓘ button (D109 workaround). Pressing the ⓘ toggles the full credits.
- **Moving the pin without dragging:** `followPin` listens to MapLibre's `click` (a tap on a phone) and eases that spot to the centre; MapLibre's keyboard handler pans with the arrow keys while the canvas has focus. Both end in `moveend` → `PinPicker.settle` → the coverage check and the label, as a drag does. The map's accessible name says both ways.
- **Location button:** `PinPicker` passes it as a child of `ServiceAreaMap`, positioned at the bottom right; its result is handed to the page (`onTarget`), which sets `pinTarget` for the map.
- **One field:** `AddressSearchField` is a React Aria combobox named `addressText` (`formValue="text"`, `allowsCustomValue`, `value` always `null`). Typing searches `GET /tempat?q=<the whole text>` after a 400 ms pause; the server keeps the part before the first comma and drops house details (`searchTerm`). Choosing a suggestion calls `onPick` (the page sets `pinTarget`) and then leaves the field on the next tick, which closes the list; the typed text is untouched and is what the form sends.
- **Refused save:** `POST`/`PUT` → `AddressService` → `checkCoverage` fails → validation error on `lat` → the page shows it under the map. When the pin next stops, `PinPicker` calls `onPointChange`, and the page runs Inertia's `clearErrors('lat', 'lng')`; the live check line under the map now speaks for the new point. Saving checks again on the server.

## Code tour

1. `inertia/lib/map/area_map.ts`: compact attribution and its workaround; the pin map's accessible name; tap or click moves the pin in `followPin`.
2. `inertia/components/organisms/service_area_map.tsx`: arrow buttons removed; `children` float on the map.
3. `inertia/components/organisms/pin_picker.tsx`: the round location button on the map; `target`, `onTarget` and `onPointChange` from the page; the search field moved out.
4. `inertia/components/molecules/address_search_field.tsx` (was `place_search.tsx`): "Alamat lengkap" as the search; the typed text kept; the list closed after a pick.
5. `inertia/pages/customer/addresses/form.tsx`: the merged field, `pinPoint` and `pinTarget`, `clearErrors` when the pin moves, the new help text.
6. `app/helpers/place_search.ts`: `searchTerm` drops house details and the part after the first comma; `app/validators/place_validator.ts`: `q` up to 300 characters.
7. Tests: `tests/browser/maps_flow.spec.ts` (ⓘ folded, then opened), `tests/browser/addresses_flow.spec.ts` (tap and arrow key instead of arrow buttons, the merged field, the refused-save test), `tests/unit/place_search.spec.ts`, `tests/unit/place_service.spec.ts`.
8. `docs/ARCHITECTURE.md` (D109, D110 amended; component notes), `docs/PLAN.md` (M4a and M4b confirmed by v0.4.0, the active section, the approved M5a plan, the M5b link item), `CHANGELOG.md` (0.4.1), `package.json`, `package-lock.json`.

## Decisions & deviations

- D109 amended: folded credits (replaces D99's never-compact rule and removes its 360 px limit), the round location button, no arrow buttons (tap or click and the arrow keys for WCAG 2.5.7), clearing a refused save's error when the pin moves.
- D110 amended: one field ("Alamat lengkap" is the search, the owner's choice when asked), the typed text kept on a pick, the list closed by leaving the field, `searchTerm` for whole addresses, `q` up to 300.
- Two workarounds, each commented with a link: MapLibre has no option to start a compact attribution folded; React Aria keeps a combobox list open when the chosen item does not become the value.
- Naming: the owner called this M4b-fix1; since 0.4.0 is tagged, AGENTS.md makes it patch 0.4.1 with the folder `M4-0.4.1`.
- No new package.

## Known limitations / deferred

- MapLibre's ⓘ button is 24 × 24 px, below CONVENTIONS' 44 px tap target (WCAG 2.1 AA has no target size rule); it is kept as MapLibre draws it, because styling it means CSS outside Tailwind classes.
- On a phone, "Alamat lengkap" is near the top and the map near the bottom of the form, so picking a suggestion moves a map that is off screen until the customer scrolls; the street label appears there.
- "Alamat lengkap" is now one line (a combobox input), no longer a multi-line text area; long addresses scroll inside it.
- The headless test cannot show a real permission prompt; refused and granted positions are covered.
