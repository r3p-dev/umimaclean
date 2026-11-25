# M5a evidence: Online ordering (stop 1: backend; stop 2: order pages)

Date: 2026-11-25. Commit: 351979e (0.4.2) + stop 1 + cleanup + stop 2.

## Checklist

| Criterion (req ID) | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| ORD-2, ORD-3: the state machine in one table (`ORDER_TRANSITIONS`) and one writer (`OrderService.transitionOrder`), unit-tested over every status pair (121); a refused pair is a 409 with an Indonesian message and writes nothing; a change appends its event (ORD-4) and, by staff, an activity log entry; ORD-1: `UMC-00042` | PASS | `node scripts/evidence_run.ts M5a state-machine -- node ace test unit --files=tests/unit/order_status.spec.ts` | see below |
| CUST-6, CUST-4, SLOT-1, SLOT-3, AREA-4, MSG-1.1, MSG-3: placing starts at `awaiting_pickup` with copies of both addresses, the items, the slot's times and the first event; later address edits never change it; a full slot is refused, a cancelled order frees its place and a skipped pickup keeps it; dates outside tomorrow to 7 days ahead, Sundays, switched-off slots and other weekdays are refused; both addresses re-checked against the active areas; another customer's address is not found; a double submit makes one order and one message; a crashing message never fails the order; two customers taking the last place at once make one order | PASS | `node scripts/evidence_run.ts M5a placing -- node ace test unit --files=tests/unit/order_service.spec.ts` | see below |
| SLOT-3: the concurrency test fails without the slot row lock (`.forUpdate()` removed for this run only, then restored) | PASS (the run failed as expected) | `node scripts/evidence_run.ts M5a concurrency-test-fails-without-lock -- node ace test unit --files=tests/unit/order_service.spec.ts --tests="two customers taking the last place at once make one order"` | see below |
| SLOT-1, SLOT-3, decision 1: pickup dates from tomorrow to 7 days ahead without closed days; a date's slots count the places taken (cancelled orders excluded) and mark full or switched-off slots; a slot with a pending pickup cannot be deleted, re-timed or copied over, only switched off or resized, also through `PUT /admin/pengaturan/slot/:weekday` | PASS | `node scripts/evidence_run.ts M5a slots -- sh -c 'node ace test unit --files=tests/unit/pickup_slot_service.spec.ts && node ace test functional --files=tests/functional/pickup_slots.spec.ts'` | see below |
| CUST-5, SVC-4, decision 2: the draft's rules (1 to 20 shoes and 20 bags, no helmets, type required, brand optional, EU sizes 20–50 in half steps, bag S/M/L/XL, note ≤ 300) with Indonesian messages; MSG-1.1 text; MSG-4 log driver unchanged | PASS | `node scripts/evidence_run.ts M5a draft-and-message -- node ace test unit --files=tests/unit/order_validator.spec.ts --files=tests/unit/order_messages.spec.ts --files=tests/unit/whatsapp_service.spec.ts` | see below |
| Found while chasing a flaky test: the edit page's coverage check sent the whole saved address in its URL (D109 note); now only `lat` and `lng`, asserted by the browser test, which fails on the old code | PASS | `node scripts/evidence_run.ts M5a check-url-test-fails-on-old-code -- node ace test browser --files=tests/browser/addresses_flow.spec.ts --tests="editing an address keeps its text and moves only the pin (CUST-3, D109)"` (old line restored for this run only), then `node scripts/evidence_run.ts M5a browser-addresses-maps -- node ace test browser --files=tests/browser/addresses_flow.spec.ts --files=tests/browser/maps_flow.spec.ts` | see below |
| Seed data: a demo order in every ORD-2 status with its timeline along ORD-3 and both address copies | PASS | `node scripts/evidence_run.ts M5a schema-and-seed -- sh -c 'node ace migration:fresh --seed && npx prettier --write database/schema.ts && podman exec postgres psql -U user -d umimaclean_dev -c "SELECT … FROM orders …" -c "SELECT kind, count(*) FROM order_addresses GROUP BY kind ORDER BY kind" -c "\d orders"'` | see below |
| Cleanup before stop 2: `GET /tempat/titik` removed; flaky refused-save browser test fixed (waits for `CoverageStatus` to settle before clicking `Simpan alamat` so the two-line status does not shift the button mid-click); `npm run check` passes twice in a row | PASS | `npm run check && npm run check` | ok (31s+11s+434s), ok (33s+11s+438s) |
| Stop 2 (CUST-5, CUST-6, SLOT-3, AREA-4, ORD-1): `/pesan`, `/pesan/konfirmasi`, session draft, "Ubah pesanan", "Pesan lagi" (`/pesan?ulang=:id`), `requestKey` on confirm, redirect to `/beranda` with `"Pesanan UMC-000XX diterima"`, 360/1440 px screenshots and axe | PASS | `node scripts/evidence_run.ts M5a stop2-orders-7 -- sh -c 'node ace test functional --files=tests/functional/orders.spec.ts && EVIDENCE_MILESTONE=M5a node ace test browser --files=tests/browser/orders_flow.spec.ts'` | see below |
| Lint, typecheck and every test: `npm run check` | PASS (stop 2) | `node scripts/evidence_run.ts M5a check-stop2-2 -- npm run check` | see below |

Excerpt for the state machine (`tmp/evidence/M5a/logs/state-machine.log`):

```text
✔✔✔✔✔❯ Reverted 15 migrations (73 ms)
Tests  5 passed (5)
exit 0
```

Excerpt for placing (`tmp/evidence/M5a/logs/placing.log`):

```text
✔✔❯ Reverted 15 migrations (80 ms)
Tests  9 passed (9)
exit 0
```

Excerpt for the test without the lock (`tmp/evidence/M5a/logs/concurrency-test-fails-without-lock.log`, ANSI colour codes removed):

```text
ℹ AssertionError: expected [ 'fulfilled', 'fulfilled' ] to deeply equal [ 'fulfilled', 'rejected' ]
Tests  1 failed (1)
exit 1
```

Excerpt for the slots (`tmp/evidence/M5a/logs/slots.log`): the unit run, then the functional run.

```text
Tests  8 passed (8)
Tests  8 passed (8)
exit 0
```

Excerpt for the draft and the message (`tmp/evidence/M5a/logs/draft-and-message.log`):

```text
Tests  9 passed (9)
exit 0
```

Excerpt for the check URL on the old code (`tmp/evidence/M5a/logs/check-url-test-fails-on-old-code.log`, ANSI colour codes removed, cut at 260 characters):

```text
ℹ AssertionError: http://localhost:3334/area/cek-titik?id=2&label=Kantor&recipientName=Rina%20Wulandari&recipientPhone=6282111223344&addressText=Jalan%20Mulya%20Sari%20No.%20120%2C%20Sukagalih%2C%20Sukajadi&details=Lantai%202&lat=-6.889265&lng=107.588769&stree
Tests  1 failed (1)
```

With the fix (`tmp/evidence/M5a/logs/browser-addresses-maps.log`):

```text
Tests  8 passed (8)
exit 0
```

Excerpt for the seed (`tmp/evidence/M5a/logs/schema-and-seed.log`, the timeline column cut at 160 characters):

```text
  1 | Rina Wulandari | awaiting_pickup      | 2026-11-26  | 09:00–12:00 | awaiting_pickup
  2 | Dimas Prasetyo | courier_en_route     | 2026-11-25  | 09:00–12:00 | awaiting_pickup > courier_en_route
  3 | Rina Wulandari | picked_up            | 2026-11-21  | 09:00–12:00 | awaiting_pickup > courier_en_route > picked_up
  4 | Dimas Prasetyo | in_inspection        | 2026-11-19  | 09:00–12:00 | awaiting_pickup > courier_en_route > picked_up > in_inspection
  5 | Rina Wulandari | awaiting_payment     | 2026-11-17  | 09:00–12:00 | awaiting_pickup > courier_en_route > picked_up > in_inspection > awaiting_payment
  6 | Dimas Prasetyo | in_cleaning          | 2026-11-14  | 09:00–12:00 | awaiting_pickup > courier_en_route > picked_up > in_inspection > awaiting_payment > in
  7 | Rina Wulandari | ready_for_delivery   | 2026-11-13  | 09:00–12:00 | awaiting_pickup > courier_en_route > picked_up > in_inspection > awaiting_payment > in
  8 | Dimas Prasetyo | in_delivery          | 2026-11-11  | 09:00–12:00 | awaiting_pickup > courier_en_route > picked_up > in_inspection > awaiting_payment > in
  9 | Rina Wulandari | ready_for_collection | 2026-11-09  | 09:00–12:00 | awaiting_pickup > courier_en_route > picked_up > in_inspection > awaiting_payment > in
 10 | Rina Wulandari | completed            | 2026-11-07  | 09:00–12:00 | awaiting_pickup > courier_en_route > picked_up > in_inspection > awaiting_payment > in
 11 | Dimas Prasetyo | cancelled            | 2026-11-05  | 09:00–12:00 | awaiting_pickup > cancelled
 delivery |    11
 pickup   |    11
exit 0
```

Excerpt for `npm run check` (`tmp/evidence/M5a/logs/check-2.log`; the test count from `tmp/check/test.log`: `Tests  344 passed (344)`):

```text
ok   lint (30s)
ok   typecheck (10s)
ok   test (427s)

exit 0
```

Excerpt for `npm run check` after stop 2 (`tmp/evidence/M5a/logs/check-stop2-2.log`):

```text
ok   lint (34s)
ok   typecheck (12s)
ok   test (437s)

exit 0
```

The first run (`tmp/evidence/M5a/logs/check.log`) failed on one test, `tests/browser/addresses_flow.spec.ts` "a save refused for a pin outside the area clears once the pin moves inside", which waited 30 s for the refused-save error after "Simpan alamat": `Tests  343 passed, 1 failed (344)`. The same test failed once in the 0.4.2 evidence. The cause is not found: in six runs of the address and map files in a row and in the second full run it passed. Instrumented runs ruled out a map move after load and a Vite reload. They found the URL leak fixed above, which does not explain the failure. The 1 cm tolerance added in 0.4.2 did not fix it.

## Run & view

```sh
node ace migration:fresh --seed   # four new create migrations
npm test -- --files=tests/unit/order_status.spec.ts --files=tests/unit/order_service.spec.ts
podman compose --profile tools run --rm psql -c "SELECT id, status, pickup_date FROM orders ORDER BY id"
```

There is no page yet: the order pages are stop 2. The seeded orders appear in the database only.

## Screens

- `/pesan` at 360 px: item rows (shoe + bag), saved address radio cards (with "Alamat pengantaran sama dengan penjemputan"), pickup date and slot selectors, note field, and the fixed bottom "Lanjut ke Konfirmasi" bar (`tmp/evidence/M5a/screenshots/pesan-360.png`).
- `/pesan` at 1440 px: same order form in `FlowLayout` with inline "Lanjut ke Konfirmasi" button and `19/300` note counter (`tmp/evidence/M5a/screenshots/pesan-1440.png`).
- `/pesan/konfirmasi` at 360 px: summary cards for items, schedule, pickup/delivery address, customer contact, inspection note, and fixed bottom "Buat Pesanan" bar (`tmp/evidence/M5a/screenshots/pesan-konfirmasi-360.png`).
- `/pesan/konfirmasi` at 1440 px: same confirmation summary in `FlowLayout` with "Ubah" links per section and inline "Buat Pesanan" button (`tmp/evidence/M5a/screenshots/pesan-konfirmasi-1440.png`).

Screenshot check (`tmp/evidence/M5a/screenshots/orders.log`):

```text
pesan-360: scrollWidth=360 axe=none
pesan-1440: scrollWidth=1440 axe=none
pesan-konfirmasi-360: scrollWidth=360 axe=none
pesan-konfirmasi-1440: scrollWidth=1440 axe=none
```

Excerpt for stop 2 (`tmp/evidence/M5a/logs/stop2-orders-7.log`):

```text
browser / Online ordering flow (CUST-5, CUST-6) (tests/browser/orders_flow.spec.ts)
❯ Executed 1 seeders
  ✔ customer fills /pesan, keeps values after Ubah, confirms, and lands on /beranda (CUST-5, CUST-6) (6s)
❯ Executed 1 seeders
  ✔ Pesan lagi prefills items from a past order (CUST-5) (1s)
❯ Reverted 15 migrations (92 ms)

 PASSED 

Tests  2 passed (2)
 Time  7s

exit 0
```

## How it works

```text
(stop 2) POST /pesan/konfirmasi → createOrderValidator → OrderService.placeOnlineOrder(user, draft, requestKey)
  same requestKey already placed? → return that order
  AddressService.findAddressOf (pickup, delivery; another customer's → 404)
  AreaService.checkCoverage for both → error on pickupAddressId / deliveryAddressId
  PickupSlotService.listPickupDates(now) contains the date? → else error on pickupDate
  transaction:
    SELECT pickup_slots … FOR UPDATE            (others placing in this slot wait here)
    same requestKey placed meanwhile? → return it
    slot on, same weekday as the date? → else error on pickupSlotId
    PickupSlotService.countTakenPlaces (every status but cancelled) < capacity? → else "Slot ini sudah penuh"
    INSERT orders (awaiting_pickup, slot times copied) + order_addresses ×2 + order_items + order_events
  after commit: WhatsAppService.sendMessage(phone, "Halo …, pesanan UMC-… sudah kami terima. Penjemputan: …", 'order_received')
    a throw is caught and logged (MSG-3); without a token the text goes to the log (MSG-4)

Any later status change → OrderService.transitionOrder(order, status, { actor, note }, transaction)
  SELECT orders … FOR UPDATE → ORDER_TRANSITIONS allows it? → else 409 "Pesanan UMC-… tidak bisa diubah dari … ke …"
  UPDATE status, INSERT order_events, INSERT activity_logs when the actor is staff or owner

PUT /admin/pengaturan/slot/:weekday → PickupSlotService.replaceDay
  SELECT the day's slots … FOR UPDATE → a deleted or re-timed slot with a pending pickup from today on? → error on slots
```

## Code tour

1. `app/enums/order_status_enum.ts`: statuses, labels, stages, `ORDER_TRANSITIONS` (ORD-3), `PICKUP_PENDING_STATUSES`; `app/enums/order_address_kind_enum.ts`, `app/enums/bag_size_enum.ts`.
2. `database/migrations/1795600000000_create_orders_table.ts` to `…0003_create_order_events_table.ts`: the four tables and their header notes; `database/schema_rules.ts` types their enum columns; `database/schema.ts` regenerated.
3. `app/models/order.ts`: `number()`, `canTransitionTo`, scopes `holdingSlotPlace` and `pickupPending`, relations; `order_address.ts`, `order_item.ts`, `order_event.ts`.
4. `app/validators/order_validator.ts` and the messages in `start/validator.ts`.
5. `app/services/pickup_slot_service.ts`: `listPickupDates`, `listSlotsForDate`, `countTakenPlaces`, the decision 1 guard in `replaceDay` and `copyDay`.
6. `app/services/order_service.ts`: `transitionOrder`, `placeOnlineOrder`, the message after commit.
7. `inertia/pages/customer/addresses/form.tsx`: the pin state holds only `lat` and `lng` (the URL fix), with its assertion in `tests/browser/addresses_flow.spec.ts`.
8. `app/helpers/order_messages.ts` (MSG-1.1 text), `app/helpers/validation.ts` (`fieldError`, moved from `address_service.ts`), `app/helpers/opening_hours.ts` (exports `ZONE` and `displayTime`), `app/services/whatsapp_service.ts` (message kind for the log line).
9. `database/seeders/order_seeder.ts` and its place in `database/seeders/main/index_seeder.ts`.
10. Tests: `tests/unit/order_status.spec.ts`, `tests/unit/order_service.spec.ts`, `tests/unit/order_validator.spec.ts`, `tests/unit/order_messages.spec.ts`, `tests/unit/pickup_slot_service.spec.ts` (new group), `tests/functional/pickup_slots.spec.ts` (the guard through the route), `tests/helpers/fake_whatsapp_service.ts` (records the kind).
11. Docs: `docs/ARCHITECTURE.md` (§3.1 table, D111–D113), `docs/PLAN.md`, `docs/PRD/shared.md` (MAP-1, owner's request), `CHANGELOG.md`.

## Decisions & deviations

- D111: the order tables, `transitionOrder`, and placing with the slot row lock, the `request_key` and the message after commit.
- D112: decision 1 (slots with pending pickups) in `replaceDay` and `copyDay`.
- D113: demo orders in development only; the message kind in the log; `fieldError` shared.
- D114: `/pesan` and `/pesan/konfirmasi` in `FlowLayout` with server session draft, `requestKey` in confirmation form, fixed bottom CTA on phones, `?dari=pesan` return path on address creation, `Pesan` in customer navigation and `/beranda`.
- Flaky test root cause (resolved before stop 2): in `tests/browser/addresses_flow.spec.ts`, clicking `Simpan alamat` immediately after `.maplibregl-canvas` mounted raced with `usePinCheck`'s 300 ms timer updating `CoverageStatus` from one line ("Mengecek area…") to two lines ("Di luar area layanan…"), shifting the submit button mid-click so React Aria's `onPress` did not fire. Waiting for `CoverageStatus` to settle before clicking `Simpan alamat` made the test deterministic across two consecutive full `npm run check` runs.
- `GET /tempat/titik` removed before stop 2 (route, `PlacesController.show`, rate-limit comment, functional test assertions, docs); `PlaceService.describePoint` remains for `AddressService` on save.
- The first status is written together with the order, not through `transitionOrder` (there is no "from" status); every later change goes through it.
- `ORDER_TRANSITIONS` holds the owner's cancellation from every non-final status; who may cancel is checked by the cancelling methods (M5b, M10a).
- The owner's example "Kamis, 27 Nov 2026" names the wrong weekday (27 November 2026 is a Friday); the text uses the real weekday.
- Tests that place orders use a fixed "now" of Monday 7 January 2030, so their dates never meet real orders.

## Known limitations / deferred

- The slot settings page does not show how many places are taken per date.
- The order link in the message comes with the order page (M5b, decision 4).
