# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `node ace osm:import <YYMMDD>` (development): loads the street and place data for address search from a dated monthly OpenStreetMap snapshot of Java, clipped to the service areas plus 5 km, and writes the file production loads with two documented commands; a bad import is undone by loading the previous file.
- Maps from the self-hosted base map, with the OpenStreetMap and district boundary credits always visible (MAP-2, AREA-1).
- The owner's service area page shows the districts on a map, active ones filled and outlined, inactive ones dashed (OWN-9).
- The landing has an "Area Layanan" section: guests check whether a location is covered with "Gunakan lokasi saya" or by dragging a pin, limited to 60 checks per minute per IP (GUEST-1, AREA-4).

## [0.3.2] - 2026-11-17

### Changed

- A price list tab with a "mulai dari" price says under its list that such prices are confirmed after
  the items are inspected (GUEST-1, STAFF-9).

### Fixed

- The demo accounts printed after seeding in development show the owner number the seeder created,
  including one set with `ADMIN_PHONE`.

## [0.3.1] - 2026-11-17

### Changed

- Service areas are checked against the district boundaries at their full source resolution instead of
  a simplified copy, so pins near a district border are judged correctly (AREA-1, AREA-4).
- A pin exactly on the border between an active and an inactive district counts as covered, every time
  (AREA-4).
- The seeders run in a fixed order from one index seeder, and the demo accounts are printed only in
  development.
- `npm test` no longer changes committed files: screenshots go to `tmp/screenshots/`, and evidence
  folders are written only when `EVIDENCE_DIR` is set, never overwriting a file.
- The landing price list shows one tab per item kind with a list of prices, the add-ons in one card
  and the helmet store-only note in the helmet tab; the explanatory texts above it are gone (GUEST-1,
  SVC-4).
- Rate limits for the coverage check (60 per minute per IP) and place search (30 per minute per user)
  added to the requirements; M4 split into M4a and M4b.

## [0.3.0] - 2026-11-17

### Added

- Services & pricing catalog with main and addon types, item kinds (shoes, bags, helmets), IDR prices,
  estimated turnaround days, "mulai dari" flags, descriptions, and display ordering (SVC-1, SVC-2, SVC-3).
- Soft deletion and active status toggling for services; soft-deleted services preserve historical order
  references and cannot be toggled back on (SVC-2).
- Helmet services shop-only restriction: helmet cleaning is available exclusively via walk-in drop-off at
  the workshop (SVC-4).
- 22 seeded services matching the PRD specification table exactly, verified by unit tests (SVC-5).
- Owner services management dashboard at `/admin/layanan` with desktop table and mobile cards, real-time
  search, category/type filter pills, switch toggles, bulk activation/deactivation bar, and modal dialogs
  for adding, editing, and soft-deleting services (OWN-7).
- Public landing page pricing schedule (`/#harga`) with category filter pills, transparent pricing guide
  callout, helmet walk-in alert, and responsive service cards (GUEST-1).
- 64 subdistrict coverage boundaries (Kota Bandung: 30, Kota Cimahi: 3, Kabupaten Bandung: 31) processed
  from official OCHA COD-AB data (CC BY-IGO 3.0), seeded with initial active set of 43 active and 21
  inactive districts (AREA-1, AREA-2).
- Owner service area dashboard at `/admin/pengaturan/area` with districts grouped by city/regency,
  search filter, summary active badges, and per-district switch toggles; client-side maps deferred to
  M4 without placeholders (D33, D73, AREA-3, OWN-9).
- Server-side point-in-polygon coverage check service (`AreaService.checkCoverage`) utilizing PostGIS
  spatial indexing with unit tests covering active, inactive, outside, and boundary coordinates (AREA-4).
- Key-value `settings` table with per-key VineJS schema validation on write and read (D75).
- Owner store settings dashboard at `/admin/pengaturan/toko` with store identity (name, WhatsApp via
  `PhoneInput`, address, operating hours) and daily pickup slot capacity editor (1–20) (OWN-8, SLOT-2).
- Dynamic store information in public site footer and legal pages rendered from database settings via
  shared Inertia props.
- Owner navigation links for "Pengaturan Toko" and "Area Layanan" added to sidebar and mobile sheet menu.
- Activity logs recorded for all owner actions: service CRUD, area toggle, store settings update, and
  pickup slots update.

## [0.2.2] - 2026-11-16

### Changed

- Upgraded `eslint` from 10.14.0 to 10.15.0 to close the `minimatch` advisory path through ESLint.
- The test suite now runs on dedicated `PORT=3334` and `APP_URL=http://${HOST}:${PORT}` via `.env.test`
  (D71), so `npm test` works out of the box while the development server is running on port 3333.

## [0.2.1] - 2026-11-16

### Changed

- A successful password change now signs out every other device and ends their remembered
  sign-ins, like a password reset or a phone change; the form says so (ACC-5).
- The brand blue is slightly darker, so white text on a hovered primary button meets WCAG AA
  (4.7:1 instead of 4.1:1).

## [0.2.0] - 2026-11-16

### Added

- Accounts with a WhatsApp number and password for every role: customers sign in at `/masuk`,
  staff and the owner at `/staf/masuk`, each with "Ingat saya" (180 days) and sign-out, and each
  role lands on its own home (`/beranda`, `/staf`, `/admin`) (GUEST-11, STAFF-1, ACC-1, ACC-3).
- Access per role on every signed-in page; staff and owner sign-ins update the last-seen time and
  are written to the activity log (STAFF-1).
- Sign-up at `/daftar` with a WhatsApp code on `/verifikasi`; the account is created only after
  the code is confirmed, and the pending data stays on the server (GUEST-10, ACC-2).
- Forgot password (`/lupa-kata-sandi` → `/verifikasi` → `/kata-sandi-baru`) without revealing
  whether a number is registered; a reset signs out every other device (GUEST-12, ACC-5).
- WhatsApp codes: 6 digits, valid 5 minutes, locked after 5 wrong tries, resend after 60 seconds,
  at most 5 sends per number and 20 per IP per hour, stored only as a keyed hash (ACC-2).
- Bot check on sign-up, forgot password and code resend (Cloudflare Turnstile).
- WhatsApp messages written to the log without a Fonnte token, and only sent to allowed numbers
  outside production; phone numbers are masked in logs (MSG-4, ACC-1).
- Profiles: customers at `/profil` (change the name, change the number with a code sent to the new
  number), staff at `/staf/profil`, the owner at `/admin/profil` (CUST-12, CUST-13, OWN-13,
  STAFF-16).
- Account security on every profile: change the password with the current one, see the number of
  active devices, and "Keluar dari perangkat lain", which also ends their remembered sign-ins
  (ACC-4). A phone change signs out every other device too (ACC-5).
- Limits on failed attempts: sign-in 5 per number and 50 per IP per 15 minutes, password change
  5 per account per 15 minutes, each with a message saying how long to wait (ACC-3, ACC-4).
- `TRUSTED_PROXIES`: the client IP is read from `X-Forwarded-For` only when the request comes from
  a listed proxy (default: loopback).
- Demo accounts from the seeder: one owner, two staff and customers.

### Changed

- The email sign-up and sign-in of the starter are replaced by the accounts above.
- Navigation shows only pages that exist; "Profil" is now reachable for every role.
- A wrong number or password shows "Nomor atau kata sandi salah."

## [0.1.2] - 2026-11-15

### Fixed

- Recorded "Yang kami cuci" item photos in `docs/DEPENDENCIES.md` §4 and D39 as Unsplash stock photos under the Unsplash License with source pages noted as unrecorded; removed duplicate photo row in DEPENDENCIES and duplicate D43 row in ARCHITECTURE.
- Refined project documentation to ensure all descriptions refer directly to project specifications and current design.
- Clarified privacy wording on `/privasi` (GUEST-2) by listing Google Maps/Waze as external services receiving only destination coordinates, without customer PII.
- Preserved shadcn `Card` styling and semantic slots (`CardContent`, `CardFooter`) in `reviews_section.tsx`; used semantic `<figure>` and `<figcaption>` for `laundry_items.tsx`; locked convention against class-by-class styling cancellation in `docs/CONVENTIONS.md` §9.
- Cleaned reviews carousel: replaced arbitrary `basis-[84%]` with scale value `basis-5/6`, added braces to `if`, removed redundant `queueMicrotask`, and stripped what-comments.
- Upgraded ESLint rule `tailwind-canonical-classes` from `'warn'` to `'error'` in `eslint.config.js` to ensure zero warnings.
- Fixed `docs/SETUP.md` for clean environments (removed seed step, added `node ace generate:key`, `playwright install chromium`, and Protomaps build selection guidance); consolidated map commands in SETUP.md and linked from ARCHITECTURE §6.

## [0.1.1] - 2026-11-14

### Added

- `docs/SETUP.md` with reproducible zero-to-running bootstrap instructions and complete teardown/cleanup steps.
- Official shadcn/ui components: `Carousel` (backed by `embla-carousel-react`), `Card`, and `Badge`.
- Locked rule in `docs/CONVENTIONS.md` mandating the use of official shadcn/ui primitives over bespoke UI hooks.
- `eslint-plugin-tailwind-canonical-classes` linter rule to enforce canonical Tailwind CSS v4 class names across Inertia components.
- Mobile reviews carousel powered by shadcn `Carousel` with pagination indicators and touch-friendly controls.
- Item photos for the "Yang kami cuci" section (shoes, bag, helmet from Unsplash in WebP and JPEG, EXIF stripped).

### Changed

- Updated D39 in `docs/ARCHITECTURE.md` to document the use of Unsplash stock photos under the Unsplash License for "Yang kami cuci".
- Refactored `reviews_section.tsx`, `laundry_items.tsx`, and `hero.tsx` to compose official shadcn/ui primitives (`Carousel`, `Card`, `Badge`).
- Revised privacy policy on `/privasi` to reflect that external navigation links (Google Maps and Waze) open anonymous coordinates without transmitting customer PII.

## [0.1.0] - 2026-11-14

### Added

- Landing page: hero with a before/after photo comparison, the items we clean, how it works,
  customer reviews and frequently asked questions, with the photo credit in the footer (GUEST-1).
- Terms (`/syarat`) and privacy (`/privasi`) pages, including the outside services that receive
  data (GUEST-2).
- Titles, descriptions and Open Graph tags on public pages, a link preview image, `/sitemap.xml`
  and `/robots.txt` (GUEST-3). Public pages are server-rendered.
- The Umima look: Tailwind and shadcn (React Aria) with the brand colors, the Instrument Sans
  typeface, the logo and icons; page templates for the public, sign-in, customer, step-by-step,
  staff, owner and print areas; 404 and 500 pages; template previews outside production.
- Browser tests for outside requests, language, headings, focus, the light theme, horizontal
  scrolling at 360 px and accessibility (axe).
- Local routing and map data tools in `compose.yaml`, the OpenStreetMap import style and SQL, and
  the OSRM motorbike profile.

### Changed

- The whole interface is in Indonesian with one light theme.
- Development and tests use their own databases on a shared PostgreSQL 18 / PostGIS 3.6 server,
  and the test run migrates its own database.
- The sign-up form requires a name.
