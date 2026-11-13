# Umima.Clean: Product Requirements (summary)

The product requirements define **what** the application does. They are split by audience:

| File                     | Covers                                                                                                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `summary.md` (this file) | Product, goals, roles, glossary, scope                                                                                                                                                          |
| `shared.md`              | Rules every role depends on: price list, service areas, maps, pickup slots, order and payment statuses, WhatsApp messages, account rules, photos, outside services, non-functional requirements |
| `guest.md`               | Visitors and customers without an account: public pages, sign-up and sign-in, order tracking by phone digits, walk-in customers                                                                 |
| `customer.md`            | Signed-in customers                                                                                                                                                                             |
| `staff.md`               | Staff (courier and shop worker)                                                                                                                                                                 |
| `owner.md`               | The owner                                                                                                                                                                                       |

Requirement IDs (`ORD-3`, `PAY-6`, …) are unique across all files. `docs/PLAN.md`, tests and evidence files refer to them.

---

## 1. Product

**Umima.Clean** is a small shoe, bag and helmet cleaning business in Bandung Raya. Customers either order a free pickup from home or bring items to the shop. Items are inspected, priced per item, paid for, cleaned, and then delivered back or collected at the shop.

## 2. Goals

1. A customer can order a pickup, follow the order, and pay online without calling the shop.
2. The one staff member (who is also the courier) always knows what to do next: who to pick up, what to inspect, what to wash, what to deliver.
3. The owner sees the business at a glance (orders, money, customers) and controls prices, service areas and settings without a developer.
4. Every order has a complete, trustworthy history: who did what, when, with photo proof.

## 3. Roles

| Role (code) | Label in UI | Who                                                                                | Signs in at   | Requirements  |
| ----------- | ----------- | ---------------------------------------------------------------------------------- | ------------- | ------------- |
| (none)      | Pengunjung  | Anyone, including walk-in customers without an account                             | —             | `guest.md`    |
| `customer`  | Pelanggan   | Anyone who registers                                                               | `/masuk`      | `customer.md` |
| `staff`     | Staf        | One person who is both the courier and the shop worker. No staff types, no shifts. | `/staf/masuk` | `staff.md`    |
| `admin`     | Owner       | The business owner. Can do everything staff can, plus the owner area.              | `/staf/masuk` | `owner.md`    |

Everyone with an account signs in with **WhatsApp number + password**. `/masuk` accepts only customers; `/staf/masuk` accepts only staff and owner.

## 4. Glossary

Use these words consistently in code (English) and UI (Indonesian).

| Code term                        | UI term               | Meaning                                                                                   |
| -------------------------------- | --------------------- | ----------------------------------------------------------------------------------------- |
| order                            | pesanan               | One customer request: online (pickup) or walk-in                                          |
| online order (`source = online`) | pesanan online        | Placed by a signed-in customer, picked up by the courier                                  |
| walk-in order (`source = store`) | transaksi di toko     | Items brought to the shop and entered by staff                                            |
| item                             | barang                | One shoe pair, bag or helmet in an order                                                  |
| declared item                    | barang dari pelanggan | An item as the customer described it when ordering (brand, type, size), before inspection |
| item kind                        | jenis barang          | `shoe` (Sepatu), `bag` (Tas), `helmet` (Helm)                                             |
| service                          | layanan               | A price-list entry: `main` (one per item) or `addon` (tambahan, any number per item)      |
| inspection                       | pemeriksaan           | Staff list the real items and pick services; this creates the bill                        |
| bill                             | tagihan               | The priced result of an inspection                                                        |
| payment                          | pembayaran            | One payment attempt (QRIS or cash)                                                        |
| pickup / delivery                | jemput / antar        | Courier trips                                                                             |
| return method                    | cara pengembalian     | `delivery` (diantar) or `store` (diambil di toko)                                         |
| pickup slot                      | slot jemput           | A time window on a pickup day                                                             |
| service area                     | area layanan          | A kecamatan where pickup and delivery are free                                            |
| proof photo                      | foto bukti            | Photo taken by staff at pickup, intake, washing or delivery                               |
| activity log                     | aktivitas staf        | The owner's audit log of staff and owner actions                                          |
| staff                            | staf                  | The `staff` role. Never "courier" or "kurir" in code.                                     |
| owner                            | owner                 | The `admin` role                                                                          |

## 5. Out of scope for v1.0.0

Multiple couriers or shifts, staff types, bank transfer, Midtrans Snap, EDC, refunds through Midtrans (refunds happen outside the app and are recorded), promotions and loyalty, multiple branches, native apps, English UI, third-party maps or geocoders, WhatsApp messages to staff or owner.
