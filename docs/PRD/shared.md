# Shared rules

Rules that more than one role depends on. The role files (`guest.md`, `customer.md`, `staff.md`, `owner.md`) describe the screens and actions and refer back here by ID.

---

## 1. Services and prices (`SVC`)

- **SVC-1** A service has: name, type (`main` or `addon`), the item kinds it applies to, price (whole rupiah), a "starting from" flag (shown as "mulai dari"), estimated working days, a short Indonesian description, an active flag and a display position. The owner manages the list (`owner.md` OWN-7).
- **SVC-2** Inactive services are hidden from staff during inspection but stay on the owner's list. Removing a service is a soft delete, so old bills keep pointing at it.
- **SVC-3** A bill copies each service's name and price at inspection time. Later changes never change an existing bill.
- **SVC-4** **Helmet services are shop-only.** An online order can never contain helmets.
- **SVC-5** The initial price list (seeded):

| Name                           | Type  | Kinds  |       Price (Rp) |  Days | Starting from |
| ------------------------------ | ----- | ------ | ---------------: | ----: | :-----------: |
| Mild                           | main  | shoe   |           60.000 |     3 |               |
| Medium                         | main  | shoe   |           65.000 |     3 |               |
| Hard                           | main  | shoe   |           70.000 |     4 |               |
| Premium for Suede              | main  | shoe   |          120.000 |     5 |       ✓       |
| Kids Shoes                     | main  | shoe   |           40.000 |     3 |       ✓       |
| Just for Her                   | main  | shoe   |           45.000 |     3 |               |
| Premium Repaint                | main  | shoe   |          150.000 |     7 |       ✓       |
| Midsole Repaint / Recolour     | main  | shoe   |          180.000 |     7 |               |
| Unyellowing                    | addon | shoe   |           30.000 |     2 |       ✓       |
| Sepatu putih / mummy           | addon | shoe   |           10.000 |     0 |               |
| Nubuck / suede                 | addon | shoe   |           10.000 |     0 |               |
| One Day Service                | addon | shoe   |           10.000 |     0 |               |
| Tas Small · kanvas / · kulit   | main  | bag    |  40.000 / 60.000 | 3 / 4 |               |
| Tas Medium · kanvas / · kulit  | main  | bag    |  55.000 / 75.000 | 3 / 4 |               |
| Tas Large · kanvas / · kulit   | main  | bag    |  70.000 / 85.000 | 4 / 5 |               |
| Tas X-Large · kanvas / · kulit | main  | bag    | 85.000 / 100.000 | 5 / 5 |               |
| Helmet Spa Reguler             | main  | helmet |           35.000 |     2 |               |
| Helmet Spa Premium             | main  | helmet |           70.000 |     3 |               |

Bag rows are two services each (kanvas and kulit). Sizes: Small < 25 cm, Medium < 35 cm, Large < 60 cm, X-Large > 60 cm.

## 2. Service areas (`AREA`)

- **AREA-1** Service areas are the BPS kecamatan of **Kota Bandung, Kota Cimahi and Kabupaten Bandung** (nothing else is seeded), stored as polygons from a licensed public boundary dataset. Source, license, date and processing are documented, and the license credit is shown on every page with a pin map.
- **AREA-2** Initially active: all of Kota Bandung and Kota Cimahi, plus Margaasih, Margahayu, Dayeuhkolot, Bojongsoang, Baleendah, Katapang, Soreang, Pameungpeuk, Banjaran and Cangkuang in Kabupaten Bandung. The other kecamatan of Kabupaten Bandung (including Cilengkrang) start inactive.
- **AREA-3** The owner switches each kecamatan on or off (`owner.md` OWN-9). The change applies immediately to every pin check. Orders already placed are not re-checked.
- **AREA-4** Every pin is checked against active areas: saving an address, reviewing and placing an online order (saved addresses are re-checked), and a walk-in delivery address. While someone moves a pin, the map shows instant inside/outside feedback.

## 3. Maps (`MAP`)

- **MAP-1** Address search, the nearby-places list and the street label under a pin come from **our own OpenStreetMap data in PostgreSQL** (roads, named places, kelurahan and postcodes for the Bandung Raya extent). Search tolerates typos and spacing differences ("dipati ukur" finds "Jalan Dipatiukur") and ignores generic words like "jalan", "gang", "komplek". It is available to signed-in users only. If the data is missing, the pin can still be placed by hand.
- **MAP-2** Maps use **self-hosted** vector tiles; the browser contacts no map provider. "© OpenStreetMap contributors" is shown on every map. Without the tile file, maps show a plain background and pins and routes still work.

## 4. Pickup schedule (`SLOT`)

- **SLOT-1** A pickup date is **tomorrow up to 7 days ahead**, never Sunday (Asia/Jakarta).
- **SLOT-2** Each day has the owner's pickup slots, each with a label, a capacity (1–20) and an on/off switch. Defaults: `09.00–12.00` (6), `12.00–15.00` (6), `15.00–18.00` (4).
- **SLOT-3** A full or switched-off slot can't be chosen. Capacity is re-checked when the order is placed, safely under concurrency (two customers can't both take the last place).

## 5. Orders (`ORD`)

- **ORD-1** Order number shown as **`UMC-00042`** (the id, zero-padded). The order page URL is `/pesanan/:id` for everyone; who can open it is defined in `customer.md` CUST-7 and `guest.md` GUEST-4.
- **ORD-2** Statuses (code → UI label → stage):

| Status                 | Label                | Stage   |
| ---------------------- | -------------------- | ------- |
| `awaiting_pickup`      | Menunggu Penjemputan | jemput  |
| `courier_en_route`     | Kurir Menuju Lokasi  | jemput  |
| `picked_up`            | Barang Kami Terima   | periksa |
| `in_inspection`        | Sedang Diperiksa     | periksa |
| `awaiting_payment`     | Menunggu Pembayaran  | bayar   |
| `in_cleaning`          | Dalam Pencucian      | cuci    |
| `ready_for_delivery`   | Siap Diantar         | antar   |
| `in_delivery`          | Sedang Diantar       | antar   |
| `ready_for_collection` | Siap Diambil         | antar   |
| `completed`            | Selesai              | selesai |
| `cancelled`            | Dibatalkan           | batal   |

- **ORD-3** Allowed transitions (nothing else is possible):

| From                   | To                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `awaiting_pickup`      | `courier_en_route`, `cancelled`                                                     |
| `courier_en_route`     | `picked_up`, `awaiting_pickup` (skipped)                                            |
| `picked_up`            | `in_inspection`                                                                     |
| `in_inspection`        | `awaiting_payment`                                                                  |
| `awaiting_payment`     | `in_cleaning` (paid)                                                                |
| `in_cleaning`          | `ready_for_delivery` (return by delivery), `ready_for_collection` (return at store) |
| `ready_for_delivery`   | `in_delivery`                                                                       |
| `in_delivery`          | `completed`, `ready_for_delivery` (skipped)                                         |
| `ready_for_collection` | `completed`                                                                         |

Online orders start at `awaiting_pickup`; walk-in orders start at `in_inspection`.

- **ORD-4** Every status change appends a timeline event (status, actor or system, optional note) that is never edited; staff and owner changes also go to the activity log. Open pages of that order, the staff queues and the owner's order list update live.

## 6. Payments (`PAY`)

- **PAY-1** QRIS payments go through **Midtrans Core API**. A charge is created **only when someone presses "Bayar"** (the customer online, or staff at the counter). A QR code lives **15 minutes**; pressing again while one is live shows the same QR. At most 5 new QR codes per order per 15 minutes.
- **PAY-2** Midtrans notifications are verified (signature), the status is confirmed with Midtrans, and processing is idempotent. A paid QRIS moves the order to `in_cleaning`. Pages showing a QR also offer "Cek status", which asks Midtrans directly.
- **PAY-3** Payment statuses: `pending` (Menunggu), `paid` (Lunas), `expired` (Kedaluwarsa), `cancelled` (Dibatalkan), `failed` (Gagal), `cancel_failed` (Gagal dibatalkan), `refund_due` (Perlu refund), `amount_mismatch` (Nominal tidak cocok), `refunded` (Sudah dikembalikan). **At most one `paid` payment per order**, guaranteed by the database.
- **PAY-4** When an order is paid another way (cash, owner correction), any live QRIS of that order is cancelled at Midtrans; if that fails the payment becomes `cancel_failed`. A QRIS settled after the order was already paid becomes `refund_due`. A settled amount different from the bill becomes `amount_mismatch`.
- **PAY-5** Each payment method (QRIS, cash) can be switched off by the owner (`owner.md` OWN-8). Without Midtrans keys, QRIS shows as unavailable with a hint to pay at the shop.
- **PAY-6** **Payment reminders** (online orders only): while an order is `awaiting_payment` without a paid payment, a WhatsApp reminder goes **24 hours after the bill, then every 2 days**, only **between 10:00 and 15:00 Asia/Jakarta**, until paid. Only a successfully sent message counts; a failed send is retried on the next run. Reminders never call Midtrans.

## 7. WhatsApp messages (`MSG`)

- **MSG-1** Customers (with or without an account) receive **exactly six kinds** of messages, plus OTP codes:
  1. **Order received**: an online order is placed; a walk-in order **is paid at the counter** (with the order number, the amount paid and a link to follow the order).
  2. **Courier on the way**: a pickup trip started.
  3. **Bill** (online orders only): inspection saved, "Rincian dan pembayaran: <link>".
  4. **Payment reminder** (PAY-6).
  5. **Cancelled by the shop**: the owner cancels (a customer's own cancellation sends nothing).
  6. **Come back reminder**: sent only when the owner chooses to remind a customer (`owner.md` OWN-6). Never automatic.
- **MSG-2** Staff and owner receive no WhatsApp messages; they have the app.
- **MSG-3** A failed or crashing send is logged and **never fails the action** that triggered it.
- **MSG-4** Without a Fonnte token (outside production), messages are written to the log instead of sent.

## 8. Accounts (`ACC`)

Rules for every account, whatever the role.

- **ACC-1** Phone numbers are normalized to `62…` everywhere, and masked in logs and in owner lists where the full number isn't needed.
- **ACC-2** **OTP**: 6 digits, valid 5 minutes, dies after 5 wrong tries, resend after 60 s, at most 5 sends per number and 20 per IP per hour, stored only as a keyed hash, tied to one purpose (`register`, `reset_password`, `change_phone`).
- **ACC-3** **Sign-in** with number + password and "Ingat saya" (remembered for 180 days), rate limited per number and per IP. Wrong credentials always show "Nomor atau kata sandi salah." Inactive accounts can't sign in.
- **ACC-4** **Account security** on every profile: change password (current password required, rate limited), see the number of active devices, and **sign out other devices**.
- **ACC-5** A password reset or a phone change signs out every other device.

## 9. Photos (`PHOTO`)

- **PHOTO-1** Proof photo kinds: pickup, intake (walk-in), washing, delivery. JPG/PNG/WebP up to 8 MB, taken with the device camera in the app.
- **PHOTO-2** Photos are stored outside the public folder and shown only to signed-in users allowed to see that order.
- **PHOTO-3** Photo files older than **90 days** are deleted by a scheduled job; the record stays so the timeline still shows a photo was taken.

## 10. Scheduled jobs

| Job                | When             | What                                                                         |
| ------------------ | ---------------- | ---------------------------------------------------------------------------- |
| Payment reminders  | every 15 minutes | PAY-6 (the job checks the 10:00–15:00 window itself; safe to run repeatedly) |
| Prune proof photos | daily            | PHOTO-3                                                                      |

## 11. Outside services

| Service              | Used for                                   | Data sent                                        |
| -------------------- | ------------------------------------------ | ------------------------------------------------ |
| Fonnte               | WhatsApp messages and OTP                  | Phone number, message text                       |
| Midtrans Core API    | QRIS charge, status, cancel, notifications | Order reference, amount, customer name and phone |
| Cloudflare Turnstile | Bot check on public forms                  | The Turnstile token and client IP                |
| OSRM (self-hosted)   | Route lines, distance, queue order         | Nothing leaves our servers                       |

The privacy page lists these. No other outside service receives personal data.

## 12. Data (summary)

`users`, `remember_me_tokens`, `sessions` (database store, so pending sign-up data never reaches the browser), `rate_limits`, `otp_codes`, `customer_addresses`, `orders`, `order_addresses`, `order_events`, `order_items` (the customer's declared items and the inspected items), `services`, `bills`, `bill_lines`, `payments`, `order_photos`, `activity_logs`, `operating_costs`, `settings` (key → JSON value), `service_areas` (PostGIS), plus an `osm` schema for place search, loaded by a command and not by migrations. Money is whole rupiah. Timestamps are `timestamptz`; business dates use Asia/Jakarta.

## 13. Non-functional requirements (`NFR`)

- **NFR-1 Security**: see `docs/ARCHITECTURE.md` §1.2.
- **NFR-2 Accessibility**: keyboard reachable, visible focus, a label on every field, native headings, WCAG 2.1 AA contrast.
- **NFR-3 Performance**: public pages server-rendered and fast on a mid-range phone over 4G; no map or heavy script on pages that don't need it.
- **NFR-4 Reliability**: an outside service being down (Fonnte, Midtrans, OSRM, map data) degrades one feature with a clear message; it never breaks unrelated pages or actions.
- **NFR-5 Auditability**: every status change and every staff/owner action is recorded (ORD-4, `owner.md` OWN-1).
- **NFR-6 Language**: the whole UI, every message and every user-facing error is Indonesian. No language switcher.
- **NFR-7 Devices**: mobile first. Staff screens are designed for a phone; owner screens for a laptop and still usable on a phone.
