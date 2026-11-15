# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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
