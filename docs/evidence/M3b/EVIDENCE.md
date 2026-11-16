# M3b evidence: Service areas, store settings, pickup slots, and coverage service

Date: 2026-11-17. Milestone **M3b** (completion of Milestone M3, version 0.3.0).

## 1. Summary

- **AREA-1 & AREA-2**: 64 subdistricts (kecamatan) across Kota Bandung (30), Kota Cimahi (3), and Kabupaten Bandung (31) loaded from official open geospatial data:
  - Source: "Indonesia – Subnational Administrative Boundaries" (OCHA COD-AB, sourced from Badan Pusat Statistik / BPS), published on Humanitarian Data Exchange (HDX): <https://data.humdata.org/dataset/cod-ab-idn>.
  - License: [Creative Commons Attribution for Intergovernmental Organisations (CC BY-IGO 3.0)](https://creativecommons.org/licenses/by/3.0/igo/).
  - Downloaded archive: `idn_admin_boundaries.geojson.zip` (456,203,094 bytes, SHA-256 `d285a40f9fc4b726b1bda98ee833d52d23d94fe78b6a47c0a769d2e912ff0970`, downloaded 2026-11-16).
  - Mapshaper processing command:
    ```sh
    npx --yes mapshaper@0.7.97 idn_admin3.geojson \
      -filter '"ID3204,ID3273,ID3277".includes(admin2Pcod)' \
      -simplify 15% keep-shapes \
      -each 'city = admin2Name === "Kota Bandung" ? "Kota Bandung" : (admin2Name === "Kota Cimahi" ? "Kota Cimahi" : "Kabupaten Bandung"), name = admin3Name, code = admin3Pcod' \
      -filter-fields city,name,code \
      -o format=geojson database/data/service_areas.geojson
    ```
  - Output committed file: `database/data/service_areas.geojson` (335,630 bytes, SHA-256 `ac68c0621b51b6e308397a8e8d55df41741ea059340b83b645fd8d1682635cc0`, 64 kecamatan MultiPolygon features).
  - Initial active set per AREA-2: All 30 in Kota Bandung, all 3 in Kota Cimahi, and 10 in Kabupaten Bandung (Bojongsoang, Dayeuhkolot, Cileunyi, Margahayu, Margaasih, Katapang, Soreang, Baleendah, Banjaran, Cangkuang); remaining 21 in Kabupaten Bandung start inactive. Total 43 active, 21 inactive. Verified by `tests/unit/service_area.spec.ts`.
- **AREA-3 & OWN-9**: Owner area management at `/admin/pengaturan/area` displaying districts grouped by city/regency with interactive search filter, active count badges, and per-district switch toggles. Toggle actions update immediately via PATCH `/admin/pengaturan/area/:id/toggle` and are recorded in `activity_logs` (`area.toggle`). Per D33 and D73, no map or static placeholder map is rendered in M3b; interactive map arrives in M4.
- **AREA-4 (Service)**: Server-side point-in-polygon coverage check service (`AreaService.checkCoverage(lat, lng)`) utilizing PostGIS spatial indexing (`ST_Intersects` with `ST_SetSRID(ST_MakePoint(lng, lat), 4326)`). Comprehensive unit tests in `tests/unit/service_area.spec.ts` verify:
  1. Coordinate inside active district (e.g. Buahbatu) returns covered `true`.
  2. Coordinate inside inactive district (e.g. Cilengkrang) returns covered `false` with district details.
  3. Coordinate completely outside coverage area (e.g. Jakarta) returns covered `false` with `district: null`.
  4. Coordinate exactly on district boundary edge returns covered `true`.
  5. Dynamic district toggling immediately alters coverage check results.
  Public endpoint and UI are deferred to M4 per D73.
- **OWN-8 & SLOT-2 (Settings Architecture, D75)**: Dynamic store configuration and pickup slots stored in `settings` table (`key` varchar(40) PK, `value` jsonb, `updated_at`). Every key is validated on write and read using dedicated VineJS schemas in `SettingValidator` and `SettingService`.
  - Store info (`store`): `name`, `whatsapp` (validated via `phoneRule`), `address`, and `hours`.
  - Pickup slots (`pickup_slots`): array of `{ id, label, capacity, isActive }` with capacity constrained to 1–20.
  - Owner store settings page at `/admin/pengaturan/toko` with tabbed navigation (`SettingsTabs`) linking to Area Layanan.
  - Changes logged to `activity_logs` (`settings.store.update`, `settings.slots.update`).
  - Landing page footer and privacy policy read dynamically from shared store settings via Inertia middleware.
- **Owner Navigation (D33)**: Added "Pengaturan Toko" (`/admin/pengaturan/toko`) and "Area Layanan" (`/admin/pengaturan/area`) to `owner_links.ts` and `owner_navigation.tsx`.
- **Step 0 Alignment**:
  - `inertia/lib/service_enums.ts` types derived from `@generated/data` with `satisfies Record<ItemKind, string>` and `satisfies Record<ServiceType, string>`, documented in D74.
  - Deprecated React Aria Components `Switch` note documented in Section 6.
  - Archive audit note created at `docs/evidence/M3a-fix/ARCHIVE-AUDIT.md`.

## 2. How to run and see it

```sh
npm install
node ace migration:run
node ace db:seed
npm run dev
```

| Account (seeded)       | Sign in at    | URL                       | What to see                                                                                                                                           |
| ---------------------- | ------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guest (public)         | (none)        | `/` (footer)              | Dynamic store details (address, operating hours, WhatsApp link) rendered in site footer and legal pages                                               |
| `081298765432` (owner) | `/staf/masuk` | `/admin/pengaturan/area` | 64 districts grouped by city/regency, search filter, active count badges, instant switch toggles, no map (D33/D73)                                   |
| `081298765432` (owner) | `/staf/masuk` | `/admin/pengaturan/toko` | Store settings form (name, WhatsApp via PhoneInput, address, hours) and pickup slots editor (capacity 1–20, active switches) with instant validation |

All seeded passwords are `password123`.

## 3. Screenshots

Chromium (Playwright) at 360 × 780, 390 × 844 (2×), and 1440 × 900, full page, against the test server. Every shot was checked with axe (WCAG 2.1 A and AA) and for horizontal scrolling (`scrollWidth <= viewportWidth`); real output recorded in `screenshots-axe.log`.

| State                                                        | Files                             | Viewports (px)   | Axe Violations | Horizontal Scroll |
| ------------------------------------------------------------ | --------------------------------- | ---------------- | -------------- | ----------------- |
| Area Layanan page (`/admin/pengaturan/area`)                 | `admin-area-*`                    | 360, 390, 1440   | 0              | None              |
| Area Layanan district toggled off (`/admin/pengaturan/area`) | `admin-area-toggle-*`             | 360, 390, 1440   | 0              | None              |
| Store settings page (`/admin/pengaturan/toko`)               | `admin-pengaturan-toko-*`         | 360, 390, 1440   | 0              | None              |
| Store settings validation errors (`/admin/pengaturan/toko`)  | `admin-pengaturan-toko-error-*`   | 360, 390, 1440   | 0              | None              |
| Pickup slots section (`/admin/pengaturan/toko`)              | `admin-pengaturan-slot-*`         | 360, 390, 1440   | 0              | None              |
| Owner navigation menu showing new items                      | `admin-nav-mobile-*`              | 360, 390, 1440   | 0              | None              |
| Landing footer showing dynamic store info                    | `landing-footer-*`                | 360, 390, 1440   | 0              | None              |

Each file exists as `-360.png`, `-390.png`, and `-1440.png` (total 21 screenshot files).

## 4. Verification

All checks passed cleanly against PostgreSQL:

| Check                                        | Result               | Full Log File                  |
| :------------------------------------------- | :------------------- | :----------------------------- |
| ESLint Quality Audit (`npm run lint`)        | 0 errors, 0 warnings | [lint.log](lint.log)           |
| TypeScript Compilation (`npm run typecheck`) | 0 errors             | [typecheck.log](typecheck.log) |
| Complete Test Suite (`npm test`)             | 210 passed (210)     | [test.log](test.log)           |
| Axe Accessibility Audit (WCAG 2.1 AA)        | 0 violations         | [screenshots-axe.log](screenshots-axe.log) |
| Viewport Responsive Layout (360, 390, 1440)  | No horizontal scroll | [screenshots-axe.log](screenshots-axe.log) |

## 5. Architecture & Planning Decisions

- **D72**: Split milestone M3 into M3a (services & pricing) and M3b (coverage areas, operating hours, settings).
- **D73**: Defer client-side WebGL maps and interactive map UI to milestone M4.
- **D74**: Frontend service enum types derived from transformer-generated types with `satisfies Record<..., string>`.
- **D75**: Key-value settings stored in `settings` table with per-key VineJS schema validation on both write and read.

## 6. Deviations & Workarounds

1. **`Switch` Component Primitive (`inertia/components/ui/switch.tsx`)**:
   - The default shadcn CLI template for `switch.tsx` imports and wraps `Switch` directly from `react-aria-components`.
   - In installed `react-aria-components` (v1.6.0+), `Switch` is flagged with `@deprecated`:
     ```ts
     /**
      * A switch allows a user to turn a setting on or off.
      *
      * @deprecated Use SwitchField + SwitchButton instead.
      */
     export declare const Switch: (props: SwitchProps & React.RefAttributes<HTMLLabelElement>) => React.ReactElement | null;
     ```
   - Per project hard rule ("Never silence a rule: no eslint-disable, no deprecated APIs"), `inertia/components/ui/switch.tsx` implements the non-deprecated `SwitchField` + `SwitchButton` primitives from `react-aria-components` instead of the deprecated `Switch`.

