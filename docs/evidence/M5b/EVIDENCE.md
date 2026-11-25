# M5b evidence: Order pages and tracking (Stop 1)

Date: 2026-11-25. Commit: 9cf2518 (+ uncommitted M5b Stop 1 changes).

## Checklist (Stop 1)

| Criterion (req ID) | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| CUST-7, CUST-8, CUST-9, ORD-4: order list, detail, timeline, and customer cancel | PASS | `EVIDENCE_MILESTONE=M5b-stop1 node scripts/evidence_run.ts M5b-stop1 stop1-tests -- sh -c 'node ace test --files="tests/unit/order_service.spec.ts,tests/functional/orders.spec.ts,tests/functional/order_pages.spec.ts,tests/browser/orders_flow.spec.ts,tests/browser/order_pages_flow.spec.ts"'` | see below |
| General: `npm run check` (`lint`, `typecheck`, full `test`) | PASS | `node scripts/evidence_run.ts M5b-stop1 full-check -- npm run check` | `ok   lint (32s)`, `ok   typecheck (11s)`, `ok   test (432s)`, `exit 0` |

Excerpt for Stop 1 tests (`tmp/evidence/M5b-stop1/logs/stop1-tests.log`):

```text
browser / Customer order list, detail and cancel (CUST-7, CUST-8, CUST-9) (tests/browser/order_pages_flow.spec.ts)
❯ Executed 1 seeders
  ✔ customer browses /pesanan, filters, opens detail, and cancels an awaiting_pickup order (6s)

browser / Online ordering flow (CUST-5, CUST-6) (tests/browser/orders_flow.spec.ts)
❯ Executed 1 seeders
  ✔ customer fills /pesan, keeps values after Ubah, confirms, and lands on /beranda (CUST-5, CUST-6) (5s)
  ✔ Pesan lagi prefills items from a past order (CUST-5) (1s)
❯ Reverted 15 migrations (84 ms)

 PASSED 

Tests  24 passed (24)
 Time  18s

exit 0
```

## Run & view

1. Start the dev server: `npm run dev` (after `node ace migration:run` and `node ace db:seed`).
2. Sign in as seeded customer `082111223344` / `password123` on `/masuk`.
3. Open `/pesanan` from the "Pesanan" tab/header link, filter by status (`Semua`, `Aktif`, `Selesai`, `Dibatalkan`), or search by order number (`UMC-...`).
4. Click an order to view `/pesanan/:id` (stage progress stepper, declared items, pickup/delivery addresses, status timeline, "Pesan lagi", and "Batalkan Pesanan" when `awaiting_pickup`, or WhatsApp link for later active statuses).

## Screens

- `/pesanan` at 360 px: customer order list with "Pesan penjemputan" button, filter pills with counts, search input, order cards, and bottom tab bar (`tmp/evidence/M5b-stop1/screenshots/pesanan-daftar-360.png`)
- `/pesanan` at 1440 px: desktop header with "Pesanan" active, filter pills and search input inline, and full-width order cards (`tmp/evidence/M5b-stop1/screenshots/pesanan-daftar-1440.png`)
- `/pesanan/:id` at 360 px: order header (`UMC-00021`), status badge, 5-step stage progress, declared items with note, pickup/delivery address cards, timeline, "Pesan lagi", "Batalkan Pesanan", and WhatsApp help link (`tmp/evidence/M5b-stop1/screenshots/pesanan-detail-360.png`)
- `/pesanan/:id` at 1440 px: two-column layout with items & addresses on the left and status timeline, "Pesan lagi", "Batalkan Pesanan", and WhatsApp link on the right (`tmp/evidence/M5b-stop1/screenshots/pesanan-detail-1440.png`)
- `/pesanan/:id` cancel dialog at 360 px: modal with preset reason pills, 3–200 char textarea, and "Batalkan Pesanan" / "Kembali" buttons (`tmp/evidence/M5b-stop1/screenshots/pesanan-batal-dialog-360.png`)
- `/pesanan/:id` cancel dialog at 1440 px: centered modal over the dimmed order detail page (`tmp/evidence/M5b-stop1/screenshots/pesanan-batal-dialog-1440.png`)

## How it works

1. **Order list (`GET /pesanan`)**: `CustomerMiddleware` → `OrdersController.index` → `Order.forCustomerList` & `Order.countCustomerFilters` → `OrderSummaryTransformer` → `customer/orders/index.tsx`.
2. **Order detail (`GET /pesanan/:id`)**: `CustomerMiddleware` → `OrdersController.show` → `Order.findDetail` → `OrderPolicy.view` → `OrderDetailTransformer` → `customer/orders/show.tsx`.
3. **Customer cancellation (`POST /pesanan/:id/batal`)**: `CustomerMiddleware` → `OrdersController.cancel` → `OrderPolicy.cancel` → `cancelOrderValidator` → `OrderService.cancelOrderByCustomer` (locks row `FOR UPDATE`, verifies `awaiting_pickup`, calls `transitionOrder` to `cancelled` with reason, sends no WhatsApp message) → redirect to `/pesanan/:id`.

## Code tour

- `app/policies/order_policy.ts` — Bouncer policy (`view`, `cancel` for order owner).
- `app/validators/order_validator.ts` & `start/validator.ts` — `cancelOrderValidator` (3–200 chars) and `reason.required` Indonesian message.
- `app/models/order.ts` — `forCustomerList`, `countCustomerFilters`, `findDetail`.
- `app/services/order_service.ts` — `cancelOrderByCustomer`.
- `app/transformers/order_summary_transformer.ts` & `order_detail_transformer.ts` — Inertia prop transformers for list and detail.
- `app/controllers/orders_controller.ts` & `start/routes.ts` — `index`, `show`, `cancel` routes and `store` redirect to `customer.orders.show`.
- `inertia/lib/navigation/customer_links.ts` — "Pesanan" navigation entry.
- `inertia/lib/order_status.ts` — status labels, stage map, Tailwind palette tones, stage progress, and WhatsApp link helper.
- `inertia/components/atoms/order_status_badge.tsx`, `molecules/order_stage_progress.tsx`, `organisms/order_timeline.tsx`, `organisms/order_cancel_dialog.tsx` — UI components.
- `inertia/pages/customer/orders/{index,show}.tsx` — order list and detail pages.
- `tests/{unit/order_service,functional/order_pages,functional/orders,browser/order_pages_flow,browser/orders_flow}.spec.ts` — test coverage.

## Decisions & deviations

- `OrdersController.store` now redirects to `customer.orders.show` (`/pesanan/:id`) instead of `/beranda` (per M5a decision 3).
- Order status badge and stage progress colors use Tailwind's built-in palette in `inertia/lib/order_status.ts` (CONVENTIONS §9.1).

## Known limitations / deferred

- Guest 4-digit unlock (`GUEST-4/5/6`) and `MSG-1.1` order link come in Stop 2.
- `knip` cleanup and version bump `0.5.0` come in Stop 3.

---

## UI pass (before Stop 2)

| Criterion | Status | Command | Excerpt |
| --- | --- | --- | --- |
| Landing redirect, restyled `/beranda`, `/pesanan`, `/pesanan/:id`, `/profil`, consistent `CustomerLayout` + `max-w-6xl` on `/pesan`, destructive "Keluar", removed devices card | PASS | `EVIDENCE_MILESTONE=M5b-ui node scripts/evidence_run.ts M5b-ui ui-pass-tests -- sh -c 'npm run lint && npm run typecheck && node ace test --files="tests/functional/home_redirect.spec.ts,tests/functional/profile.spec.ts,tests/browser/customer_ui_pass.spec.ts,tests/browser/orders_flow.spec.ts,tests/browser/order_pages_flow.spec.ts"'` | `PASS exit=0` (14 tests passed, 0 axe violations, 0 overflow) |
| Full `npm run check` (`lint`, `typecheck`, full `test`) | PASS | `node scripts/evidence_run.ts M5b-ui full-check -- npm run check` | `PASS exit=0` (`tmp/evidence/M5b-ui/logs/full-check.log`) |

### Screens (`tmp/evidence/M5b-ui/screenshots/`)

- `/beranda` (new account) at 360 px & 1440 px: welcome header, first-order CTA card, 3-step guide, empty order state, address shortcut (`beranda-baru-360.png`, `beranda-baru-1440.png`)
- `/beranda` (with orders) at 360 px & 1440 px: greeting, active order card with status badge, 5-step progress bar, "Lihat semua pesanan (2)", quick order card, recent completed orders with "Pesan lagi", saved addresses (`beranda-aktif-360.png`, `beranda-aktif-1440.png`)
- `/pesanan` at 360 px & 1440 px: "Riwayat Pesanan" with dark active filter pill, search bar, mobile cards / desktop table (`pesanan-daftar-360.png`, `pesanan-daftar-1440.png`)
- `/pesanan/:id` at 360 px & 1440 px: "Riwayat" back link, order number + status badge, 5-step progress, 2-column layout (status card first on mobile), timeline, "Pesan lagi", "Batalkan Pesanan", WhatsApp link (`pesanan-detail-360.png`, `pesanan-detail-1440.png`)
- `/profil` at 360 px & 1440 px: identity card, 2-column address & password/phone tiles, no devices card, destructive red "Keluar" (`profil-360.png`, `profil-1440.png`)
- `/pesan` & `/pesan/konfirmasi` at 360 px & 1440 px: `CustomerLayout` header/tab bar, `max-w-6xl` width, sticky mobile CTA above tab bar (`pesan-360.png`, `pesan-1440.png`, `pesan-konfirmasi-360.png`, `pesan-konfirmasi-1440.png`)
