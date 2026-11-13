# Owner

The business owner (role `admin`). Signs in at `/staf/masuk` (`staff.md` STAFF-1), can use **every staff screen**, and has the owner area under `/admin`, designed for a laptop and still usable on a phone. Sidebar: **Ringkasan, Pesanan, Rekonsiliasi, Layanan & Harga, Pelanggan, Laporan, Aktivitas Staf, Pengaturan**.

---

## 1. Overview (`OWN`)

- **OWN-1** **Activity log** (`/admin/aktivitas`): every staff and owner action (status changes, trip steps, inspections, payments, corrections, price, settings, staff and cost changes, sign-ins) with actor, time, order and a readable detail (e.g. "Mild Rp60.000 → Rp65.000"). Corrections and deletions are flagged as sensitive. Filterable by category. Customer actions are not logged here.
- **OWN-2** **Summary** (`/admin`): today's numbers, the services report, the number of inactive customers, and the latest staff activity.

## 2. Orders and money

- **OWN-3** **Orders** (`/admin/pesanan`, `/admin/pesanan/:id`): all orders with filters by stage and source, search, and the order detail with the customer's order history. The owner can **cancel** an order in any status except `completed` and `cancelled` (also several at once) with a reason. If the order is on an active trip, that trip ends and the queue is free again. A live QRIS is cancelled (PAY-4); an already paid order's payment becomes `refund_due` (PAY-7) so the refund is recorded later in reconciliation; items already collected are returned to the customer outside the app (no return trip is scheduled). The "cancelled by the shop" message follows MSG-1. The owner can also **bulk move** orders `picked_up → in_inspection` and `ready_for_collection → completed`.
- **OWN-4** **Payment correction** (on the order detail): with a required reason, change a payment's method, channel and amount, or set an unpaid payment to paid when the money was in fact received (PAY-7); a paid correction moves the order on like any payment. It is flagged as sensitive in the activity log and follows PAY-4.
- **OWN-5** **Reconciliation** (`/admin/rekonsiliasi`): recent QRIS charges with a flag. Needing review: `refund_due`, `cancel_failed`, `amount_mismatch`, paid while the order still waits for payment, and pending past expiry. Actions: re-check with Midtrans, mark refunded (with note), resolve a mismatch (accept or refund, with note), retry a failed cancel or mark it handled.

## 3. Customers

- **OWN-6** **Customers** (`/admin/pelanggan`): each customer with number of paid orders, total spent, money held (refund due or mismatch), first and last paid order, and area (from the primary address). Segments: **Tidak aktif / Aktif / Baru (30 hari)**, with an inactivity threshold of 30, 60, 90 or 180 days (default from the store setting, 60). Phone numbers masked (ACC-1).
- **OWN-14** **Remind customers to come back**: from the customers page the owner selects one or several customers (typically inactive ones) and sends the "come back reminder" message (MSG-1). The owner sees a preview of the text first. Messages to several customers are sent in the background, spaced out so the WhatsApp number isn't flagged for spam. The list shows when each customer was last reminded, and every reminder is written to the activity log.

## 4. Catalog and settings

- **OWN-7** **Services and prices** (`/admin/layanan`): create, edit, switch on/off (also several at once), remove (soft delete), all per SVC-1 and SVC-2. Every change is logged.
- **OWN-8** **Store settings** (`/admin/pengaturan/toko`): shop name, WhatsApp number, address, opening hours; pickup slots (SLOT-2); payment methods on/off (PAY-5); the inactivity threshold (OWN-6). Every change is logged.
- **OWN-9** **Service areas** (`/admin/pengaturan/area`): every kecamatan grouped by kota/kabupaten, with an on/off switch (AREA-3) and a map. Every change is logged.
- **OWN-10** **Staff accounts** (`/admin/pengaturan`): create (name, phone, initial password), edit, reset the password, deactivate without deleting history; shows each account's last sign-in. Every change is logged.

## 5. Reports

- **OWN-11** **Reports** (`/admin/laporan`): revenue per day for a period, top services, payment mix (QRIS vs cash), money received, **operating costs** (category: Sewa, Gaji, Bahan, Listrik & air, Lainnya; note; amount; date; create, edit, delete) and profit.
- **OWN-12** Owner tables (orders, customers, reports, activity) can be **exported to Excel**.

## 6. Profile

- **OWN-13** **Profile** (`/admin/profil`): account security (ACC-4).

## 7. Pages

| Page                          | URL                                                                     |
| ----------------------------- | ----------------------------------------------------------------------- |
| Summary                       | `/admin`                                                                |
| Orders, order detail          | `/admin/pesanan`, `/admin/pesanan/:id`                                  |
| Reconciliation                | `/admin/rekonsiliasi`                                                   |
| Services and prices           | `/admin/layanan`                                                        |
| Customers                     | `/admin/pelanggan`                                                      |
| Reports                       | `/admin/laporan`                                                        |
| Staff activity                | `/admin/aktivitas`                                                      |
| Settings: staff, store, areas | `/admin/pengaturan`, `/admin/pengaturan/toko`, `/admin/pengaturan/area` |
| Profile                       | `/admin/profil`                                                         |
