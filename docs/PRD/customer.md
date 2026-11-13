# Customers (signed in)

A customer has an account (`guest.md` GUEST-10) and signs in at `/masuk`. Bottom navigation: **Beranda, Pesan, Riwayat, Profil**.

---

## 1. Home (`CUST`)

- **CUST-1** **Home** (`/beranda`): on the first visit (no orders yet), a welcome with a first-order CTA and the steps of how it works. Later: the active order panel (status and next step), a quick order button, and recent orders.

## 2. Addresses

- **CUST-2** A customer has **at most 3** saved addresses, exactly one of them primary when any exist. Deleting the primary promotes the newest remaining one. A customer can make any address primary.
- **CUST-3** An address has: label ("Rumah", "Kantor" or custom), recipient name, recipient phone (prefilled with the account phone, may belong to someone else), address text, optional landmark, and a map pin inside an active area (AREA-4). The form uses place search and the street label under the pin (MAP-1).
- **CUST-4** An order **copies** its pickup and delivery addresses when it is placed. Editing or deleting a saved address never changes an existing order.

## 3. Ordering

- **CUST-5** **New order** (`/pesan`): the **items** the customer is sending, one row per item (at least 1, at most 20 shoes and 20 bags; no helmets, SVC-4):
  - **shoe**: brand (merk, e.g. "Nike"), type (jenis, e.g. "Air Force 1", "boots kulit"), size (EU number, e.g. 42);
  - **bag**: brand, type (e.g. "ransel kanvas"), size (Small, Medium, Large or X-Large, with the lengths from SVC-5 as hints).

  Then: pickup address (from saved addresses, with a shortcut to add one while fewer than 3 exist), delivery address (same as pickup, or another saved address), pickup date and slot (SLOT; full or closed slots disabled), optional note (≤ 300 characters). "Pesan lagi" from a past order prefills its items. The form keeps its values when the customer goes back from the confirmation page.

- **CUST-6** **Confirm** (`/pesan/konfirmasi`): a summary of the declared items, addresses, date, slot and note. Placing the order re-checks the slot capacity (SLOT-3) and the service area of both addresses (AREA-4), creates the order at `awaiting_pickup`, and sends the "order received" message (MSG-1). A double submit creates one order.

## 4. Orders

- **CUST-7** **Order detail** (`/pesanan/:id`): the signed-in customer who owns the order sees it directly (others get the unlock form, `guest.md` GUEST-4). It shows the status, the stage progress, the timeline (ORD-4), the addresses, the declared items, the inspected items and itemized bill once inspected, proof photos, the pay button while `awaiting_payment`, and the cancel button (CUST-8).
- **CUST-8** **Cancel**: only while `awaiting_pickup`, with a reason (3–200 characters). Later statuses show "contact us on WhatsApp" instead. A customer's own cancellation sends no message.
- **CUST-9** **Orders** (`/pesanan`): the customer's orders, newest first, with a status filter (active, finished, cancelled) and search by order number.
- **CUST-10** **Pay** (`/pesanan/:id/bayar`): the itemized bill (main service per item + add-ons + subtotal), the "Bayar" button that creates or shows the QRIS (PAY-1) with a countdown, and "Cek status" (PAY-2). After payment the page shows success and links back to the order.
- **CUST-11** **Receipt** (`/pesanan/:id/struk`): only for `completed` orders.

## 5. Profile

- **CUST-12** **Profile** (`/profil`, `/profil/ubah`): change name; account security (ACC-4).
- **CUST-13** **Change phone number** (`/profil/nomor`): OTP to the new number (ACC-2); a number already used by another account is refused; on success every other device is signed out (ACC-5), and unlinked walk-in orders made with the new number are linked to the account (as in `guest.md` GUEST-13).
- **CUST-14** **Addresses** (`/profil/alamat`, `/profil/alamat/baru`, `/profil/alamat/:id/ubah`): list, add, edit, make primary, delete (CUST-2, CUST-3).

## 6. Pages

| Page                 | URL                                                                |
| -------------------- | ------------------------------------------------------------------ |
| Home                 | `/beranda`                                                         |
| New order, confirm   | `/pesan`, `/pesan/konfirmasi`                                      |
| Orders, order detail | `/pesanan`, `/pesanan/:id`                                         |
| Pay, receipt         | `/pesanan/:id/bayar`, `/pesanan/:id/struk`                         |
| Profile, edit, phone | `/profil`, `/profil/ubah`, `/profil/nomor`                         |
| Addresses            | `/profil/alamat`, `/profil/alamat/baru`, `/profil/alamat/:id/ubah` |
