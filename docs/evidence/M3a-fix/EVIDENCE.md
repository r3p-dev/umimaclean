# M3a-fix Evidence: Catalog Review Corrections, Non-Deprecated Components, and State Verification

Date: 2026-11-16. Checkpoint **M3a-fix** (review corrections for M3a, version remains 0.2.2; version 0.3.0 is scheduled for the completion of M3b).

## 1. Summary of Changes

This checkpoint addresses all 9 review findings on M3a:

1. **`look.spec.ts` route fallback**:
   - *Root cause*: `look.spec.ts` previously defined a route handler returning `route.continue()`. In Playwright, `route.continue()` sends requests directly to the network, bypassing earlier decorators in `tests/bootstrap.ts` that fulfill Cloudflare Turnstile requests with a local fake script. Consequently, requests to `challenges.cloudflare.com` hung on `waitForLoadState('networkidle')`.
   - *Fix*: Changed `route.continue()` to `route.fallback()` in line 38 of `look.spec.ts`, allowing intercepted Turnstile script requests to fall through to the fake Turnstile handler in `tests/bootstrap.ts`. Reverted `waitForLoadState` back to `'networkidle'`.
2. **ESLint boundary & Frontend Enums (D74)**:
   - Reverted `eslint.config.js` to pristine v0.2.2 (removed `#enums/**` import allowance in frontend).
   - Created `inertia/lib/service_enums.ts` containing frontend-side `ItemKind`, `ItemKindLabel`, `ServiceType`, and `ServiceTypeLabel`.
   - Updated `pricing_section.tsx` and `admin/services.tsx` to import from `~/lib/service_enums`.
   - Recorded Decision **D74** in `docs/ARCHITECTURE.md` §7.
3. **Regenerated shadcn `dialog.tsx` and `switch.tsx`**:
   - Re-executed `npx shadcn@latest add dialog switch --overwrite --yes` using `components.json`.
   - Converted file names to snake_case (`dialog.tsx`, `switch.tsx`).
   - Removed all `dark:` class overrides per project design guidelines.
   - Migrated `Switch` from deprecated RAC `SwitchPrimitive` to `SwitchField` and `SwitchButton` primitives (following Decision D49), eliminating `@typescript-eslint/no-deprecated` warnings while preserving 44 px touch targets and keyboard focus rings.
   - Replaced arbitrary sizing (`w-[32px]`, `h-[14px]`) with canonical Tailwind CSS v4 utility classes (`w-8`, `h-3.5`).
   - Saved raw CLI output to [shadcn-add.log](shadcn-add.log) and unified diffs to [shadcn-dialog.diff](shadcn-dialog.diff) and [shadcn-switch.diff](shadcn-switch.diff).
4. **Archive Usage Audit**:
   - Inspected files during M3a:
     1. `umimaclean-archive/database/seeders/service_seeder.ts` (read service names & prices)
     2. `umimaclean-archive/app/models/service.ts` (inspected archive column names)
     3. `umimaclean-archive/inertia/pages/admin/services.tsx` (inspected layout & actions)
     4. `umimaclean-archive/inertia/components/organisms/catalog/service_dialogs.tsx` (inspected dialog fields)
     5. `umimaclean-archive/inertia/components/ui/dialog.tsx` (inspected RAC modal structure)
   - *Confirmation*: No code or text was copied from the archive. All schemas, models, controllers, services, and Inertia components were written from scratch adhering strictly to `docs/PRD/` and `docs/CONVENTIONS.md`.
5. **`formatRupiah` Boundary Analysis**:
   - Backend `app/helpers/money.ts`: Used exclusively on the server in `PriceListService.updateService` to generate human-readable price difference strings in `activity_logs` audit records (e.g. `Rp 25.000 -> Rp 30.000`).
   - Frontend `inertia/lib/format.ts`: Used on the client to format prices in Inertia React components (`pricing_section.tsx`, `admin/services.tsx`).
   - Both implementations are necessary to maintain domain separation without violating `@adonisjs/no-backend-import-in-frontend`.
6. **Row-by-Row Seed Test**:
   - `tests/unit/service_seed.spec.ts` explicitly asserts every row of the seed against the table in `docs/PRD/shared.md` §1 in exact row order: `name`, `type`, `itemKinds`, `price`, `estimatedDays`, and `isStartingFrom`.
7. **Responsive Screenshots & Axe Audits**:
   - Captured all 21 requested screenshots (7 states × 3 viewports: 360 px, 390 px, 1440 px).
   - All states passed automated Axe WCAG 2.1 AA audits (0 violations) and horizontal scroll checks (`scrollWidth <= viewportWidth`) recorded in [screenshots.log](screenshots.log).
8. **Version Audit**:
   - Verified git tag history: `v0.1.0` (M1c), `v0.1.1` (M1c fix), `v0.1.2` (M1c fix 2), `v0.2.0` (M2c), `v0.2.1` (M2c fix), `v0.2.2` (pre-M3 step 0).
   - Checkpoints M1a, M1b, M2a, and M2b carried version "–" in `docs/PLAN.md` with no tags.
   - Version remains `0.2.2`; bump to `0.3.0` is planned for the completion of M3b.

## 2. Screenshot Catalog

All screenshots captured with Playwright across 3 responsive viewports:

| State | 360 px | 390 px | 1440 px |
| :--- | :--- | :--- | :--- |
| Landing price list filtered to Helm (`/#harga`) | [landing-harga-helm-360.png](landing-harga-helm-360.png) | [landing-harga-helm-390.png](landing-harga-helm-390.png) | [landing-harga-helm-1440.png](landing-harga-helm-1440.png) |
| Owner mobile menu / sidebar showing "Layanan" | [admin-menu-layanan-360.png](admin-menu-layanan-360.png) | [admin-menu-layanan-390.png](admin-menu-layanan-390.png) | [admin-menu-layanan-1440.png](admin-menu-layanan-1440.png) |
| Owner catalog empty search result | [admin-layanan-empty-360.png](admin-layanan-empty-360.png) | [admin-layanan-empty-390.png](admin-layanan-empty-390.png) | [admin-layanan-empty-1440.png](admin-layanan-empty-1440.png) |
| Owner catalog with inactive service | [admin-layanan-inactive-360.png](admin-layanan-inactive-360.png) | [admin-layanan-inactive-390.png](admin-layanan-inactive-390.png) | [admin-layanan-inactive-1440.png](admin-layanan-inactive-1440.png) |
| Owner catalog bulk selection bar | [admin-layanan-bulk-360.png](admin-layanan-bulk-360.png) | [admin-layanan-bulk-390.png](admin-layanan-bulk-390.png) | [admin-layanan-bulk-1440.png](admin-layanan-bulk-1440.png) |
| Owner catalog delete confirmation dialog | [admin-layanan-delete-360.png](admin-layanan-delete-360.png) | [admin-layanan-delete-390.png](admin-layanan-delete-390.png) | [admin-layanan-delete-1440.png](admin-layanan-delete-1440.png) |
| Owner catalog add dialog validation errors | [admin-layanan-error-360.png](admin-layanan-error-360.png) | [admin-layanan-error-390.png](admin-layanan-error-390.png) | [admin-layanan-error-1440.png](admin-layanan-error-1440.png) |

## 3. Verification Quality Gates

Real command output logs:

| Gate | Baseline | Final | Status |
| :--- | :--- | :--- | :--- |
| ESLint (`npm run lint`) | [baseline-lint.log](baseline-lint.log) (0 errors) | [lint.log](lint.log) (0 errors) | PASSED |
| TypeScript (`npm run typecheck`) | [baseline-typecheck.log](baseline-typecheck.log) (0 errors) | [typecheck.log](typecheck.log) (0 errors) | PASSED |
| Full Test Suite (`npm test`) | [baseline-test.log](baseline-test.log) (185 passed) | [test.log](test.log) (186 passed) | PASSED |
| Axe WCAG 2.1 AA Audits | 0 violations | [screenshots.log](screenshots.log) (0 violations) | PASSED |
| Viewport 360 px Responsive Layout | No horizontal scroll | [screenshots.log](screenshots.log) (all <= width) | PASSED |

## 4. Architecture Decisions

- **D74**: Frontend service enum definitions and labels isolated in `inertia/lib/service_enums.ts` instead of importing backend `#enums/service_enums` or modifying ESLint configuration.
