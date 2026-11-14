# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.1] - 2026-11-14

### Added

- `docs/SETUP.md` with reproducible zero-to-running bootstrap instructions and complete teardown/cleanup steps.
- Official shadcn/ui components: `Carousel` (backed by `embla-carousel-react`), `Card`, and `Badge`.
- Locked rule in `docs/CONVENTIONS.md` mandating the use of official shadcn/ui primitives over bespoke UI hooks.
- `eslint-plugin-tailwind-canonical-classes` linter rule to enforce canonical Tailwind CSS v4 class names across Inertia components.
- Mobile reviews carousel powered by shadcn `Carousel` with pagination indicators and touch-friendly controls.
- Original store asset photos for the "Yang kami cuci" section (shoes, bag, helmet in WebP and JPEG, EXIF stripped).

### Changed

- Updated D39 in `docs/ARCHITECTURE.md` to document the use of original archive store photos as internal assets for "Yang kami cuci".
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
