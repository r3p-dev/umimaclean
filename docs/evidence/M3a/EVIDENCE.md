# M3a evidence: Services & pricing, catalog management, landing price list

Date: 2026-11-16. Checkpoint **M3a** (first part of M3, services & prices, version 0.2.2; version 0.3.0 is at the end of M3b per approved plan).

## 1. Summary

- **SVC-1**: Service model & migration (`services` table) with `name`, `type` (`main`, `addon`), `item_kinds` (JSON array: `shoe`, `bag`, `helmet`), `price` in IDR, `estimated_days`, `is_starting_from` flag ("mulai dari"), and `description`.
- **SVC-2**: Services can be deactivated and reactivated by the owner (`/admin/layanan`). Soft deletion (`deleted_at`) retains historical data and integrity while hiding services from active catalog views; soft-deleted services cannot be toggled.
- **SVC-3**: `display_order` column provides deterministic sequencing for service listings in the owner admin and on the public landing page.
- **SVC-4**: Helmet services restricted exclusively to workshop drop-off (store only, no pickup/delivery). An informative alert is displayed on the landing page pricing section whenever helmet services are shown, and the model restricts item kinds accordingly.
- **SVC-5**: Seeded catalog contains exactly 22 services matching the PRD table in `docs/PRD/shared.md` §1 (including 8 separate bag size and material variants, and helmet services). Verified by `tests/unit/service_seed.spec.ts` comparing count, names, prices, starting from flags, and helmet exclusivity.
- **OWN-7**: Owner management UI at `/admin/layanan` with responsive desktop table and mobile cards, real-time search, service type filter (`Semua`, `Utama`, `Tambahan`), item kind filter, switch toggle per row, bulk selection and activation/deactivation bar, create service modal dialog, edit service modal dialog, and soft-delete confirmation dialog. All owner actions are recorded in `activity_logs` with before/after diffs (`service.create`, `service.update`, `service.toggle`, `service.bulk_toggle`, `service.delete`).
- **GUEST-1**: Landing page pricing section (`id="harga"`) with category filter pills (`Semua Layanan`, `Sepatu`, `Tas`, `Helm`), transparent price guideline callout ("Harga Acuan Transparan"), helmet workshop-only alert, and responsive cards split into Layanan Utama and Layanan Tambahan.
- **Deferrals to M4 (D72, D73)**: Client-side WebGL maps (`maplibre-gl`, `pmtiles`, `@protomaps/basemaps`), interactive area map on `/admin/pengaturan/area`, and public coverage check on landing page are deferred to M4 per owner instructions. In M3b, `/admin/pengaturan/area` provides district toggles grouped by regency/city without a map placeholder (D33).

## 2. How to run and see it

```sh
npm install
node ace migration:run
node ace db:seed
npm run dev
```

| Account (seeded)       | Sign in at    | URL              | What to see                                                                                                                                           |
| ---------------------- | ------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guest (public)         | (none)        | `/#harga`        | Interactive pricing section with category filter pills, transparent pricing notice, helmet workshop-only alert, and main & addon service cards       |
| `081298765432` (owner) | `/staf/masuk` | `/admin/layanan` | Full services catalog CRUD: search, filters, active switch toggles, bulk activation bar, add & edit modal dialogs, soft deletion, and activity logs |

All seeded passwords are `password123`.

## 3. Screenshots

Chromium (Playwright) at 360 × 780, 390 × 844 (2×), and 1440 × 900, full page, against the test server. Every shot was checked with axe (WCAG 2.1 A and AA) and for horizontal scrolling; real output recorded in `screenshots.log`.

| State                                                      | Files                       |
| ---------------------------------------------------------- | --------------------------- |
| Landing page pricing section (`/#harga`)                   | `landing-harga-*`           |
| Owner services management page (`/admin/layanan`)          | `admin-layanan-*`           |
| Owner services add/edit modal dialog (`/admin/layanan`)    | `admin-layanan-dialog-*`    |
| Owner services search/filter active (`/admin/layanan?q=…`) | `admin-layanan-filter-*`    |

Each file exists as `-360.png`, `-390.png`, and `-1440.png`.

## 4. Verification

All checks passed cleanly against PostgreSQL:

| Check                                        | Result               | Full Log File                      |
| :------------------------------------------- | :------------------- | :--------------------------------- |
| ESLint Quality Audit (`npm run lint`)        | 0 errors, 0 warnings | [lint.log](lint.log)               |
| TypeScript Compilation (`npm run typecheck`) | 0 errors             | [typecheck.log](typecheck.log)     |
| Complete Test Suite (`npm test`)             | 185 passed (185)     | [test.log](test.log)               |
| Axe Accessibility Audit (WCAG 2.1 AA)        | 0 violations         | Verified in browser suite and logs |
| Viewport 360 px Responsive Layout            | No horizontal scroll | Verified in browser suite and logs |

## 5. Architecture & Planning Decisions

- **D72**: Split milestone M3 into M3a (services & pricing) and M3b (coverage areas, operating hours, settings).
- **D73**: Defer client-side WebGL maps and interactive map UI to milestone M4.
