# M4b evidence: Place search and addresses

Date: 2026-11-24. Commits: d1d7109 for stop 1, cd01366 for stop 2 (+ uncommitted changes listed in each log header).

Two stops (owner, 2026-11-24): **stop 1** saved addresses with a map pin (confirmed and committed); **stop 2** place search, nearby places, the street label under the pin and version 0.4.0.

## Checklist

| Criterion (req ID) | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| CUST-2, CUST-3: at most 3 addresses, exactly one primary (database-enforced), deleting the primary promotes the newest; label, recipient name and phone, address text, landmark, pin | PASS | `node scripts/evidence_run.ts M4b cust2-address-service -- node ace test unit --files=tests/unit/address_service.spec.ts` | see below |
| CUST-14, AREA-4, D82: list, add, edit, make primary, delete; another customer's address is a 404; an outside pin is refused on save; the pin check answers by the server, 60/min per IP | PASS | `node scripts/evidence_run.ts M4b cust14-area4-routes -- node ace test functional --files=tests/functional/addresses.spec.ts` | see below |
| CUST-14, AREA-4, CUST-3 ("Gunakan lokasi saya"), D82: the journey in a browser at 360 and 1440 px, no horizontal scroll, no axe violation | PASS | `node scripts/evidence_run.ts M4b browser-addresses -- env EVIDENCE_MILESTONE=M4b node ace test browser --files=tests/browser/addresses_flow.spec.ts` | see below |
| CUST-2: the partial unique index exists; the development seed has customers with addresses, one outside the area (D82) | PASS | `node scripts/evidence_run.ts M4b schema-and-seed -- sh -c 'node ace db:seed && podman exec postgres psql … "\d customer_addresses" …'` | see below |
| General: `npm run check` (lint, typecheck, every test) with no deprecation warning | PASS | `node scripts/evidence_run.ts M4b check -- npm run check` | see below |
| MAP-1: search tolerant of spaces, typos and generic words; nearby places; the street label; without `osm` every method answers null | PASS | `node scripts/evidence_run.ts M4b map1-place-service-rerun -- node ace test unit --files=tests/unit/place_search.spec.ts --files=tests/unit/place_service.spec.ts` | see below |
| MAP-1, D80: signed-in only, 30/min per user with an Indonesian wait message, the label counted apart; without `osm` the search says it is unavailable | PASS | `node scripts/evidence_run.ts M4b map1-place-routes -- node ace test functional --files=tests/functional/places.spec.ts` | see below |
| MAP-1, NFR-4: in a browser, "dipati ukur" finds Jalan Dipatiukur, picking it moves the pin and names the street; without `osm` the pin is placed by hand; axe on the edit page and the delete dialog | PASS | `node scripts/evidence_run.ts M4b browser-addresses-search -- env EVIDENCE_MILESTONE=M4b node ace test browser --files=tests/browser/addresses_flow.spec.ts` | see below |
| MAP-1: the same SQL on the development `osm` data (12,235 roads) | PASS | `node scripts/evidence_run.ts M4b map1-dev-search -- sh -c "podman exec -i postgres psql -U user -d umimaclean_dev -q < <scratchpad>/dev_search.sql"` (the service's three queries with the pin and terms filled in) | see below |
| Version 0.4.0, every test of the milestone: `npm run check` | PASS | `node scripts/evidence_run.ts M4b check-0.4.0-rerun -- npm run check` | see below |

Excerpt for CUST-2, CUST-3 (`tmp/evidence/M4b/logs/cust2-address-service.log`):

```text
 PASSED 

Tests  8 passed (8)
```

Excerpt for CUST-14, AREA-4, D82 (`tmp/evidence/M4b/logs/cust14-area4-routes.log`):

```text
 PASSED 

Tests  13 passed (13)
```

The five log lines at level 40 in that log are the expected answers: four `"msg":"Row not found"` (another customer's address, D109) and one `"msg":"Terlalu banyak pengecekan. Coba lagi dalam 60 detik."` (the 61st pin check, D80).

Excerpt for the browser journey (`tmp/evidence/M4b/logs/browser-addresses.log` and `tmp/evidence/M4b/screenshots/*.log`):

```text
 PASSED 

Tests  3 passed (3)
```

```text
alamat-daftar-360: scrollWidth=360 axe=none
alamat-daftar-1440: scrollWidth=1440 axe=none
alamat-tambah-360: scrollWidth=360 axe=none
alamat-tambah-1440: scrollWidth=1440 axe=none
```

Excerpt for the schema and seed (`tmp/evidence/M4b/logs/schema-and-seed.log`):

```text
Indexes:
    "customer_addresses_pkey" PRIMARY KEY, btree (id)
    "customer_addresses_one_primary_per_user" UNIQUE, btree (user_id) WHERE is_primary
    "customer_addresses_user_id_index" btree (user_id)
Foreign-key constraints:
    "customer_addresses_user_id_foreign" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

   full_name    |  label   | is_primary | is_covered 
----------------+----------+------------+------------
 Rina Wulandari | Rumah    | t          | t
 Rina Wulandari | Kos Adik | f          | f
 Rina Wulandari | Kantor   | f          | t
 Dimas Prasetyo | Rumah    | t          | t
(4 rows)
```

Excerpt for `npm run check` (`tmp/evidence/M4b/logs/check.log`):

```text
> umimaclean@0.3.2 check
> node scripts/check.ts

ok   lint (27s)
ok   typecheck (9s)
ok   test (390s)

exit 0
```

Excerpt for MAP-1, the service (`tmp/evidence/M4b/logs/map1-place-service-rerun.log`):

```text
 PASSED 

Tests  8 passed (8)
 Time  176ms

exit 0
```

Excerpt for MAP-1, D80, the routes (`tmp/evidence/M4b/logs/map1-place-routes.log`):

```text
 PASSED 

Tests  7 passed (7)
 Time  806ms

exit 0
```

Excerpt for the search in a browser (`tmp/evidence/M4b/logs/browser-addresses-search.log` and `tmp/evidence/M4b/screenshots/*.log`):

```text
 PASSED 

Tests  5 passed (5)
 Time  23s

exit 0
```

```text
alamat-cari-360: results open scrollWidth=360
alamat-cari-1440: results open scrollWidth=1440
alamat-label-360: street label shown
alamat-label-1440: street label shown
```

Excerpt for the development data (`tmp/evidence/M4b/logs/map1-dev-search.log`):

```text
search dipati ukur
 kind |  id  |             name             |    lat     |     lng     | kelurahan  | kecamatan 
------+------+------------------------------+------------+-------------+------------+-----------
 road | 4860 | Jalan Dipatiukur             | -6.8851905 | 107.6137119 | Dago       | Coblong
 road | 4859 | Jalan Dipatiukur             | -6.8987211 | 107.6128372 | Lebak Gede | Coblong
 poi  | 5066 | Es Coklat Impian Dipati Ukur | -6.8895414 | 107.6162461 | Lebak Gede | Coblong
 road | 2771 | Jalan Adipati Ukur 1         | -7.0060595 | 107.6192084 |            | 
 poi  | 5206 | DayTrans Dipatiukur          | -6.8855429 | 107.6142058 | Lebak Gede | Coblong

Time: 18.391 ms
```

```text
label under the pin -6.881768, 107.61421
         street         | kelurahan 
------------------------+-----------
 Jalan Kidang Pananjung | Dago

Time: 0.458 ms
```

Excerpt for `npm run check` at 0.4.0 (`tmp/evidence/M4b/logs/check-0.4.0-rerun.log`; the first run, `check-0.4.0.log`, failed on three lint errors in `tests/unit/place_service.spec.ts`, fixed before this one):

```text
> umimaclean@0.4.0 check
> node scripts/check.ts

ok   lint (29s)
ok   typecheck (11s)
ok   test (412s)

exit 0
```

## Run & view

```sh
node ace migration:run
node ace db:seed
npm run dev
```

1. Sign in at `http://localhost:3333/masuk` as **Pelanggan 1** (`0821 1122 3344` / `password123`).
2. Profil → **Alamat** (`/profil/alamat`): Rumah (Utama), Kos Adik with "Di luar area layanan" (Cileunyi is off in the seed), Kantor with "Jadikan utama". The list is full (3), so "Tambah alamat" is hidden.
3. Kos Adik → **Ubah** → **Hapus alamat** → confirm. Then **Tambah alamat** (`/profil/alamat/baru`): drag the map or press the arrows; the line under the map says "Masuk area layanan: Kec. …" or "Di luar area layanan…" after each stop. "Gunakan lokasi saya" moves the map to the device (browsers allow it on `localhost`); refuse the permission and the button disappears.
4. Save: the list shows the new address. Edit one and tick "Jadikan alamat utama", or press "Jadikan utama" on the list.
5. Place search (stop 2) needs the `osm` schema (`docs/SETUP.md` Step 5): on an address form type "dipati ukur" in "Cari jalan atau tempat", pick "Jalan Dipatiukur"; the map jumps there and the street and kelurahan appear above the coverage line. Focus the empty field to list places near the pin. Without the schema the list says "Pencarian tempat belum tersedia. Geser peta untuk menaruh titik."
6. To see D82 live: as the owner, turn Coblong off on `/admin/pengaturan/area`; Rina's Rumah then shows "Di luar area layanan".

## Screens

- `/profil/alamat` at 360 px: three cards, Rumah with the "Utama" badge first, Kos Adik with the red "Di luar area layanan" note and only "Ubah", Kantor with "Ubah" and "Jadikan utama"; the bottom navigation overlaps the middle of the full-page capture because it is fixed (`tmp/evidence/M4b/screenshots/alamat-daftar-360.png`)
- `/profil/alamat` at 1440 px: the same three cards in two columns (`tmp/evidence/M4b/screenshots/alamat-daftar-1440.png`)
- `/profil/alamat/baru` at 360 px: label choice Rumah/Kantor/Lainnya, the fields stacked, the map (plain background, no tiles in tests) with the pin in the centre, four arrow buttons top left, the credit line, "Masuk area layanan: Kec. Coblong, Kota Bandung.", "Gunakan lokasi saya" and the full-width "Simpan alamat" (`tmp/evidence/M4b/screenshots/alamat-tambah-360.png`)
- `/profil/alamat/baru` at 1440 px: fields left and "Titik penjemputan" with the map right inside one card, "Simpan alamat" bottom right (`tmp/evidence/M4b/screenshots/alamat-tambah-1440.png`)
- `/profil/alamat/:id/ubah` at 360 px, stop 2: "Dipatiukur" typed in "Cari jalan atau tempat", the list under the field with "Jalan Dipatiukur" and "Hotel NEO Dipatiukur", each with "Lebakgede, Kec. Coblong", within the screen width; the delete button is now outline (`tmp/evidence/M4b/screenshots/alamat-cari-360.png`)
- the same at 1440 px: the list under the field in the right column over the map (`tmp/evidence/M4b/screenshots/alamat-cari-1440.png`)
- after picking at 360 px: "Jalan Dipatiukur" in the field, "Jalan Dipatiukur, Lebakgede" in bold above "Masuk area layanan: Kec. Coblong, Kota Bandung." (`tmp/evidence/M4b/screenshots/alamat-label-360.png`)
- the same at 1440 px (`tmp/evidence/M4b/screenshots/alamat-label-1440.png`)

The stop 1 screenshots above were taken again in the stop 2 run (the evidence runner never overwrites, so the old copies were removed first).

## How it works

**Saving an address** (`POST /profil/alamat`, `PUT /profil/alamat/:id`):

```text
form submit (label, recipientName, recipientPhone, addressText, landmark, lat, lng, isPrimary)
→ customer middleware (Bouncer accessCustomer)
→ AddressesController.store / update
→ createAddressValidator / updateAddressValidator (phone → 62…)
→ AddressService.createAddress / updateAddress
    → AreaService.checkCoverage(lat, lng)  — outside: validation error on `lat`
    → transaction: lock users row FOR UPDATE → count (max 3) → clear old primary if needed → save
→ redirect /profil/alamat with "Alamat disimpan." / "Alamat diperbarui."
```

**The list** (`GET /profil/alamat`): `AddressService.listAddresses` → `CustomerAddress` with the scopes `withCoverage` (`EXISTS` over active `service_areas` with `ST_Intersects`) and `primaryFirst` → `AddressTransformer` (`isCovered`) → `customer/addresses/index`.

**Make primary / delete** (`POST /profil/alamat/:id/utama`, `DELETE /profil/alamat/:id`): `AddressService.makeAddressPrimary` / `deleteAddress`, both in a transaction with the row lock; every lookup is `where user_id = me and id = :id` → `firstOrFail`, so someone else's address is a 404. Deleting the primary promotes the newest remaining one.

**The pin** (`organisms/pin_picker.tsx` → `organisms/service_area_map.tsx` → `lib/map/area_map.ts`): the map opens at the address (or Alun-alun Bandung) at zoom 17; the pin is drawn in the centre and the map moves under it. On MapLibre's `moveend`, `followPin` reports the centre; after 300 ms without movement the page asks `GET /area/cek-titik?lat=&lng=` (auth middleware, `areaCheckThrottle`) → `AreaCheckController.showPoint` → `checkPointValidator` → `AreaService.checkCoverage` → `{ isCovered, district }` → one line under the map. The centre is also written to the hidden `lat` and `lng` fields that the form submits. "Gunakan lokasi saya" calls `navigator.geolocation.getCurrentPosition`; the position only becomes `pin.target`, which `movePinTo` jumps to, and the normal check follows.

**Place search** (stop 2, `GET /tempat?q=&lat=&lng=`):

```text
typing pauses 400 ms (molecules/place_search.tsx)
→ auth middleware → placeThrottle (30/min per user, key places_<route>_<user>)
→ PlacesController.index → searchPlacesValidator (q ≥ 3 letters, optional)
→ PlaceService.searchPlaces: to_regclass('osm.roads') → null if missing
    → searchTerm drops generic words → SEARCH_SQL (roads + pois, compact LIKE or word_similarity,
      prefix first, then similarity, then distance; kelurahan and kecamatan from osm.areas)
→ { isAvailable, places: [{ id, name, detail, lat, lng }] }
→ the list; picking sets pin.target → movePinTo → moveend → pin check and label
```

Without `q` the same route lists nearby places (`findNearbyPlaces`); the page asks it only while the list is open. **The label** (`GET /tempat/titik?lat=&lng=`) runs with the pin check after each stop: `PlaceService.describePoint` → nearest road within 0.002° and the kelurahan → `{ street, kelurahan }` → one bold line above the coverage line, or nothing.

## Code tour

1. `database/migrations/1795500000000_create_customer_addresses_table.ts`: the table, the user index and the partial unique index for one primary.
2. `app/models/customer_address.ts`: `MAX_ADDRESSES`, the `primaryFirst` and `withCoverage` scopes.
3. `app/validators/address_validator.ts`: the create and update validators, the pin check validator.
4. `app/services/address_service.ts`: list, find (scoped), count, create, update, make primary, delete, the coverage check on save.
5. `app/transformers/address_transformer.ts`: address props with `isCovered`.
6. `app/controllers/addresses_controller.ts`: the five address routes and the map props (active district shapes, tiles).
7. `app/controllers/area_check_controller.ts`: `showPoint`, the pin check.
8. `start/routes.ts`, `start/limiter.ts`: the routes; the limiter comment names the pin check.
9. `inertia/lib/map/area_map.ts`: start at a pin, `followPin`, `movePinTo`, no fit-to-areas while placing a pin.
10. `inertia/components/organisms/service_area_map.tsx`: the optional centre pin and arrow buttons.
11. `inertia/components/organisms/pin_picker.tsx`: the server check line, hidden fields, "Gunakan lokasi saya".
12. `inertia/components/ui/toggle.tsx`, `ui/toggle_group.tsx`: shadcn CLI, renamed, `dark:` and the namespace import removed.
13. `inertia/pages/customer/addresses/index.tsx`, `form.tsx`: the list and the add/edit form with the delete dialog.
14. `inertia/pages/customer/profile/show.tsx`: the "Alamat" link card.
15. `database/seeders/customer_address_seeder.ts`, `database/seeders/main/index_seeder.ts`: demo addresses, after the service areas.
16. `tests/unit/address_service.spec.ts`, `tests/functional/addresses.spec.ts`, `tests/browser/addresses_flow.spec.ts`.
17. `database/schema.ts` and `.adonisjs/`: generated.
18. Stop 2: `app/helpers/place_search.ts` (`searchTerm`), `app/services/place_service.ts` (three SQL queries, availability check), `app/validators/place_validator.ts`, `app/controllers/places_controller.ts`, `start/limiter.ts` (`placeThrottle`), `start/routes.ts`.
19. `inertia/components/ui/combobox.tsx` (shadcn CLI, trimmed to input, popover, list, item, empty state; namespace import and `dark:` removed), `inertia/components/molecules/place_search.tsx`, `inertia/components/organisms/pin_picker.tsx` (the label), `inertia/pages/customer/addresses/form.tsx` (outline delete button).
20. `tests/helpers/osm.ts` (schema and rows in a test's transaction), `tests/unit/place_search.spec.ts`, `tests/unit/place_service.spec.ts`, `tests/functional/places.spec.ts`, two tests added to `tests/browser/addresses_flow.spec.ts`.
21. `CHANGELOG.md` (0.4.0, including M4a's unreleased entries), `package.json`, `package-lock.json`; `docs/SETUP.md` (what the `osm` schema feeds).

## Decisions & deviations

- **D109** (new): the table, the row lock, live coverage for D82, ownership by scoped lookup (404), the pin check endpoint for every signed-in role under the 60/min per IP limit, "Gunakan lokasi saya" as a helper that only moves the map, `isDisabled` instead of `isPending`.
- PRD CUST-3 names "Gunakan lokasi saya" (asked by the owner; first written into CUST-2, moved to CUST-3 at the stop 1 review); PLAN's M4b criteria list it and the two stops.
- The table is `customer_addresses`, the name in PRD §12, although the request said `addresses`.
- Labels: "Rumah", "Kantor" and "Lainnya" (a typed label), as CUST-3 says.
- `docs/ARCHITECTURE.md` §3 planned a `CustomerAddressPolicy`; the scoped lookup replaces it (D109).
- The unit test seeds inside its global transaction: seeding before it committed the demo accounts and broke later unit files that expect an empty database (`demo_accounts.spec.ts`, `price_list_service.spec.ts`).
- **D110** (new, stop 2): the search queries and their ranking, generic words, the availability check instead of catching errors, one count of 30/min per user for each endpoint, picking only moves the map, the test fixture inside the transaction.
- Stop 1 review: "Gunakan lokasi saya" moved to CUST-3; the pin check keeps the shared 60/min per IP limit.
- Stop 1 fix found by axe in stop 2: the edit page's "Hapus alamat" used the `destructive` button variant, 4.28:1 on the page background (needs 4.5:1); it is `outline` now, and the browser test checks the edit page and the delete dialog. Stop 1 had checked only the list and the add page.
- The search field does not fill "Alamat lengkap"; the customer types the house number and RT/RW anyway (D110).

## Known limitations / deferred

- Refusing an address outside the area when ordering is M5a (D82, CUST-6).
- The headless browser test cannot show the permission prompt; it covers a granted position (inside and outside the area) and a refused one.
- Tests run without a tiles file, so the screenshots show the plain map background (MAP-2).
- Search results include roads and places outside the service areas (the data covers Bandung Raya plus 5 km); picking one shows "Di luar area layanan" and saving is refused.
- Places without a kelurahan in OSM show no detail line, or only the kecamatan.
