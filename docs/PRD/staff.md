# Staff

3–4 people, all equal: every staff member does courier trips and shop work, sees the same queues, and has their own account. Staff screens are designed for a phone. Bottom navigation: **Beranda, Jemput, Proses, Antar, Lainnya**. The owner can use every staff screen too.

---

## 1. Sign-in and home (`STAFF`)

- **STAFF-1** **Sign in** at `/staf/masuk` (ACC-3). Only staff and owner accounts are accepted; customers are pointed to `/masuk`. Each sign-in updates the account's last-seen time and is written to the activity log. After sign-in: staff go to the staff home, the owner to the owner summary.
- **STAFF-2** **Home** (`/staf`): counts per queue (pickups, workshop, deliveries) and the next thing to do.

## 2. Courier trips

- **STAFF-3** Two queues: **Jemput** (orders `awaiting_pickup`) and **Antar** (orders `ready_for_delivery`). There is **one active trip per queue at a time for the whole team**: while someone has an active pickup, no one can start another pickup until it is finished or skipped (same for deliveries). Every staff member sees who holds the active trip; only that staff member or the owner can finish or skip it. If the owner cancels that order, the trip ends (`owner.md` OWN-3).
- **STAFF-4** Trip steps:
  - **start** → `courier_en_route` (pickup, sends the "courier on the way" message) or `in_delivery` (delivery);
  - **arrived** → only logged;
  - **finish** with a **required proof photo** (PHOTO-1): pickup → `picked_up`; delivery → `completed`, with the name of who received it;
  - **skip** with a reason from STAFF-5 and an optional note → back to `awaiting_pickup` / `ready_for_delivery`; the reason appears on the timeline.
- **STAFF-5** Skip reasons: "Pelanggan tidak bisa dihubungi (±15 menit)", "Pelanggan tidak ada di lokasi", "Jalan ditutup / masalah rute", "Lokasi tidak bisa diakses", "Kendaraan bermasalah", "Lainnya".
- **STAFF-6** **Queue order**: the pickup queue keeps its blocks (overdue dates first, then each date and slot in order) and orders the stops inside each block nearest first by road travel time (OSRM, motorbike profile, no toll roads); the delivery queue is nearest first as a whole. Stops skipped today go last. **Each staff member sees the queue ordered from their own position** when their device shares GPS, otherwise from the shop; a staff member's plan is recomputed only when a stop is finished or skipped or the queue's orders change. Without OSRM, the scheduled order is shown with "Urutan belum dioptimasi".
- **STAFF-7** The **active trip** shows a map with the route line and distance/ETA, call and WhatsApp buttons for the recipient, the order's note, the declared items (pickup) or inspected items (delivery), and a button that opens navigation in **Google Maps or Waze** (the choice is remembered on the device). Without OSRM, distance and time are estimates marked "±".

## 3. Workshop

- **STAFF-8** **Workshop queue** (`/staf/proses`): orders waiting for inspection, payment, washing and collection, oldest first.
- **STAFF-9** **Inspection** (`/staf/proses/:id/periksa`): starting it moves `picked_up → in_inspection`. For an online order the list starts from the customer's declared items (CUST-5); staff correct them, add items the customer forgot and remove items that weren't handed over, and the declared list stays visible on the order for comparison. For a walk-in the list starts empty. Each item has kind, name such as "Nike Air Force 1 putih", size and condition note, and, per item, exactly one active main service and up to 10 active add-ons that match its kind (SVC-2). For a service flagged "mulai dari" staff may raise the price for that item (never below the listed price); the bill shows the charged price and the activity log records the change. 1–60 items per order. Saving creates the bill (SVC-3), moves the order to `awaiting_payment`, and sends the "bill" message for online orders. Re-inspecting before payment replaces the bill.
- **STAFF-10** **Washing** (`/staf/proses/:id/cuci`): finishing requires a **proof photo**; items are marked washed and the order moves to `ready_for_delivery` or `ready_for_collection` by its return method.
- **STAFF-11** **Collection**: handing items over at the shop moves `ready_for_collection → completed`. Staff can print a **label** for an order (`/staf/cetak/:id/label`) and a **receipt** after payment (`/staf/cetak/:id/struk`) on a small-printer page.

## 4. Walk-in orders

- **STAFF-12** **New walk-in** (`/staf/transaksi`): staff enter the customer's phone; if it belongs to a customer account, the name and primary address are filled in, otherwise staff type the name (`guest.md` GUEST-7). Then: count per kind (helmets allowed), return method (collect at store, or delivery to the saved primary address or to a typed address with a pin inside an active area, AREA-4), optional note, and **1–3 intake photos taken once at reception** (PHOTO-1).
- **STAFF-13** Saving creates the order at `in_inspection` and sends **no** message yet. Inspection then works like any order (STAFF-9).
- **STAFF-14** **Counter payment** (`/staf/transaksi/:id/bayar`): walk-ins pay right away, by **cash** (cash received and change shown) or by **QRIS shown on the counter screen** (PAY-1, PAY-2), whichever methods are switched on (PAY-5). When the payment is complete the "order received" message is sent (MSG-1). No payment link, no reminders.
- **STAFF-15** An unsent walk-in form survives a page reload on that device.

## 5. More

- **STAFF-16** **History** (`/staf/riwayat`): the staff member's own work of the last 7 days. **Profile** (`/staf/profil`): account security (ACC-4). **More** (`/staf/lainnya`): links to history, profile, the map-app preference and sign-out.

## 6. Pages

| Page                                | URL                                                                 |
| ----------------------------------- | ------------------------------------------------------------------- |
| Sign in                             | `/staf/masuk`                                                       |
| Home                                | `/staf`                                                             |
| Pickup queue, active pickup         | `/staf/jemput`, `/staf/jemput/tugas`                                |
| Delivery queue, active delivery     | `/staf/antar`, `/staf/antar/tugas`                                  |
| Workshop queue, inspection, washing | `/staf/proses`, `/staf/proses/:id/periksa`, `/staf/proses/:id/cuci` |
| Walk-in, counter payment            | `/staf/transaksi`, `/staf/transaksi/:id/bayar`                      |
| Print label, receipt                | `/staf/cetak/:id/label`, `/staf/cetak/:id/struk`                    |
| More, history, profile              | `/staf/lainnya`, `/staf/riwayat`, `/staf/profil`                    |
