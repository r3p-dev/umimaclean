# Guests: visitors and customers without an account

Anyone who is not signed in: people browsing the site, people signing up or in, and **walk-in customers** who never registered but still receive WhatsApp messages and follow their order.

---

## 1. Public pages (`GUEST`)

- **GUEST-1** **Landing** (`/`): hero with a before/after comparison (free-license placeholder photos, with their source and license documented, until the shop provides real ones) and an order CTA; how it works; the items we clean; the price list built from active services (SVC-1, "mulai dari" where flagged); reviews; a service-area map with an "is my location covered?" check (AREA-4, rate limited per IP); FAQ; footer with the shop's name, WhatsApp, address and opening hours from the store settings.
- **GUEST-2** **Terms** (`/syarat`) and **privacy** (`/privasi`). The privacy page states which outside services receive which data (`shared.md` §11) and uses the shop details from the store settings.
- **GUEST-3** **SEO**: title, description and Open Graph on public pages; `/sitemap.xml` and `/robots.txt` list public pages only.

## 2. Order tracking without an account

- **GUEST-4** Anyone who is not the order's signed-in owner opens `/pesanan/:id` and is asked for the **last 4 digits of the order's phone number**. The right digits unlock that order for the current session only.
- **GUEST-5** Limits: 5 wrong tries per 15 minutes per IP and per order, 20 per order per 24 hours. Responses don't reveal whether an order exists.
- **GUEST-6** An unlocked order shows the same detail a signed-in customer sees (`customer.md` CUST-7), without the cancel button.

## 3. Walk-in customers without an account

- **GUEST-7** A walk-in customer is identified only by the name and phone number staff typed (`staff.md` STAFF-12). If that phone already belongs to a customer account, the order is linked to that account instead.
- **GUEST-8** They pay at the counter right after inspection (`staff.md` STAFF-14), never through a payment link, and receive no payment reminders.
- **GUEST-9** Their only message is "order received", **sent after the counter payment** (MSG-1). Its link opens the order page with the 4-digit unlock (GUEST-4).

## 4. Sign-up and sign-in (customers)

- **GUEST-10** **Register** (`/daftar`): name, WhatsApp number, password + confirmation, terms checkbox, Turnstile. The account is created only after the **WhatsApp OTP** (ACC-2) is confirmed on `/verifikasi`; until then the pending data lives server-side only. A number that already has an account is refused.
- **GUEST-11** **Sign in** (`/masuk`) as described in ACC-3. Only customer accounts are accepted here; staff and owner are pointed to `/staf/masuk`. After sign-in: the customer home.
- **GUEST-12** **Forgot password** (`/lupa-kata-sandi` → `/verifikasi` → `/kata-sandi-baru`): number, OTP, new password + confirmation. The response never reveals whether the number is registered ("Jika nomor terdaftar, kode dikirim via WhatsApp."). A reset signs out every other device (ACC-5).
- **GUEST-13** **Walk-in history follows the number.** When an account is created (GUEST-10), every walk-in order made earlier with that phone number and not linked to an account is linked to the new account, so the customer immediately sees those orders in their history. The OTP already proved the number belongs to them.

## 5. Pages

| Page | URL |
| --- | --- |
| Landing | `/` |
| Terms, privacy | `/syarat`, `/privasi` |
| Sitemap, robots | `/sitemap.xml`, `/robots.txt` |
| Order (unlock form or detail) | `/pesanan/:id` |
| Register | `/daftar` |
| OTP verification (all purposes) | `/verifikasi` |
| Sign in | `/masuk` |
| Forgot password, new password | `/lupa-kata-sandi`, `/kata-sandi-baru` |
