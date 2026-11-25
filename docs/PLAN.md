# Plan

Milestones in order. **Slow, reviewable progress**: each milestone is small enough to review the screens, read the code and understand how it works in one sitting. The implementer stops after every milestone and waits for confirmation (`AGENTS.md`, "Milestone loop"). A milestone that grows is split into checkpoints (`M5a`, `M5b`, …), each with its own stop.

Requirement IDs refer to `docs/PRD/`. In M0 the implementer adds **acceptance criteria** (by requirement ID) and an **hour estimate** to every milestone below, and may propose a different split; the plan is final once approved.

| # | Version | Milestone | Status | Confirmed | Hours |
| --- | --- | --- | --- | --- | --- |
| M0 | – | Spikes and plan | done | v0.1.0 | 8 |
| M1a | – | Conventions across the existing code | done | v0.1.0 | 8 |
| M1b | – | Foundation and look | done | v0.1.0 | 10 |
| M1c | 0.1.0 | Landing, legal pages, SEO | done | v0.1.0 | 10 |
| M2a | – | Accounts: phone login, role redirects, seeders | done | v0.2.0 | 10 |
| M2b | – | Accounts: register, OTP, forgot password | done | v0.2.0 | 8 |
| M2c | 0.2.0 | Accounts: profile, security, rate limits | done | v0.2.0 | 6 |
| M3a | – | Services and landing price list | done | v0.3.0 | 8 |
| M3b | 0.3.0 | Service areas, store settings, coverage service | done | v0.3.0 | 8 |
| M4a | – | Maps, area map and landing coverage check | done | v0.4.0 | 10 |
| M4b | 0.4.0 | Place search and addresses | done (patches 0.4.1, 0.4.2) | v0.4.2 | 10 |
| M5a | – | Online ordering: slots, new order, confirm | done | ? | 14 |
| M5b | 0.5.0 | Order pages and tracking | in progress (stop 1 in review) | – | 12 |
| M6 | 0.6.0 | Courier trips | not started | – | 24 |
| M7 | 0.7.0 | Workshop | not started | – | 16 |
| M8 | 0.8.0 | Payments | not started | – | 24 |
| M9 | 0.9.0 | Walk-in orders | not started | – | 16 |
| M10a | 0.10.0 | Owner area: orders, money, activity | not started | – | 18 |
| M10b | 0.10.0 | Owner area: customers, reports, staff accounts | not started | – | 18 |
| M11 | 0.11.0 | Live updates and jobs | not started | – | 10 |
| M12 | 1.0.0 | Hardening and release | not started | – | 20 |

Hours are the implementer's estimate for building, testing and writing the evidence of each milestone; review time is not included. Total M1a–M12: 260 hours.

**Checkpoints:** M5 and M10 each became two checkpoints (`a`, `b`) in M0 so that each stop stays reviewable in one sitting; M3 (D72) and M4 (D81) were split the same way later; M1 became M1a (conventions applied to the existing code, added by the owner after M0), M1b (foundation and look) and M1c (landing, legal pages, SEO). A checkpoint `a` ends with a report and suggested commits but no version bump; the minor version is bumped at the end of checkpoint `b`.

**Every milestone** also meets the general acceptance criteria of `AGENTS.md` ("Milestone loop", "Evidence"): tests for its criteria (unit for services, state machines and helpers; functional for every route, including authorization and the PRD rule, named by requirement ID; browser tests for the main journeys), `npm run lint`, `npm run typecheck` and `npm test` pass without deprecation warnings, seed data updated, `docs/ARCHITECTURE.md` and `docs/DEPENDENCIES.md` current, `docs/evidence/M{N}/EVIDENCE.md` following `docs/evidence/TEMPLATE.md`, with exact log excerpts and a one-line description of every desktop and mobile screenshot; the logs and screenshots themselves stay in the git-ignored `tmp/evidence/M{N}/` (D84).

**Confirmed** names the release tag that confirms the milestone: the owner creates tags (`AGENTS.md` › Versioning), and a tag confirms its milestone and every earlier checkpoint without a tag of its own (`v0.1.0` confirms M0, M1a, M1b and M1c). `?` means done but not covered by a tag, `–` not done yet.

**Evidence of finished milestones** (not read routinely; each folder holds only `EVIDENCE.md`):

- M0: `docs/evidence/M0/`
- M1a: `docs/evidence/M1a/`
- M1b: `docs/evidence/M1b/`
- M1c: `docs/evidence/M1c/` (patch 0.1.2: [section PATCH-0.1.2](evidence/M1c/EVIDENCE.md#patch-012))
- M2a: `docs/evidence/M2a/` (review fixes: sections [FIX](evidence/M2a/EVIDENCE.md#fix) and [FIX2](evidence/M2a/EVIDENCE.md#fix2))
- M2b: `docs/evidence/M2b/` (review fixes: sections [FIX](evidence/M2b/EVIDENCE.md#fix) and [FIX2](evidence/M2b/EVIDENCE.md#fix2))
- M2c: `docs/evidence/M2c/`; patches 0.2.1 and 0.2.2: `docs/evidence/M2-0.2.1/`, `docs/evidence/M2-0.2.2/`
- M3a: `docs/evidence/M3a/`; review fixes: `docs/evidence/M3a-fix/`
- M3b: `docs/evidence/M3b/` (the process checkpoint after it: [section Process checkpoint](evidence/M3b/EVIDENCE.md#process-checkpoint-2026-11-17)); patches 0.3.1 and 0.3.2: `docs/evidence/M3-0.3.1/`, `docs/evidence/M3-0.3.2/`
- M4a: `docs/evidence/M4a/`; fix stops: `docs/evidence/M4a-fix1/` to `docs/evidence/M4a-fix8/`
- M4b: `docs/evidence/M4b/`; patch 0.4.1 (M4b-fix1): `docs/evidence/M4-0.4.1/`; patch 0.4.2: `docs/evidence/M4-0.4.2/`
- M5a: `docs/evidence/M5a/` (stop 1 and stop 2)

## Active milestone

**M5b: Order pages and tracking** (section M5b below). M5a is confirmed (owner, 2026-11-25; no version bump, 0.5.0 at the end of M5b).

**Handoff** (M5b stop 1, 2026-11-25):

- Done, stop 1 (order pages & cancel, CUST-7, CUST-8, CUST-9, ORD-4): `OrderPolicy` (`view`, `cancel`), `cancelOrderValidator`, `Order.forCustomerList`/`countCustomerFilters`/`findDetail`, `OrderService.cancelOrderByCustomer`, `OrderSummaryTransformer`, `OrderDetailTransformer`, `OrdersController` (`index`, `show`, `cancel`, and `store` redirect switched to `customer.orders.show`), `CUSTOMER_NAVIGATION` ("Pesanan"), `inertia/lib/order_status.ts`, `OrderStatusBadge`, `OrderStageProgress`, `OrderTimeline`, `OrderCancelDialog`, `customer/orders/{index,show}`, unit/functional/browser tests with 360/1440 px screenshots and axe checks. Evidence: `docs/evidence/M5b/EVIDENCE.md`.
- Next: owner reviews stop 1; then stop 2 (guest 4-digit unlock `GUEST-4/5/6`, `CUST-1` dashboard welcome + active order panel, `MSG-1.1` order link) and stop 3 (`knip` cleanup, version `0.5.0`).

## M0: Spikes and plan

No application code. Infrastructure files are allowed: the Podman setup for local services and the data scripts (OSM import style and SQL, OSRM profile, PMTiles extract). The ace command that runs the OSM import comes in M4; in M0 the spike result is the documented commands. Stop and report after this.

1. Read `docs/PRD/` and list anything unclear, contradictory or missing.
2. Local services with Podman: PostgreSQL + PostGIS and OSRM (pinned images). Show that both start from a clean machine with the documented commands.
3. Map data: the OSM extract → `osm` schema import, the OSRM motorbike build, the PMTiles extract for Bandung Raya. Document tools, versions, sources, licenses, sizes and commands. Data files are not committed.
4. Check the current docs for Midtrans Core API QRIS, Fonnte, Turnstile, Transmit, shadcn's React Aria base and the map library. Note anything that affects the design, and confirm that each tool is maintained. (Leaflet with protomaps-leaflet was checked first; protomaps-leaflet is in maintenance mode, so the maps use MapLibre GL JS, `docs/ARCHITECTURE.md` §1.1.)
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

## M2a (checkpoint of 0.2.0): Phone-number accounts, sign-in and sign-out per role, seeders

Replace the starter's email login with phone + password accounts. GUEST-11, STAFF-1 (sign-in part), ACC-1 (normalization and masking), ACC-3 (credentials check, remember-me, inactive accounts refused, activity log on staff/owner sign-in), role redirects, empty home pages per role, the first owner account and demo seeders (`SETUP.md` updated with `db:seed`), and Bouncer authorization across routes.

Acceptance criteria:

- ACC-1: one phone rule normalizes every phone input to `62…`; phone masking helper masks full numbers in logs.
- Schema: `users` table uses phone instead of email, `role` (`customer`, `staff`, `admin`), `is_active`, and `last_seen_at`. `remember_me_tokens` and `activity_logs` tables created; `database/schema.ts` regenerated from migrations.
- GUEST-11, ACC-3: `/masuk` accepts only customers; staff and owner accounts are pointed to `/staf/masuk`. "Ingat saya" for 180 days via remember-me tokens. Generic wrong-credentials message ("Nomor atau kata sandi salah."). Inactive accounts refused with clear Indonesian message.
- STAFF-1, ACC-3: `/staf/masuk` accepts only staff and owner (admin); customer accounts are pointed to `/masuk`. Successful sign-in updates `last_seen_at` and appends an entry to `activity_logs`.
- Role redirects after sign-in: customer lands on `/beranda`, staff on `/staf`, owner on `/admin`.
- Sign out (`POST /keluar`): terminates session and remember-me token, redirects to `/masuk`.
- Empty home pages: customer (`/beranda`), staff (`/staf`), and owner (`/admin`) using their respective templates (`CustomerLayout`, `StaffLayout`, `OwnerLayout`), with zero axe violations and proper mobile/desktop responsive design.
- Bouncer authorization (`app/abilities/main.ts`): functional tests prove that every role is refused where it doesn't belong (guest vs customer vs staff vs owner).
- Seed data (`database/seeders/`): one owner (`081200000001`), two staff (`081200000002`, `081200000003`), sample customers; demo accounts printed to console. `docs/SETUP.md` includes `node ace db:seed` again in Step 4.
- All validation messages in Indonesian in `start/validator.ts` (CONVENTIONS §8).
- Evidence in `docs/evidence/M2a/EVIDENCE.md` with screenshots at 360, 390, and 1440 px, axe audit, and functional tests.

## M2b (checkpoint of 0.2.0): Registration, WhatsApp OTP, password reset, Turnstile

GUEST-10 (registration with Turnstile and WhatsApp OTP), GUEST-12 and ACC-5 (forgot password with WhatsApp OTP and signing out other devices), ACC-2 (OTP keyed hash, expiry, retry limits, FonnteGateway log driver), and database session store for pending registration data.

Acceptance criteria:

- ACC-2: OTP of 6 digits, 5 minutes validity, 5 wrong attempts limit, 60 s resend cooldown, at most 5 sends per number and 20 per IP per hour; stored only as keyed hash, compared in constant time, tied to purpose (`register`, `reset_password`). Sent through `FonnteGateway` (log driver outside production).
- GUEST-10: register (`/daftar`) with name, WhatsApp number, password + confirmation, terms checkbox, and Turnstile; pending data kept in server database session; account created only after OTP confirmation on `/verifikasi`; existing numbers refused.
- GUEST-12, ACC-5: forgot password (`/lupa-kata-sandi` → `/verifikasi` → `/kata-sandi-baru`); response never reveals if number exists; successful reset invalidates other active device sessions and tokens.
- Evidence in `docs/evidence/M2b/EVIDENCE.md` with screenshots, axe audit, and tests.

## M2c (0.2.0): Profile, account security, phone change, rate limits

ACC-4 on every profile, CUST-12 (customer profile and name), OWN-13, STAFF-16 (profile part only): change password, device count, sign out other devices; CUST-13 phone change via OTP (walk-in linking in M9); sign-in and password change rate limits (`@adonisjs/limiter`); trusted proxies; ends with version 0.2.0.

Acceptance criteria:

- CUST-12: the customer views the profile and changes the name. Staff and owner names are not editable here (the owner manages staff names, OWN-10).
- ACC-4, CUST-12, OWN-13, STAFF-16: every profile changes the password (current password required), shows the number of active devices and signs out other devices, including their remember-me tokens.
- CUST-13: phone change through an OTP to the new number (`change_phone`); a number used by another account is refused; success signs out every other device (ACC-5).
- ACC-3: sign-in limited on failed attempts to 5 per number and 50 per IP per 15 minutes; a successful sign-in clears that number's counter. ACC-4: 5 wrong current passwords per account per 15 minutes. OTP limits stay as in M2b (ACC-2). A blocked attempt says how long to wait.
- Trusted proxies (`TRUSTED_PROXIES`, `proxy-addr`, `http.trustProxy`): X-Forwarded-For honoured only from configured addresses, default loopback.
- Navigation shows "Profil" for every role (interim staff placement until "Lainnya", D66).
- Version bump to 0.2.0 (`package.json`, `package-lock.json`, `CHANGELOG.md`).
- Evidence in `docs/evidence/M2c/EVIDENCE.md`.

## M3a (checkpoint of 0.3.0): Services and landing price list

SVC-1…SVC-5, OWN-7, the landing price list (GUEST-1 price list portion).

Acceptance criteria:

- SVC-1, SVC-2, OWN-7: owner creates, edits, switches on/off (also several at once) and soft-deletes services (/admin/layanan); every change in the activity log; inactive services hidden from public price list, deleted ones never switched back on.
- SVC-3: service snapshot rules documented and prepared for billing in M7.
- SVC-4: helmet services are shop-only (no pickup/delivery).
- SVC-5: the seeded price list exactly as the PRD table (bag rows as two services each, verified with unit test).
- GUEST-1 (price list portion): the landing price list from active services grouped by item kinds with "mulai dari" where flagged, duration display, formatted Rupiah prices, and helmet shop-only notice.
- Evidence in `docs/evidence/M3a/EVIDENCE.md`.

## M3b (0.3.0): Service areas, store settings, and coverage service

AREA-1…AREA-3, AREA-4 (server-side check service), OWN-8 (shop info and slots), OWN-9.

Acceptance criteria:

- AREA-1, AREA-2: the 64 kecamatan of Kota Bandung, Kota Cimahi and Kabupaten Bandung loaded from a committed GeoJSON whose source, license, date and processing are documented; initial active set as AREA-2; the license credit documented.
- AREA-3, OWN-9: the owner switches kecamatan on/off (grouped by kota/kabupaten) on /admin/pengaturan/area without a map (no placeholder per D33; interactive map deferred to M4 per D73); logged.
- AREA-4 (service): server-side point-in-polygon check against active districts built as a service with unit tests (public endpoint and UI deferred to M4 per D73).
- OWN-8 (shop info, slots), SLOT-2: shop name, WhatsApp, address, opening hours, pickup slots (label, capacity 1–20, on/off, defaults) validated with VineJS schemas per key; logged; footer and privacy page read these settings.
- Version bump to 0.3.0 (`package.json`, `package-lock.json`, `CHANGELOG.md`).
- Evidence in `docs/evidence/M3b/EVIDENCE.md`.

## M4a (checkpoint of 0.4.0): Maps, area map and landing coverage check

MAP-2, AREA-1 (credit on maps), AREA-4 (public check), OWN-9 (map), GUEST-1 (coverage check). What D73 moved here: the map on `/admin/pengaturan/area` and the landing coverage check with its map, using `AreaService.checkCoverage`.

Acceptance criteria:

- MAP-2: maps are drawn by MapLibre GL JS from the self-hosted PMTiles file (`pmtiles` protocol, `@protomaps/basemaps` style), loaded only on pages that show a map; the tiles file is an optional setting, empty in `.env.test`, and without it maps show a plain background while pins still work. Fonts and sprites the style needs are self-hosted when the style would load them from another host. A browser test proves that a page with a map makes no request to another host.
- MAP-2, AREA-1: every map has an attribution control (`compact: false`) with "© OpenStreetMap contributors" and the district boundary credit, with a link to the CC BY-IGO 3.0 licence and a note that the data was modified.
- Map display geometry is derived from the full boundaries and used only for drawing; coverage is never decided in the browser.
- OWN-9: `/admin/pengaturan/area` shows the districts on a map, active and inactive distinguished by more than color.
- GUEST-1, AREA-4: the landing coverage check is a text input in the hero: a kecamatan name, forgiving of case, a "Kec." prefix and small typos, answered in one line by the server ("Coblong terjangkau."); 60 requests per minute per IP, with an Indonesian message saying how long to wait. No map on the landing (M4a-fix1, D100). Text place search is not offered to guests (MAP-1).
- `node ace osm:import <YYMMDD>` runs the pipeline of `docs/ARCHITECTURE.md` §6.2 in development: a dated monthly Geofabrik snapshot (D87) checked against its MD5, clipped with the polygon of the 64 kecamatan plus 5 km after checking that it covers every service area (D88), loaded into `osm` and written as a staging dump with a `.sha256` (D89); production loads that dump with two documented commands (`pg_restore`, `psql`), rolls back by loading the previous one (D90), and is refreshed by hand (D91, D92).

## M4b (0.4.0): Place search and addresses

MAP-1, CUST-2, CUST-3, CUST-14, AREA-4 (saving an address). Ends with version 0.4.0.

Acceptance criteria:

- MAP-1: place search for signed-in users only, 30 requests per minute per user with an Indonesian message saying how long to wait; typo and spacing tolerant ("dipati ukur" finds "Jalan Dipatiukur"), generic words ignored; nearby places and the street label under a pin; without the `osm` schema the pin can still be placed by hand.
- AREA-4: every saved pin is checked against active areas on the server; inside/outside feedback after the pin stops moving, as in M4a.
- CUST-2, CUST-3, CUST-14: at most 3 addresses, exactly one primary (database-enforced), deleting the primary promotes the newest; label, recipient name and phone, address text, landmark, pin; list, add, edit, make primary, delete.
- A saved address whose district was turned off later stays saved and shows "Di luar area layanan" in the address list (D82); blocking it when ordering is M5a.
- CUST-3, AREA-4: "Gunakan lokasi saya" only moves the pin to the browser's location, then the normal coverage check runs; refused or unavailable location hides the button quietly and the manual pin still works (D109).

Stops (owner, 2026-11-24): **stop 1** addresses with a pin (`customer_addresses`, `AddressService`, the three pages, the pin on `service_area_map.tsx` with arrow buttons and "Gunakan lokasi saya", the pin check `GET /area/cek-titik`, seeded addresses); **stop 2** place search and the street label from the `osm` schema (signed-in, 30/min per user, D80), seeded `osm` rows in the test database, version 0.4.0.

## M5a (checkpoint of 0.5.0): Online ordering: slots, new order, confirm

SLOT-1…SLOT-3, ORD-1, ORD-2, ORD-3 (the order state machine and its table test), CUST-4…CUST-6 (including the declared items), the "order received" message (MSG-1.1 online version, MSG-3, MSG-4).

Acceptance criteria:

- The order state machine of `docs/ARCHITECTURE.md` §5.1 in one table and one writer method, with the unit test over every status pair.
- SLOT-1: dates tomorrow up to 7 days ahead (Asia/Jakarta), from `pickupDates(hours, from, to)`: open weekdays outside any temporary closure (D104). SLOT-3: full or closed slots disabled; capacity re-checked under a lock when placing (concurrency test: two customers, one last place, one order).
- CUST-5: declared items (1–20 shoes, 1–20 bags, no helmets: SVC-4), addresses, date, slot, note ≤ 300; values kept when going back from the confirmation; "Pesan lagi" prefill.
- CUST-6: confirmation summary; placing re-checks slot capacity and both addresses (AREA-4); a double submit creates one order; the order starts at `awaiting_pickup` with its first timeline event.
- CUST-4: addresses copied into the order; later address edits don't change it.
- MSG-1.1: "order received" with order number and pickup schedule; a failing send is logged and never fails the order (MSG-3); log driver without a token (MSG-4).
- ORD-1: order number `UMC-00042` everywhere.

Stops (approved by the owner, 2026-11-24):

- **Stop 1, data, state machine and placing (backend):** migrations `orders`, `order_addresses` (copies, CUST-4), `order_items` (the declared items now; the inspected items join in M7) and `order_events` (the timeline); the status enum with labels and stages (ORD-2); the order number (ORD-1); the ORD-3 table in one place and `OrderService.transitionOrder` as the only writer, unit-tested over every status pair; slot availability per date (SLOT-1, SLOT-3); `placeOnlineOrder` (locks the `pickup_slots` row `FOR UPDATE` and re-counts, re-checks both addresses with `checkCoverage`, a `request_key` unique per user against double submits, `awaiting_pickup` with its first event, concurrency test); MSG-1.1 sent after commit, logged on failure (MSG-3, MSG-4); seeded orders in every ORD-2 status (status and timeline only).
- **Stop 2, the order pages (CUST-5, CUST-6):** `/pesan` (item rows: shoes with brand, type, EU size; bags with brand, type, S/M/L/XL with SVC-5 hints; up to 20 of each; no helmets), pickup address, delivery address (the same or another saved one), date, slot (full or switched-off disabled), note ≤ 300, an "add address" shortcut that comes back to `/pesan`; the draft kept in the server session (`POST /pesan` validates and stores it, `/pesan/konfirmasi` shows it, "Ubah" returns with every value); "Pesan lagi" (`/pesan?ulang=:id`, own orders only) prefills the items; the flow layout with the main action fixed at the bottom on phones; a "Pesan" link on the dashboard and in the customer navigation; browser tests, evidence, handoff.

Decisions (the owner's answers to the plan's questions, 2026-11-24):

1. An order keeps a copy of its slot's times. A slot with upcoming active orders cannot be deleted, re-timed or overwritten by "copy to other days"; it can only be switched off or have its capacity changed. A capacity lowered below the orders already placed keeps those orders; the slot just shows as full.
2. Per item: type required, brand optional, size required; shoe sizes EU 20–50 in half steps.
3. After placing, the customer goes to `/beranda` with "Pesanan UMC-00042 diterima"; M5b switches this to the order page.
4. The MSG-1.1 text: "Halo {nama}, pesanan UMC-00042 sudah kami terima. Penjemputan: Kamis, 27 Nov 2026, 09.00–12.00." The order link is added in M5b, with the order page.
5. A cancelled order frees its place in the slot; a skipped pickup (`courier_en_route → awaiting_pickup`) keeps it.

Estimate: 14 hours (about 7 per stop).

## M5b (0.5.0): Order pages and tracking

ORD-4 (timeline, without live updates), CUST-1, CUST-7…CUST-9, GUEST-4…GUEST-6.

Acceptance criteria:

- CUST-7: the order page shows status, stage progress, timeline, addresses, declared items; only the owning customer sees it directly.
- GUEST-4, GUEST-5, GUEST-6: anyone else gets the 4-digit unlock; right digits unlock for that session only; 5 wrong tries per 15 minutes per IP and per order, 20 per order per 24 hours; responses don't reveal whether an order exists; an unlocked order shows the same detail without the cancel button.
- CUST-8: cancel only while `awaiting_pickup`, reason 3–200 characters, no message; later statuses show "contact us on WhatsApp".
- CUST-9: the orders list, newest first, status filter (active, finished, cancelled), search by order number.
- CUST-1: first-visit welcome; later the active order panel, quick order and recent orders.
- ORD-4: every status change appends an immutable timeline event.
- MSG-1.1: the online "order received" text gains the order page link (decided with the M5a plan, 2026-11-24).

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
- GUEST-13, CUST-13: creating an account or changing to a number links that number's earlier unlinked walk-in orders. For account registration, this linking happens in `AccountService.createCustomer`, which is the single entry point for all customer creation paths; for a phone change, in `AccountService.changePhone`.

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
- OWN-10: staff accounts: create, edit, reset password, change a staff member's phone (lost phone: no OTP, every session of that member ends), deactivate (sessions ended), last sign-in shown; logged (D108).
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
