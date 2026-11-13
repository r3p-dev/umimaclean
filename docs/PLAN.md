# Plan

Milestones in order. **Slow, reviewable progress**: each milestone is small enough to review the screens, read the code and understand how it works in one sitting. The implementer stops after every milestone and waits for confirmation (`AGENTS.md` §3). A milestone that grows is split into checkpoints (`M5a`, `M5b`, …), each with its own stop.

Requirement IDs refer to `docs/PRD/`. In M0 the implementer adds **acceptance criteria** (by requirement ID) and an **hour estimate** to every milestone below, and may propose a different split; the plan is final once approved.

| #    | Version | Milestone                                      | Status                | Hours |
| ---- | ------- | ---------------------------------------------- | --------------------- | ----- |
| M0   | –       | Spikes and plan                                | done                  | 8     |
| M1a  | –       | Conventions across the existing code           | done                  | 8     |
| M1b  | –       | Foundation and look                            | done, awaiting review | 10    |
| M1c  | 0.1.0   | Landing, legal pages, SEO                      | not started           | 10    |
| M2   | 0.2.0   | Accounts                                       | not started           | 24    |
| M3   | 0.3.0   | Services, service areas, store settings        | not started           | 16    |
| M4   | 0.4.0   | Addresses and maps                             | not started           | 20    |
| M5a  | 0.5.0   | Online ordering: slots, new order, confirm     | not started           | 14    |
| M5b  | 0.5.0   | Order pages and tracking                       | not started           | 12    |
| M6   | 0.6.0   | Courier trips                                  | not started           | 24    |
| M7   | 0.7.0   | Workshop                                       | not started           | 16    |
| M8   | 0.8.0   | Payments                                       | not started           | 24    |
| M9   | 0.9.0   | Walk-in orders                                 | not started           | 16    |
| M10a | 0.10.0  | Owner area: orders, money, activity            | not started           | 18    |
| M10b | 0.10.0  | Owner area: customers, reports, staff accounts | not started           | 18    |
| M11  | 0.11.0  | Live updates and jobs                          | not started           | 10    |
| M12  | 1.0.0   | Hardening and release                          | not started           | 20    |

Hours are the implementer's estimate for building, testing and writing the evidence of each milestone; review time is not included. Total M1a–M12: 260 hours.

**Checkpoints:** M5 and M10 each became two checkpoints (`a`, `b`) in M0 so that each stop stays reviewable in one sitting; M1 became M1a (conventions applied to the existing code, added by the owner after M0), M1b (foundation and look) and M1c (landing, legal pages, SEO). A checkpoint `a` ends with a report and suggested commits but no version bump; the minor version is bumped at the end of checkpoint `b`.

**Every milestone** also meets the general acceptance criteria of `AGENTS.md` §2: tests for its criteria (unit for services, state machines and helpers; functional for every route, including authorization and the PRD rule, named by requirement ID; browser tests for the main journeys), `npm run lint`, `npm run typecheck` and `npm test` pass without deprecation warnings, seed data updated, `docs/ARCHITECTURE.md` and `docs/DEPENDENCIES.md` current, `docs/evidence/M{N}/EVIDENCE.md` with desktop and mobile screenshots and logs in the same folder.

## M0: Spikes and plan

No application code. Infrastructure files are allowed: the Podman setup for local services and the data scripts (OSM import style and SQL, OSRM profile, PMTiles extract). The ace command that runs the OSM import comes in M4; in M0 the spike result is the documented commands. Stop and report after this.

1. Read `docs/PRD/` and list anything unclear, contradictory or missing.
2. Local services with Podman: PostgreSQL + PostGIS and OSRM (pinned images). Show that both start from a clean machine with the documented commands.
3. Map data: the OSM extract → `osm` schema import, the OSRM motorbike build, the PMTiles extract for Bandung Raya. Document tools, versions, sources, licenses, sizes and commands. Data files are not committed.
4. Check the current docs for Midtrans Core API QRIS, Fonnte, Turnstile, Transmit, shadcn's React Aria base, Leaflet and protomaps-leaflet. Note anything that affects the design, and confirm that each tool is maintained.
5. Decide whether the generated `.adonisjs/` directory stays committed (it is today), following the official AdonisJS recommendation, and how scheduled jobs run locally and in production.
6. Write `docs/ARCHITECTURE.md` §2–§7 (including both state machines as tables, from ORD-3 and PAY-7) and complete this plan (acceptance criteria and hours per milestone). List any decision in `docs/ARCHITECTURE.md` §1 you believe must change, and why.

## M1a (checkpoint of 0.1.0): Conventions across the existing code

Apply `docs/CONVENTIONS.md` to the whole existing codebase before anything new is built on it. Behavior does not change. Code that M2 replaces (the email sign-up and sign-in) only gets the mechanical rules: naming, comments, file locations.

Acceptance criteria:

- Every convention applied, with the files it touched, and everything deliberately left for a later milestone with its reason, listed in `docs/evidence/M1a/EVIDENCE.md`.
- Tooling enforces what it can: the type-aware `@typescript-eslint/no-deprecated` rule (CONVENTIONS §12) and TypeScript's `noImplicitOverride` (§5) are on and pass.
- `npm run lint`, `npm run typecheck` and `npm test` pass, and `npm test` also passes on a freshly created test database: the test runner migrates its own database (`tests/bootstrap.ts`, `docs/ARCHITECTURE.md` §6.6).
- Behavior unchanged: the same routes answer with the same status codes, and the existing pages look the same (screenshots compared with the previous commit).
- Development and tests use their own databases on the shared PostgreSQL server (`database/create_databases.sql`); `compose.yaml` keeps only OSRM and the data tools.

## M1b (checkpoint of 0.1.0): Foundation and look

Tailwind, shadcn (React Aria base) with the brand values in shadcn's theme variables, one light theme, the page templates per area, error pages, and the existing pages in the new look. Review focus: does it look right.

Acceptance criteria:

- Tailwind v4 and shadcn initialized with `--base aria` (style `aria-vega`), `iconLibrary` set to Tabler; every package the CLI adds is listed in `docs/DEPENDENCIES.md`; `lucide-react` removed.
- One light theme: no theme toggle, no dark variant or dark values, and the generated components carry no `dark:` classes (unit test); the page stays light when the device prefers dark (browser test).
- The starter's look (its CSS classes in `inertia/css/app.css`, inline styles, English copy) replaced by Tailwind classes, shadcn components and Indonesian copy on every existing page (CONVENTIONS §9.1, §15).
- Brand colors only in shadcn's existing theme variables in `inertia/css/app.css`; no new CSS variables. Every design token without a shadcn equivalent is listed with a proposal, and the owner decides before anything is added to `app.css`.
- Fonts self-hosted through `@fontsource-variable/*`; no request to any outside host (browser test that blocks outside hosts, on every page).
- One template per area (public, auth, customer, flow, staff, owner, print) and the error pages (404, 500), viewable in development (`/_preview/...`).
- NFR-2 on the new pages: keyboard reachable with a visible focus ring, `lang="id"`, one `h1` per page (browser tests).

## M1c (0.1.0): Landing, legal pages, SEO

Public: the landing with its static sections, terms and privacy (GUEST-1 static parts, GUEST-2, GUEST-3). Ends with version 0.1.0.

Acceptance criteria:

- GUEST-1 static sections: hero with the before/after photos (resized for the web, each photo's source, author and license documented in `docs/DEPENDENCIES.md` §4), how it works, items, reviews, FAQ; the footer with placeholder store data until M3 and, on the landing, the one-line photo credit with each name linked to the photo's source page.
- GUEST-2 terms (`/syarat`) and privacy (`/privasi`); the privacy page lists the outside services of `docs/PRD/shared.md` §11.
- GUEST-3 titles, descriptions and Open Graph on public pages; `/sitemap.xml` and `/robots.txt` list public pages only.
- NFR-2: AA contrast checked automatically in the browser tests (tool to be approved, see the M1b report).

## M2 (0.2.0): Accounts

Replace the starter's email login with phone + password. GUEST-10, GUEST-11, GUEST-12, STAFF-1 (sign-in part), ACC-1…ACC-5, CUST-12, CUST-13 (without walk-in linking), OWN-13 (OTP over WhatsApp with the log driver), Turnstile, role redirects, empty home pages per role, the first owner account (ace command or seeder).

Acceptance criteria:

- ACC-1: one phone rule normalizes every phone input to `62…`; phones masked in logs.
- GUEST-10: sign-up with Turnstile; the account exists only after the OTP; pending data only in the database session; an existing number is refused.
- ACC-2: OTP of 6 digits, 5 minutes, 5 wrong tries, 60 s resend, 5 sends per number and 20 per IP per hour, stored as a keyed hash, compared in constant time, tied to its purpose; sent through `FonnteGateway` (log driver without a token).
- GUEST-11, STAFF-1, ACC-3: `/masuk` accepts only customers, `/staf/masuk` only staff and owner (each pointing the other way); "Ingat saya" for 180 days; rate limits per number and per IP; the single wrong-credentials message; inactive accounts refused; staff sign-in updates last-seen and writes an activity log entry (the `activity_logs` table is created here).
- GUEST-12, ACC-5: forgot password never reveals whether a number exists; a reset signs out every other device.
- ACC-4, CUST-12, OWN-13, STAFF-16 (profile part): change password (current required, rate limited), active device count, sign out other devices, change name.
- CUST-13 (without walk-in linking): phone change through an OTP to the new number; a taken number is refused; other devices signed out.
- Role redirects after sign-in; empty home pages for customer, staff and owner; the first owner account from a seeder (`ADMIN_PHONE` in production); seed data with one owner and two staff accounts; demo accounts printed by the seeder.
- All validation messages in Indonesian in `start/validator.ts` (CONVENTIONS §8); the starter's email sign-up and sign-in and its `AuthService` are replaced.
- `docs/ARCHITECTURE.md` §1.2 rules 1–4 and 7 covered by tests (trusted proxy IP, Bouncer on every route, rate limits, OTP storage).

## M3 (0.3.0): Services, service areas, store settings

SVC-1…SVC-5, AREA-1…AREA-3, OWN-7, OWN-8 (shop info and slots), OWN-9, the landing price list and coverage check (GUEST-1).

Acceptance criteria:

- SVC-1, SVC-2, OWN-7: owner creates, edits, switches on/off (also several at once) and soft-deletes services; every change in the activity log; inactive services hidden from staff lists, deleted ones never switched back on.
- SVC-5: the seeded price list exactly as the PRD table (bag rows as two services each).
- AREA-1, AREA-2: the 64 kecamatan of Kota Bandung, Kota Cimahi and Kabupaten Bandung loaded from a committed GeoJSON whose source, license, date and processing are documented; initial active set as AREA-2; the license credit shown with pin maps.
- AREA-3, OWN-9: the owner switches kecamatan on/off (grouped by kota/kabupaten, with a map); the change applies to the next pin check; logged.
- OWN-8 (shop info, slots), SLOT-2: shop name, WhatsApp, address, opening hours, pickup slots (label, capacity 1–20, on/off, defaults); logged; footer and privacy page read these settings.
- GUEST-1: the landing price list from active services ("mulai dari" where flagged); the coverage check (AREA-4 point-in-area) with a per-IP rate limit.

## M4 (0.4.0): Addresses and maps

AREA-4, MAP-1, MAP-2, CUST-2, CUST-3, CUST-14.

Acceptance criteria:

- `node ace osm:import` runs the pipeline of `docs/ARCHITECTURE.md` §6.2 (checks that the clip box contains every service area first).
- MAP-1: place search for signed-in users only (per-user rate limit), typo and spacing tolerant ("dipati ukur" finds "Jalan Dipatiukur"), generic words ignored; nearby places and the street label under a pin; without the `osm` schema the pin can still be placed by hand.
- MAP-2: maps are drawn by MapLibre GL JS from the self-hosted PMTiles file (`pmtiles` protocol, `@protomaps/basemaps` style), loaded only on pages that show a map; the browser contacts no map provider (browser test blocks outside hosts); "© OpenStreetMap contributors" on every map; without the file a plain background and pins still work.
- AREA-4: every saved pin is checked against active areas on the server; instant inside/outside feedback while moving the pin.
- CUST-2, CUST-3, CUST-14: at most 3 addresses, exactly one primary (database-enforced), deleting the primary promotes the newest; label, recipient name and phone, address text, landmark, pin; list, add, edit, make primary, delete.

## M5a (checkpoint of 0.5.0): Online ordering: slots, new order, confirm

SLOT-1…SLOT-3, ORD-1, ORD-2, ORD-3 (the order state machine and its table test), CUST-4…CUST-6 (including the declared items), the "order received" message (MSG-1.1 online version, MSG-3, MSG-4).

Acceptance criteria:

- The order state machine of `docs/ARCHITECTURE.md` §5.1 in one table and one writer method, with the unit test over every status pair.
- SLOT-1: dates tomorrow up to 7 days ahead, never Sunday (Asia/Jakarta). SLOT-3: full or closed slots disabled; capacity re-checked under a lock when placing (concurrency test: two customers, one last place, one order).
- CUST-5: declared items (1–20 shoes, 1–20 bags, no helmets: SVC-4), addresses, date, slot, note ≤ 300; values kept when going back from the confirmation; "Pesan lagi" prefill.
- CUST-6: confirmation summary; placing re-checks slot capacity and both addresses (AREA-4); a double submit creates one order; the order starts at `awaiting_pickup` with its first timeline event.
- CUST-4: addresses copied into the order; later address edits don't change it.
- MSG-1.1: "order received" with order number and pickup schedule; a failing send is logged and never fails the order (MSG-3); log driver without a token (MSG-4).
- ORD-1: order number `UMC-00042` everywhere.

## M5b (0.5.0): Order pages and tracking

ORD-4 (timeline, without live updates), CUST-1, CUST-7…CUST-9, GUEST-4…GUEST-6.

Acceptance criteria:

- CUST-7: the order page shows status, stage progress, timeline, addresses, declared items; only the owning customer sees it directly.
- GUEST-4, GUEST-5, GUEST-6: anyone else gets the 4-digit unlock; right digits unlock for that session only; 5 wrong tries per 15 minutes per IP and per order, 20 per order per 24 hours; responses don't reveal whether an order exists; an unlocked order shows the same detail without the cancel button.
- CUST-8: cancel only while `awaiting_pickup`, reason 3–200 characters, no message; later statuses show "contact us on WhatsApp".
- CUST-9: the orders list, newest first, status filter (active, finished, cancelled), search by order number.
- CUST-1: first-visit welcome; later the active order panel, quick order and recent orders.
- ORD-4: every status change appends an immutable timeline event.

## M6 (0.6.0): Courier trips

STAFF-2…STAFF-7, PHOTO-1, PHOTO-2, the "courier on the way" message.

Acceptance criteria:

- STAFF-2: staff home with counts per queue and the next thing to do.
- STAFF-3: one active pickup and one active delivery for the whole team, enforced by the database (concurrency test); everyone sees who holds a trip; only that staff member or the owner can finish or skip it (authorization tests); when the owner cancels the order of an active trip, the trip ends and the queue is free again (OWN-3).
- STAFF-4, STAFF-5: start, arrived (logged), finish with a required proof photo (delivery also records the receiver), skip with a listed reason and note shown on the timeline; "courier on the way" message on pickup start (MSG-1.2).
- STAFF-6: queue order as specified (pickup blocks by date and slot, nearest first inside a block by OSRM travel time; deliveries nearest first; today's skipped stops last; each staff member sees the queue ordered from their own GPS position, or from the shop without GPS, with a plan kept per staff member and recomputed only on finish, skip or queue change); without OSRM the scheduled order with "Urutan belum dioptimasi".
- STAFF-7: active trip with route line, distance/ETA ("±" without OSRM), call and WhatsApp buttons, note, items, and a Google Maps / Waze button whose choice is remembered on the device.
- PHOTO-1, PHOTO-2: JPG/PNG/WebP up to 8 MB from the device camera; stored outside `public/`; served only to signed-in users allowed to see that order.

## M7 (0.7.0): Workshop

STAFF-8…STAFF-11, the "bill" message.

Acceptance criteria:

- STAFF-8: workshop queue (inspection, payment, washing, collection), oldest first.
- STAFF-9: starting moves `picked_up → in_inspection`; online orders start from the declared items, which stay visible for comparison; 1–60 items; per item one active main service and up to 10 active add-ons of its kind; "mulai dari" services may be raised (never below the listed price) and the change is logged; saving creates the bill (SVC-3: listed and charged price copied) and moves to `awaiting_payment`; re-inspection before payment replaces the bill; "bill" message for online orders (MSG-1.3).
- STAFF-10: finishing washing needs a proof photo, marks items washed and moves to `ready_for_delivery` or `ready_for_collection` by return method.
- STAFF-11: hand-over at the shop completes the order; label and receipt pages for a small printer.

## M8 (0.8.0): Payments

PAY-1…PAY-7, CUST-10, CUST-11, the payment reminders job.

Acceptance criteria:

- The payment state machine of `docs/ARCHITECTURE.md` §5.2 in one table and one writer method, with the unit test over every status pair; at most one `paid` payment per order enforced by the database.
- PAY-1, CUST-10: a QRIS charge only on "Bayar"; 15-minute QR with countdown; a live QR is shown again; at most 5 new QRs per order per 15 minutes; the bill itemized.
- PAY-2: notifications verified by signature, confirmed with Midtrans, idempotent (the same notification twice changes nothing); "Cek status" asks Midtrans; a paid QRIS moves the order to `in_cleaning`.
- PAY-4, PAY-7: live QRIS cancelled when the bill is replaced (re-inspection) and when the order is paid another way or cancelled; `cancel_failed`, `refund_due` and `amount_mismatch` reached exactly as the table says (functional tests with the Midtrans fake for each row).
- PAY-5: without Midtrans keys QRIS shows as unavailable with a hint to pay at the shop.
- PAY-6: `node ace payments:remind` sends the reminder 24 hours after the bill, then every 2 days after the last sent one, only 10:00–15:00 Asia/Jakarta (a due reminder outside the window goes at the next window start), online orders only, until paid, and never while the order has a payment in `amount_mismatch`; only a sent message counts; never calls Midtrans (tests with a fixed clock).
- CUST-11: receipt only for `completed` orders.
- Verified once against the Midtrans sandbox with sandbox keys (the evidence shows the charge and notification).

## M9 (0.9.0): Walk-in orders

STAFF-12…STAFF-15, GUEST-7…GUEST-9, GUEST-13 and the walk-in part of CUST-13 (linking walk-in history), the "order received" message after counter payment.

Acceptance criteria:

- STAFF-12, GUEST-7: a known phone fills name and primary address and links the order to that account; otherwise staff type the name; counts per kind (helmets allowed); return method (store, primary address, or a typed address inside an active area); note; 1–3 intake photos.
- STAFF-13: saved at `in_inspection`, no message; inspection as in M7.
- STAFF-14, GUEST-8: counter payment by cash (received and change shown) or counter QRIS, only the switched-on methods; no payment link and no reminders.
- GUEST-9, MSG-1.1: "order received" (with the amount paid and the order link) sent only after the counter payment.
- STAFF-15: an unsent walk-in form survives a reload on that device.
- GUEST-13, CUST-13: creating an account or changing to a number links that number's earlier unlinked walk-in orders.

## M10a (checkpoint of 0.10.0): Owner area: orders, money, activity

OWN-1…OWN-5, MSG-1.5, MSG-2.

Acceptance criteria:

- OWN-2: summary with today's numbers, services report, inactive customer count, latest staff activity.
- OWN-3: orders with stage and source filters, server-side search and pagination; order detail with the customer's history; owner cancel (also several at once) from any status except `completed`/`cancelled` with its side effects (active trip ends and the queue is free again, live QRIS cancelled, paid payment → `refund_due`); "cancelled by the shop" message only when the customer was already told about the order (MSG-1.5); bulk move limited to `picked_up → in_inspection` and `ready_for_collection → completed`.
- OWN-4: payment correction with a required reason, flagged sensitive: change method, channel and amount, or set an unpaid payment (`pending`, `expired`, `failed`, `cancelled`, `cancel_failed`) to `paid` when the money was received and the order has no other paid payment (PAY-7); a paid correction moves the order on like any payment and cancels any live QRIS (PAY-4).
- OWN-5: reconciliation with the review flags and actions of PAY-7 (re-check, mark refunded, resolve mismatch, retry cancel, mark handled), each with a note and an activity log entry.
- OWN-1: the activity log with actor, time, order, readable detail, sensitive flag and category filter; customer actions not listed.
- MSG-2: no message ever goes to staff or owner (test over all message kinds).

## M10b (0.10.0): Owner area: customers, reports, staff accounts

OWN-6, OWN-8 (payment methods, inactivity threshold), OWN-10…OWN-12, OWN-14, STAFF-16, the "come back reminder" message (MSG-1.6).

Acceptance criteria:

- OWN-6: customers with paid orders, total spent, money held, first and last paid order, area; segments with the 30/60/90/180-day threshold (default from settings); phones masked.
- OWN-14, MSG-1.6: select customers, preview the text, send in the background spaced out; last reminded shown; every reminder logged; never automatic.
- OWN-8 (rest): payment methods on/off (PAY-5) and the inactivity threshold; logged.
- OWN-10: staff accounts: create, edit, reset password, deactivate (sessions ended), last sign-in shown; logged.
- OWN-11: revenue per day, top services, payment mix, money received, operating costs CRUD, profit.
- OWN-12: Excel export of the owner tables with a maintained library (proposed with a comparison first, DEPENDENCIES §2).
- STAFF-16: staff history of the last 7 days and the "More" page.

## M11 (0.11.0): Live updates and jobs

ORD-4 live updates (order page, staff queues, owner orders), PHOTO-3 pruning job.

Acceptance criteria:

- ORD-4: open order pages, staff queues and the owner order list update after a status change, through Transmit signals and Inertia partial reloads (`docs/ARCHITECTURE.md` §4.4); channel authorization tested (a customer can't subscribe to another customer's order).
- A lost SSE connection shows that live updates are paused and recovers; errors are logged, not swallowed.
- PHOTO-3: `node ace photos:prune` deletes photo files older than 90 days and keeps the records; idempotent.

## M12 (1.0.0): Hardening and release

Self-review against `docs/ARCHITECTURE.md` §1.2 and NFR-1…NFR-7 with findings fixed; browser journeys for every role end to end; accessibility check; production `Containerfile` with a health check; `npm audit` reviewed; `CHANGELOG.md` complete; version 1.0.0.

Acceptance criteria:

- A written self-review of §1.2 rules 1–8 and NFR-1…NFR-7, each finding fixed or recorded with a reason.
- Browser journeys end to end: guest (landing, unlock), customer (sign-up to receipt), staff (pickup, inspection, washing, delivery, walk-in), owner (cancel, reconciliation, reports).
- Accessibility check of every page (automated plus a keyboard pass); AA contrast.
- Production `Containerfile` with a health check endpoint; systemd timer units for the scheduled jobs (`docs/ARCHITECTURE.md` §6.5).
- `npm audit` reviewed with each finding explained; image versions re-checked (PostGIS 3.7, OSRM, Protomaps build).
- `CHANGELOG.md` complete; version 1.0.0.
