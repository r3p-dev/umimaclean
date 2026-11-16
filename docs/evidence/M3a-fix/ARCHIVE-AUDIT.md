# M3a Archive Inspection Audit

This document records every file in `umimaclean-archive/` that was consulted during the development of milestone **M3a** and **M3a-fix**, what was inspected, and what was used.

In accordance with workspace rules:
- `umimaclean-archive/` was accessed strictly in read-only mode.
- No code, markup, or copy was copied wholesale.
- All implementations in `umimaclean/` were written cleanly from `docs/PRD/` specifications and `docs/CONVENTIONS.md`.

## Inspected Archive Files

1. **`database/seeders/service_seeder.ts`**
   - *What was inspected*: The 22 service catalog seed entries, including category classifications, item kinds, base prices, estimated completion times, and starting-from indicators.
   - *What was used*: Cross-referenced with `docs/PRD/shared.md` §1 to ensure the new seeder (`database/seeders/service_seeder.ts`) and test (`tests/unit/service_seed.spec.ts`) accurately reflect the official 22 service offerings.

2. **`database/migrations/1715000000003_create_services_table.ts`** (and related migration history)
   - *What was inspected*: Schema definitions for service attributes (`name`, `type`, `item_kinds`, `price`, `estimated_days`, `is_starting_from`, `description`, `is_active`, `display_order`, `deleted_at`).
   - *What was used*: Confirmed column definitions for the new migration `1763294000000_create_services_table.ts`, implementing snake_case database conventions and soft delete support.

3. **`app/models/service.ts`**
   - *What was inspected*: Lucid model properties, JSON serializer/deserializer for `itemKinds`, and query scopes (`active`, `available`, `ordered`).
   - *What was used*: Structured the new `Service` model in `app/models/service.ts` extending `ServiceSchema`, with proper typed attributes and query scopes.

4. **`inertia/pages/admin/services.tsx`**
   - *What was inspected*: Owner catalog interface organization, responsive layout split between desktop table and mobile cards, live filter triggers, active switch toggles, and bulk action toolbar.
   - *What was used*: Visual layout reference for rebuilding `/admin/layanan`. Replaced custom archive CSS classes with standard Tailwind CSS v4 and shadcn components.

5. **`inertia/components/organisms/catalog/service_dialogs.tsx`**
   - *What was inspected*: Modal dialog forms for adding/editing services and soft-delete confirmation dialog.
   - *What was used*: Layout and field structure for add/edit/delete dialogs; rewritten using React Aria Components and shadcn dialog primitives.

6. **`inertia/components/organisms/landing/pricing_section.tsx`**
   - *What was inspected*: Public price list section, category filter buttons (`Sepatu`, `Tas`, `Helm`), transparent pricing callout, and helmet workshop-only notice.
   - *What was used*: Rebuilt as `inertia/components/organisms/landing/pricing_section.tsx` adhering to GUEST-1 and SVC-4 requirements.

7. **`inertia/components/ui/dialog.tsx`**
   - *What was inspected*: React Aria modal dialog wrapper styling.
   - *What was used*: Temporary reference in initial M3a; completely replaced in M3a-fix by running official shadcn CLI (`npx shadcn@latest add dialog`) with snake_case naming and canonical styling.

8. **`inertia/components/ui/switch.tsx`**
   - *What was inspected*: React Aria switch styling and toggle animation classes.
   - *What was used*: Temporary reference in initial M3a; completely replaced in M3a-fix by running official shadcn CLI (`npx shadcn@latest add switch`), migrating from deprecated `SwitchPrimitive` to `SwitchField` + `SwitchButton` primitives per Decision D49.

## Conclusion
Zero lines of code were copied from `umimaclean-archive/`. All components, models, controllers, and tests were authored freshly adhering to current project conventions and PRD requirements.
