# M4-0.4.2 evidence: the address form on one page

Date: 2026-11-24. Commit: 53e4ed3 (0.4.1) + uncommitted changes listed in each log header.

After the owner's review of M4b (0.4.1 not approved as it stood), patch **0.4.2** reworks the address form after the owner's reference ("Alamat Baru"). Several builds were revised in review (a two-step flow; street lines under the map; an interactive map on phones; a phone sheet with its own search). This evidence covers the final build: one page, only the coverage line under the map, no reopened suggestions while typing the house number, and on phones a static preview that opens the "Ubah lokasi" sheet (no input fields, a read-only "Alamat yang dipilih" card, "Konfirmasi"). Also: every dialog's close button is 44 px, and `GET /tempat` always needs a search term.

## Checklist

| Criterion | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| 1. "Nama jalan, gedung, no. rumah" (textarea, required) is the place search: a pick (pointer or keyboard) fills the full suggestion text and moves the pin; typing the house number after it does not reopen the suggestions, editing the text before the first comma does; 2. "Detail lainnya" optional; no helper texts under the recipient fields; 3. only the coverage line under the map; 4. desktop: the map moves inside the form (tap, arrow keys, location button, ⓘ); phone (below `md`, a touch context with taps): a static preview (no gestures, no zoom control) with "Atur pin"; the button or a tap on the preview opens "Ubah lokasi" (back arrow, read-only card with the form's text and the area under the pin, no input fields, map, location button, ⓘ, coverage, "Konfirmasi"); the back arrow closes it and keeps the old point, "Konfirmasi" closes it and hands the new one to the form, and it does not open again; 5. the 0.4.1 refused-save test kept; the ⓘ at least 44 px; axe clean and no horizontal scroll at 360 and 1440 px | PASS | `node scripts/evidence_run.ts M4-0.4.2 browser-addresses-maps -- node ace test browser --files=tests/browser/addresses_flow.spec.ts --files=tests/browser/maps_flow.spec.ts` (with `EVIDENCE_MILESTONE=M4-0.4.2`) | see below |
| The refused-save test fails on the old code (`clearErrors` commented out for this run only, then restored) | PASS (the run failed as expected) | `node scripts/evidence_run.ts M4-0.4.2 save-error-test-fails-without-fix -- node ace test browser --files=tests/browser/addresses_flow.spec.ts --tests="a save refused for a pin outside the area clears once the pin moves inside (AREA-4)"` | see below |
| The area read at the pin is stored for coverage, apart from the typed text; `details` replaces `landmark`; a suggestion carries its full name; `GET /tempat` without `q` is refused (nearby mode removed), staff may search | PASS | `node scripts/evidence_run.ts M4-0.4.2 address-unit-functional -- sh -c 'node ace test unit --files=tests/unit/address_service.spec.ts --files=tests/unit/place_service.spec.ts --files=tests/unit/place_search.spec.ts && node ace test functional --files=tests/functional/addresses.spec.ts --files=tests/functional/places.spec.ts'` | see below |
| The table and the seed: existing text merged into `address_text` and `details` | PASS | `node scripts/evidence_run.ts M4-0.4.2 schema-and-seed -- sh -c 'node ace migration:fresh && npx prettier --write database/schema.ts && node ace db:seed && podman exec postgres psql -U user -d umimaclean_dev -c "SELECT u.full_name, a.label, a.address_text, a.details, a.street, a.kelurahan, a.kecamatan, a.city FROM customer_addresses a JOIN users u ON u.id = a.user_id ORDER BY a.id"'` | see below |
| Version 0.4.2, every test: `npm run check` | PASS | `node scripts/evidence_run.ts M4-0.4.2 check -- npm run check` | see below |

Excerpt for the browser tests (`tmp/evidence/M4-0.4.2/logs/browser-addresses-maps.log` and `tmp/evidence/M4-0.4.2/screenshots/*.log`):

```text
 PASSED 

Tests  8 passed (8)
```

```text
alamat-cari-360: suggestions open scrollWidth=360
alamat-cari-1440: suggestions open scrollWidth=1440
alamat-baru-360: scrollWidth=360 axe=none
alamat-baru-1440: scrollWidth=1440 axe=none
alamat-daftar-360: scrollWidth=360 axe=none
alamat-daftar-1440: scrollWidth=1440 axe=none
alamat-peta-360: Ubah lokasi open after the device location
admin-area-peta-360: scrollWidth=360 axe=none
admin-area-peta-390: scrollWidth=390 axe=none
admin-area-peta-1440: scrollWidth=1440 axe=none
```

Excerpt for the test on the old code (`tmp/evidence/M4-0.4.2/logs/save-error-test-fails-without-fix.log`, ANSI colour codes removed):

```text
ℹ TimeoutError: locator.waitFor: Timeout 30000ms exceeded.
Call log:
  - waiting for getByText('Titik ini di luar area layanan. Geser peta ke alamat di area antar-jemput gratis.') to be detached
    63 × locator resolved to visible <div role="alert" id="lat-error" data-slot="field-error" class="text-sm font-normal text-destructive">Titik ini di luar area layanan. Geser peta ke ala…</div>
```

Excerpt for the unit and functional tests (`tmp/evidence/M4-0.4.2/logs/address-unit-functional.log`): the unit run, then the functional run.

```text
Tests  17 passed (17)
Tests  21 passed (21)
```

Excerpt for the table and the seed (`tmp/evidence/M4-0.4.2/logs/schema-and-seed.log`):

```text
   full_name    |  label   |                 address_text                  |                  details                   |         street         | kelurahan |  kecamatan  |       city        
----------------+----------+-----------------------------------------------+--------------------------------------------+------------------------+-----------+-------------+-------------------
 Rina Wulandari | Rumah    | Jalan Kidang Pananjung No. 35, Dago, Coblong  | RT 02/RW 05, pagar hijau depan warung kopi | Jalan Kidang Pananjung | Dago      | Coblong     | Kota Bandung
 Rina Wulandari | Kantor   | Jalan Mulya Sari No. 120, Sukagalih, Sukajadi | Lantai 2                                   | Jalan Mulya Sari       | Sukagalih | Sukajadi    | Kota Bandung
 Rina Wulandari | Kos Adik | Jl. Raya Cileunyi No. 8, Cileunyi Kulon       |                                            |                        |           | Cileunyi    | Kabupaten Bandung
 Dimas Prasetyo | Rumah    | Komplek Bumi Asri Blok C2 No. 7               | Rumah cat putih di ujung gang              |                        |           | Bojongsoang | Kabupaten Bandung
(4 rows)
```

Excerpt for `npm run check` (`tmp/evidence/M4-0.4.2/logs/check.log`; the test count from `tmp/check/test.log`: `Tests  319 passed (319)`; one fewer than before because the nearby-places unit test is gone):

```text
ok   lint (29s)
ok   typecheck (10s)
ok   test (423s)

exit 0
```

The builds revised in review keep their logs and screenshots in `tmp/evidence/M4-0.4.2-superseded-two-step/`, `…-superseded-round2/` and `…-superseded-round3/`; they are not part of this evidence.

## Run & view

```sh
node ace migration:fresh   # the create migration of customer_addresses changed (rule before v1.0.0)
node ace db:seed
npm run dev
```

Sign in at `http://localhost:3333/masuk` as Pelanggan 1 (`0821 1122 3344` / `password123`), Profil → Alamat:

1. On a desktop browser open "Kantor": Kontak, then Alamat ("Jalan Mulya Sari No. 120, Sukagalih, Sukajadi", "Lantai 2"), the notice, the map and "Masuk area layanan.", then Pengaturan.
2. In "Nama jalan, gedung, no. rumah" type "dipati ukur" (needs the `osm` schema, `docs/SETUP.md` Step 5) and choose "Jalan Dipatiukur" (click, or ↓ then Enter): the field reads "Jalan Dipatiukur, Lebakgede, Coblong" and the pin moves; type ", No. 12" after it: the list stays closed. Tap the map or use the arrow keys on it; the round button uses the device's location; the ⓘ shows the credits.
3. Narrow the window below 768 px (or use a phone): the map becomes a still preview with "Atur pin"; scrolling over it scrolls the page. "Atur pin" or a tap on the preview opens "Ubah lokasi": the card shows the address text and the area under the pin; move the map or use the location button, then "Konfirmasi". The back arrow keeps the old pin.
4. "Kos Adik" lies in Cileunyi, switched off: saving it is refused under the map; move the pin into a covered spot and the error goes, saving works.

## Screens

- New address with the suggestions open, at 360 px: "dipati ukur" in the address field, "Jalan Dipatiukur" and "Hotel NEO Dipatiukur" (each "Lebakgede, Kec. Coblong") listed under it (`tmp/evidence/M4-0.4.2/screenshots/alamat-cari-360.png`)
- The same at 1440 px (`tmp/evidence/M4-0.4.2/screenshots/alamat-cari-1440.png`)
- New address filled in, at 360 px (full page): Kontak without helper texts; "Jalan Dipatiukur, Lebakgede, Coblong, No. 12"; "RT 01/RW 03, pagar biru"; the notice; the still preview with the pin, ⓘ and "Atur pin"; only "Masuk area layanan." under it; Pengaturan with "Lainnya" / "Rumah Ibu"; "Simpan alamat". The fixed bottom navigation is drawn mid-page by the full-page capture (`tmp/evidence/M4-0.4.2/screenshots/alamat-baru-360.png`)
- "Ubah lokasi" at 360 px after the device location (editing "Kantor"): back arrow and title; the card "Alamat yang dipilih" with "Jalan Mulya Sari No. 120, Sukagalih, Sukajadi" and "Lebakgede, Kec. Coblong, Kota Bandung"; the map filling the screen with zoom, pin, ⓘ and location button; "Masuk area layanan."; "Konfirmasi" at the bottom (`tmp/evidence/M4-0.4.2/screenshots/alamat-peta-360.png`)
- New address filled in, at 1440 px: the same form with the moving map (zoom control, ⓘ, location button) and only "Masuk area layanan." under it (`tmp/evidence/M4-0.4.2/screenshots/alamat-baru-1440.png`)
- `/profil/alamat` at 360 and 1440 px: each card shows the address text, the details, then "Kec. …, kota" and the recipient; "Kos Adik" "Di luar area layanan" (`tmp/evidence/M4-0.4.2/screenshots/alamat-daftar-360.png`, `alamat-daftar-1440.png`)
- `/admin/pengaturan/area` at 360, 390 and 1440 px: the 44 px ⓘ folded, then open with the credits (`tmp/evidence/M4-0.4.2/screenshots/admin-area-peta-*.png`, `admin-area-peta-atribusi-*.png`)

## How it works

```text
/profil/alamat/baru or /:id/ubah → AddressForm (one page; state: pin, pinTarget)
  "Nama jalan, gedung, no. rumah" = PlaceSearch (Autocomplete + TextField + TextArea, name=addressText)
    text before the first comma changed, ≥ 3 chars, 400 ms pause → GET /tempat?q=&lat=&lng=
    choose → field = place.fullName; movePin(place) and pinTarget = place
  PinPicker: usePinCheck(pin) → GET /area/cek-titik after 300 ms → CoverageStatus (one line)
    ≥ md: ServiceAreaMap (moving) start=pin target=pinTarget; drag/tap/keys/locate → moveend → movePin
    < md: ServiceAreaMap (static, target=pin) + "Atur pin" → PinSheet "Ubah lokasi" (Dialog, full screen)
          own point; usePinCheck (status, kecamatan, kota) + usePinLabel (GET /tempat/titik: kelurahan)
          card = form's addressText + area; LocateButton; "Konfirmasi" → movePin; back arrow → no change
    movePin: pin = point, pinTarget = null, clearErrors('lat','lng'); hidden inputs lat, lng
→ submit POST/PUT → createAddressValidator (addressText ≥ 3, details optional ≤ 160) → AddressService
    → checkCoverage (outside: error on `lat`, shown under the map) → kecamatan, city
    → PlaceService.describePoint → street, kelurahan (null without osm)
    → save; the typed text and details are never rewritten
```

## Code tour

1. `database/migrations/1795500000000_create_customer_addresses_table.ts`: `address_text` (the address field), `details` (replaces `landmark`), `street`, `kelurahan`, `kecamatan`, `city`; `database/schema.ts` regenerated.
2. `database/seeders/customer_address_seeder.ts`: the old detail and landmark merged into the two fields.
3. `app/services/place_service.ts`: each place carries `fullName`, what a pick writes into the field.
4. `app/services/address_service.ts`: saves `details`; reads the area at the pin on every save.
5. `app/validators/address_validator.ts`, `start/validator.ts`, `app/transformers/address_transformer.ts`.
6. `inertia/components/molecules/place_search.tsx`: the textarea that is also the place search; searches only when the name before the first comma changes.
7. `inertia/lib/map/pin_check.ts` (`usePinCheck`, `usePinLabel`), `inertia/components/molecules/coverage_status.tsx`, `inertia/components/molecules/locate_button.tsx`.
8. `inertia/components/organisms/pin_picker.tsx`: the notice, the moving map or the phone preview, the coverage line, `lat`/`lng`.
9. `inertia/components/organisms/pin_sheet.tsx`: the phone's "Ubah lokasi" sheet; `inertia/components/ui/dialog.tsx`, `ui/sheet.tsx`: 44 px close buttons.
10. `app/validators/place_validator.ts`, `app/controllers/places_controller.ts`, `app/services/place_service.ts`: `q` required, the nearby-places query removed.
11. `inertia/components/organisms/service_area_map.tsx`, `inertia/lib/map/area_map.ts` (static mode, credits, resize fix), `inertia/components/molecules/map_credits.tsx` (the 44 px ⓘ).
12. `inertia/pages/customer/addresses/form.tsx` (one page; `movePin`), `index.tsx`.
13. Tests: `tests/unit/place_service.spec.ts`, `tests/unit/address_service.spec.ts`, `tests/functional/addresses.spec.ts`, `tests/functional/places.spec.ts` (no-`q` refused), `tests/browser/addresses_flow.spec.ts` (desktop flow with item 4; the phone preview and "Ubah lokasi" in a touch context; the refused-save test kept), `tests/browser/maps_flow.spec.ts`, `tests/helpers/screenshots.ts`.
14. Docs: `docs/PRD/customer.md` (CUST-3, at the owner's request), `docs/ARCHITECTURE.md` (D109, D110; component notes), `docs/PLAN.md`, `CHANGELOG.md`, `package.json`, `package-lock.json`.

## Decisions & deviations

- D109 amended for 0.4.2: one page in the reference's order; only the coverage line under the map; a moving map from `md` up, a static preview and a full-screen sheet below it; `details` replaces `landmark`; the area fields read by the server on every save; the 44 px credits button; the resize loop fix.
- D110 amended for 0.4.2: the address textarea is the search (React Aria `Autocomplete`, because a combobox only takes a one-line input); a pick writes `fullName`; only a change before the first comma searches again; Enter still starts a new line; the sheet reuses the component.
- Workaround (comment in `place_search.tsx`): `Autocomplete` sends the field a `blur` when its virtual focus moves into the list; the field ignores a blur whose `relatedTarget` is inside the list.
- Found while testing: a map mounted after a layout switch jumped back to the last search or location result; the form now clears that target once the pin settles.
- "Konfirmasi" is disabled while the point is being checked or is outside the area, as the form's save would be refused there.
- The card's kecamatan and kota come from the coverage check's district and its kelurahan from `GET /tempat/titik`: the same two sources the server stores on save. `GET /tempat/titik` itself names only the street and kelurahan.
- The "doesn't close" bug did not reproduce here, with a mouse or with emulated touch taps. The likely cause on a real phone was the search field inside the old sheet: its keyboard covered "Simpan pin" and shifted the ×. The new sheet has no input fields, and the test now runs as a touch phone and checks that the sheet stays closed after each button.
- One run of the refused-save test failed (`browser-addresses-maps-flaky.log`): the error never showed after "Simpan alamat". The likely cause, not proven: the desktop map resizing just after load ended with a centre differing only in the last float digits, which counted as a pin move and cleared the error. `followPin` now ignores moves under 1e-7° (about 1 cm). The test then passed 3 runs alone and the clean suite run.
- The preview's tap target is an `aria-hidden` button with `tabIndex={-1}` over the map; "Atur pin" is the button keyboards and screen readers use.
- Recipient name and WhatsApp stay in "Kontak" (CUST-3; STAFF-7 calls the recipient).
- CUST-3 updated at the owner's request: "optional detail lainnya (block/unit, landmark)"; I also replaced "the street label under the pin" with what the form now does (search in the address field, only the coverage status under the map, street and area stored). Please check that wording.
- No real addresses exist (owner), so the create migration is edited in place and the seed carries the merged text.

## Known limitations / deferred

- PRD MAP-1 still mentions "the nearby-places list", which the owner asked to remove; the PRD wording is the owner's.
- The card shows the form's address text even when the pin has been moved far from it (as asked); nothing compares the two.
- Without OSM data the search says "Pencarian tempat belum tersedia. Atur pin di peta.".
- Not checked on a real phone or with a tiles file (plain map background in tests).
