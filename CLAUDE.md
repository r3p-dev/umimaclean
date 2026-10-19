# Umima Clean (skripsi)

Shoe, bag and helmet cleaning service with pickup and delivery in Bandung Raya. Three roles: Pelanggan (customer, no account), Staf, Owner/Admin. UI language is Indonesian.

Stack: AdonisJS 7 + Inertia + React 19, Tailwind CSS v4, shadcn/ui (React Aria base, `aria-vega` style, `react-aria-components`), Tabler icons (`@tabler/icons-react`).

## Building a page

Read `docs/design-system.md` before writing any UI. It holds the tokens, components, patterns and the recipe for porting a `.dc.html` artboard (box-model fixes, `data-r` → Tailwind table, verification).

Artboard exports live in `docs/design/` (one folder per page and width, with the canvas runtime). Serve that folder with `python3 -m http.server` to view the original and compare it with the page.

- Tokens live only in `inertia/css/app.css`. Use token utilities (`bg-primary`, `text-muted-foreground`, `h-cta`, `rounded-md`, `text-title`); the default Tailwind palette is removed, so no raw colors.
- shadcn primitives live in `inertia/components/ui/` (the CLI writes there through `components.json`; answer **No** when it offers to overwrite existing files) and are restyled per section 4 of the design doc. Everything else follows atomic design: `inertia/components/{atoms,molecules,organisms,templates}`; layouts are templates. Pages own state and navigation and compose organisms.
- Logic lives in `inertia/lib/<feature>/` (customer: shared, order, location, navigation, verification, tracking, payment, reviews; staff: staff, tasks, processing, store, proof, history; owner: orders, customers, activity, reports, catalog, settings, export), never in components.
- Pages from `docs/design/` live by role: customer pages in `inertia/pages/customer/<feature>/` (only the landing `pages/home.tsx` stays at the root), staff pages (S-xx) in `inertia/pages/staff/`, owner pages (A-xx) in `inertia/pages/admin/`. Routes: `/staf/*` named `staff.*`, `/admin/*` named `admin.*`.
- Icons: `import { IconSearch } from '@tabler/icons-react'` (`IconXxxFilled` for filled; `components.json` has `iconLibrary: "tabler"`). Artboards name Material Symbols: map them with the table in section 7 of the design doc. Never lucide or Material.
- Breakpoints: base = Ponsel, `sm:` = Tablet (600px), `lg:` = Desktop (1024px). Do not use `md:` for layout.
- Every customer page uses the landing's container, `mx-auto box-content max-w-page px-5`, for its header, content and footer. The landing and error pages use `CustomerLayout` (`components/templates/customer_layout.tsx`). Focused flows (order, tracking, payment, staff task and camera) use `FlowLayout` with `FlowHeader` and `FlowFooter`. The order flow has three steps (Data Diri includes the pickup location) and shows `StepProgress` on each. The back control never sits in the header before the logo: use `BackLink` next to the page's main action. Staff pages use `StaffLayout` + `StaffTopBar`; owner pages use `AdminLayout` + `AdminPageHeader`; owner tables use `useDataTable` with the parts in `organisms/data_table/`.
- No backend yet: the order draft is in `sessionStorage`, orders and the verified device in `localStorage`, sample orders in `lib/tracking/orders.ts`. Demo OTP is `123456`. The staff day lives in one `sessionStorage` store (`lib/staff/workday.ts`); owner edits persist in `localStorage` (`createSharedStore`). Staff and owner pages are not behind auth yet; the starter kit's email login, User model and `@adonisjs/auth` were removed, so add auth when staff and owner sign-in is designed. In development a "Demo" select switches order/payment states and resets staff demo data.
- Adding a scale token (`--text-*`, `--radius-*`, `--shadow-*`, `--spacing-*`): also add its name to `inertia/lib/shared/utils.ts`.

## Conventions

- No comments in any file (code, CSS, config, JSON, dotfiles).
- File names snake_case; shadcn files in `inertia/components/ui/` stay kebab-case.
- When copying artboard sizes, check the tag: `<button>` is border-box, `<a>`/`<span>` add their border (see section 7 of the design doc).
- Prettier (AdonisJS config: single quotes, no semicolons). Format touched files with `npx prettier --write`.

## Dependencies

- Keep packages at their latest versions (`npm outdated`). TypeScript stays on 6.x: `@adonisjs/assembler` and `typescript-eslint` don't accept 7 yet.
- After adding or renaming routes, run `node ace codegen` so `urlFor` and `<Link route>` stay typed.

## Commands

- `npm run dev` (http://localhost:3333)
- `npm run typecheck`
- `npm run lint`
