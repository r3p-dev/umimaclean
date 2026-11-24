# M4-0.4.2 evidence: the address form on one page

Date: 2026-11-24. Commit: 53e4ed3 (0.4.1) + uncommitted changes listed in each log header.

After the owner's review of M4b (0.4.1 not approved as it stood), patch **0.4.2** reworks the address form. A first 0.4.2 build in two steps was rejected in review; this build follows the owner's reference ("Alamat Baru") as one page. Nothing of the two-step build remains.

## Checklist

| Criterion | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| 1. "Nama jalan, gedung, no. rumah" (textarea, required) is the place search: typing lists suggestions, choosing one (pointer or keyboard) fills the full suggestion text and moves the pin, the house number is typed after it; 2. "Detail lainnya (cth: blok / unit no., patokan)" optional, no separate detail or landmark field; 3. the map under the fields with the notice, fixed pin, tap and arrow keys, location button, ⓘ and coverage status; 4. "Tandai sebagai", "Jadikan alamat utama", the buttons; recipient name and WhatsApp kept (CUST-3); the 0.4.1 refused-save test kept; the ⓘ at least 44 px; axe clean and no horizontal scroll at 360 and 1440 px | PASS | `node scripts/evidence_run.ts M4-0.4.2 browser-addresses-maps -- node ace test browser --files=tests/browser/addresses_flow.spec.ts --files=tests/browser/maps_flow.spec.ts` (with `EVIDENCE_MILESTONE=M4-0.4.2`), then the edit screenshots again: `node scripts/evidence_run.ts M4-0.4.2 browser-edit-screens -- node ace test browser --files=tests/browser/addresses_flow.spec.ts --tests="editing an address keeps its text and moves only the pin (CUST-3, D109)"` | see below |
| The refused-save test fails on the old code (`clearErrors` commented out for this run only, then restored) | PASS (the run failed as expected) | `node scripts/evidence_run.ts M4-0.4.2 save-error-test-fails-without-fix -- node ace test browser --files=tests/browser/addresses_flow.spec.ts --tests="a save refused for a pin outside the area clears once the pin moves inside (AREA-4)"` | see below |
| The area read at the pin is stored for coverage, apart from the typed text; `details` replaces `landmark`; a suggestion carries its full name | PASS | `node scripts/evidence_run.ts M4-0.4.2 address-unit-functional -- sh -c 'node ace test unit --files=tests/unit/address_service.spec.ts --files=tests/unit/place_service.spec.ts --files=tests/unit/place_search.spec.ts && node ace test functional --files=tests/functional/addresses.spec.ts --files=tests/functional/places.spec.ts'` | see below |
| The table and the seed: existing text merged into `address_text` and `details` | PASS | `node scripts/evidence_run.ts M4-0.4.2 schema-and-seed -- sh -c 'node ace migration:fresh && npx prettier --write database/schema.ts && node ace db:seed && podman exec postgres psql -U user -d umimaclean_dev -c "SELECT u.full_name, a.label, a.address_text, a.details, a.street, a.kelurahan, a.kecamatan, a.city FROM customer_addresses a JOIN users u ON u.id = a.user_id ORDER BY a.id"'` | see below |
| Version 0.4.2, every test: `npm run check` | PASS | `node scripts/evidence_run.ts M4-0.4.2 check -- npm run check` | see below |

Excerpt for the browser tests (`tmp/evidence/M4-0.4.2/logs/browser-addresses-maps.log` and `tmp/evidence/M4-0.4.2/screenshots/*.log`):

```text
 PASSED 

Tests  7 passed (7)
 Time  46s

exit 0
```

```text
alamat-cari-360: suggestions open scrollWidth=360
alamat-cari-1440: suggestions open scrollWidth=1440
alamat-baru-360: scrollWidth=360 axe=none
alamat-baru-1440: scrollWidth=1440 axe=none
alamat-daftar-360: scrollWidth=360 axe=none
alamat-daftar-1440: scrollWidth=1440 axe=none
alamat-ubah-360: edit form
alamat-ubah-1440: edit form
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
Tests  18 passed (18)
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

Excerpt for `npm run check` (`tmp/evidence/M4-0.4.2/logs/check.log`; the test count from `tmp/check/test.log`: `Tests  319 passed (319)`):

```text
ok   lint (28s)
ok   typecheck (10s)
ok   test (411s)

exit 0
```

After the check, one line was added to the edit test (wait for the coverage line before its screenshots, which had caught "Mengecek area…" after the viewport change); `browser-edit-screens.log` is that test's passing run. The rejected two-step build's logs and screenshots were moved to `tmp/evidence/M4-0.4.2-superseded-two-step/` and are not part of this evidence.

## Run & view

```sh
node ace migration:fresh   # the create migration of customer_addresses changed (rule before v1.0.0)
node ace db:seed
npm run dev
```

Sign in at `http://localhost:3333/masuk` as Pelanggan 1 (`0821 1122 3344` / `password123`), Profil → Alamat:

1. Open "Kantor": Kontak, then Alamat ("Jalan Mulya Sari No. 120, Sukagalih, Sukajadi", "Lantai 2"), the map with the notice and "Kec. Sukajadi, Kota Bandung · Masuk area layanan.", then Pengaturan.
2. In "Nama jalan, gedung, no. rumah" type "dipati ukur" (needs the `osm` schema, `docs/SETUP.md` Step 5) and choose "Jalan Dipatiukur" (click, or ↓ then Enter): the field reads "Jalan Dipatiukur, Lebakgede, Coblong" and the pin moves; type ", No. 12" after it. Tap the map or use the arrow keys on it to adjust; the round button uses the device's location; the ⓘ shows the credits.
3. Save: the list shows the text, the details, then the kecamatan and kota.
4. "Kos Adik" lies in Cileunyi, switched off: saving it is refused under the map; move the pin into a covered spot and the error goes, saving works.

## Screens

- New address with the suggestions open, at 360 px: "Nama jalan, gedung, no. rumah" holds "dipati ukur", the list under it shows "Jalan Dipatiukur" and "Hotel NEO Dipatiukur" (each "Lebakgede, Kec. Coblong") over the notice and the map (`tmp/evidence/M4-0.4.2/screenshots/alamat-cari-360.png`)
- The same at 1440 px, in the centred column (`tmp/evidence/M4-0.4.2/screenshots/alamat-cari-1440.png`)
- New address filled in, at 360 px (full page): Kontak; Alamat with "Jalan Dipatiukur, Lebakgede, Coblong, No. 12" and the details field; the notice; the map with the pin, zoom, ⓘ and location button; "Jalan Dipatiukur" / "Lebakgede, Kec. Coblong, Kota Bandung" / "Masuk area layanan."; Pengaturan with "Lainnya" and "Rumah Ibu"; "Jadikan alamat utama"; "Simpan alamat". The fixed bottom navigation is drawn mid-page by the full-page capture (`tmp/evidence/M4-0.4.2/screenshots/alamat-baru-360.png`)
- The same at 1440 px (`tmp/evidence/M4-0.4.2/screenshots/alamat-baru-1440.png`)
- Editing "Kantor" at 360 and 1440 px: the saved text and "Lantai 2", the map after a tap, "Kec. Sukajadi, Kota Bandung" / "Masuk area layanan.", "Hapus alamat" and "Simpan alamat"; no location button because permission was cleared (`tmp/evidence/M4-0.4.2/screenshots/alamat-ubah-360.png`, `alamat-ubah-1440.png`)
- `/profil/alamat` at 360 and 1440 px: each card shows the address text, the details, then "Kec. …, kota" and the recipient; "Kos Adik" "Di luar area layanan" (`tmp/evidence/M4-0.4.2/screenshots/alamat-daftar-360.png`, `alamat-daftar-1440.png`)
- `/admin/pengaturan/area` at 360, 390 and 1440 px: the 44 px ⓘ folded, then open with the credits (`tmp/evidence/M4-0.4.2/screenshots/admin-area-peta-*.png`, `admin-area-peta-atribusi-*.png`)

## How it works

```text
/profil/alamat/baru or /:id/ubah → AddressForm (one page)
  "Nama jalan, gedung, no. rumah" = PlaceSearch (Autocomplete + TextField + TextArea, name=addressText)
    typing ≥ 3 chars, 400 ms pause → GET /tempat?q=&lat=&lng= (placeThrottle) → list under the field
    choose → field = place.fullName, setPinTarget(place) → PinPicker → movePinTo
  PinPicker: pin fixed in the centre; drag, tap, arrow keys, "Gunakan lokasi saya" → moveend
    each stop (centre changed) → GET /area/cek-titik (areaCheckThrottle) + GET /tempat/titik
      → street / kelurahan, Kec. kecamatan, kota + coverage line; form: setPin, clearErrors('lat','lng')
    hidden inputs lat, lng
→ submit POST/PUT → createAddressValidator (addressText ≥ 3, details optional ≤ 160) → AddressService
    → checkCoverage (outside: error on `lat`, shown under the map) → kecamatan, city
    → PlaceService.describePoint → street, kelurahan (null without osm)
    → save; the typed text and details are never rewritten
```

## Code tour

1. `database/migrations/1795500000000_create_customer_addresses_table.ts`: `address_text` (the address field), `details` (replaces `landmark`), `street`, `kelurahan`, `kecamatan`, `city`; `database/schema.ts` regenerated.
2. `database/seeders/customer_address_seeder.ts`: the old detail and landmark merged into the two fields.
3. `app/services/place_service.ts`: each place carries `fullName` ("Jalan Dipatiukur, Lebakgede, Coblong"), what a pick writes into the field.
4. `app/services/address_service.ts`: saves `details`; reads the area at the pin on every save.
5. `app/validators/address_validator.ts`, `start/validator.ts` (the address field's required message), `app/transformers/address_transformer.ts`.
6. `inertia/components/molecules/place_search.tsx`: the address textarea that is also the place search.
7. `inertia/components/organisms/pin_picker.tsx`: the notice, the map with the centre pin and location button, the area at the pin, the coverage line, `lat`/`lng`.
8. `inertia/components/organisms/service_area_map.tsx`, `inertia/lib/map/area_map.ts`: the pin map, credits on every map, the resize fix; `inertia/components/molecules/map_credits.tsx`: the 44 px ⓘ.
9. `inertia/pages/customer/addresses/form.tsx` (one page: Kontak, Alamat, Pengaturan), `index.tsx` (text, details, kecamatan and kota).
10. Tests: `tests/unit/place_service.spec.ts` (`fullName`), `tests/unit/address_service.spec.ts`, `tests/functional/addresses.spec.ts` (`details`), `tests/browser/addresses_flow.spec.ts` (rewritten for one page; pointer and keyboard picks; the refused-save test kept), `tests/browser/maps_flow.spec.ts`, `tests/helpers/screenshots.ts`.
11. Docs: `docs/ARCHITECTURE.md` (D109, D110; component notes), `docs/PLAN.md`, `CHANGELOG.md`, `package.json`, `package-lock.json`.

## Decisions & deviations

- D109 amended for 0.4.2: one page in the reference's order; `details` replaces `landmark`; the area fields read by the server on every save; the 44 px credits button; the resize loop fix.
- D110 amended for 0.4.2: the address textarea is the search (React Aria `Autocomplete`, because a combobox only takes a one-line input); a pick writes `fullName`; Enter still starts a new line.
- Workaround (comment in `place_search.tsx`): `Autocomplete` sends the field a `blur` when its virtual focus moves into the list; the field ignores a blur whose `relatedTarget` is inside the list, or the list would close before a press lands.
- Recipient name and WhatsApp stay, in a "Kontak" section at the top as in the reference: CUST-3 requires them and STAFF-7 calls the recipient.
- PRD conflict for the owner: CUST-3 says "address text, optional landmark"; the form now has "Detail lainnya (blok / unit no., patokan)" in the column `details`. The PRD wording is the owner's to update.
- "Merge existing data in the migration": before 1.0.0 the create migration is edited in place and the database rebuilt, so there is no data migration; the seeded addresses carry the merged text. A database with real addresses would need an `ALTER` migration instead.
- The full-screen map on a phone (allowed, not required) is not built; tapping the map moves the pin.
- The address field no longer lists nearby places when empty; `GET /tempat` without `q` stays.

## Known limitations / deferred

- Without OSM data the search says "Pencarian tempat belum tersedia. Atur pin di peta." and the status under the map shows only the kecamatan and kota.
- After a pick, typing the house number searches again ("Jalan Dipatiukur" before the first comma) and reopens the list until the field is left or Escape is pressed.
- Not checked on a real phone or with a tiles file (plain map background in tests).
- `tests/browser/settings_flow.spec.ts` waits for `networkidle`, which timed out twice under the full run's load during the rejected build; it passed in this run's `npm run check`.
