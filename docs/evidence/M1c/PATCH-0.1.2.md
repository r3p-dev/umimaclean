# Evidence: Patch 0.1.2

Date: 2026-11-15. Patch release for version **0.1.2**.

## 1. Summary of Changes

1. **Item Photos Attribution (D39, DEPENDENCIES §4)**:
   - Documented the "Yang kami cuci" item photos as Unsplash stock photos under the Unsplash License (free commercial and non-commercial use, no attribution required).
   - Identified the shoes photo: "Black and white converse all star low top sneakers" by Peter Olexa (@deeezyfree), <https://unsplash.com/photos/black-and-white-converse-all-star-low-top-sneakers-7a785ad3a291>.
   - Recorded bag and helmet as "source page not recorded".
   - Rewrote D39 in `docs/ARCHITECTURE.md`. Removed the duplicated photo row in `docs/DEPENDENCIES.md` and the duplicated D43 row in `docs/ARCHITECTURE.md`.

2. **Removal of Prohibited Documentation Terms**:
   - Removed all references to archive repositories, thesis context, or earlier implementations in `docs/ARCHITECTURE.md`, `docs/DEPENDENCIES.md`, and `CHANGELOG.md`.

3. **Privacy Policy Clarification (GUEST-2)**:
   - In `inertia/pages/legal/privacy.tsx`, removed "secara anonim" and restored Google Maps / Waze as an explicit list item under "Pihak lain yang menerima data".
   - Explicitly clarified that when staff opens navigation, the map applications receive only destination coordinates, never customer name, phone number, or order details.

4. **shadcn Component Usage & Conventions**:
   - Preserved `Card` styling and semantic slots (`CardContent`, `CardFooter`) in `ReviewCard` (`reviews_section.tsx`) without class overrides cancelling its appearance (`border-0`, `bg-transparent`, `p-0`, `shadow-none`, `ring-0`).
   - Refactored `laundry_items.tsx` to use semantic `<figure>` and `<figcaption>` instead of `Card`.
   - Added convention in `docs/CONVENTIONS.md` §9 mandating using shadcn components for what they are with minimal overrides, avoiding class-by-class cancellations.

5. **Reviews Carousel Refactoring**:
   - Replaced arbitrary `basis-[84%]` with scale value `basis-5/6`.
   - Added braces to all `if` blocks.
   - Removed unnecessary `queueMicrotask` workaround by invoking `onSelect()` directly inside `useEffect` upon Embla API availability.
   - Removed what-comments.

6. **Zero Lint Warnings**:
   - Upgraded `tailwind-canonical-classes/tailwind-canonical-classes` from `'warn'` to `'error'` in `eslint.config.js` (recorded in ARCHITECTURE D44).

7. **SETUP.md Zero-to-Running Reproducibility**:
   - Removed premature `node ace db:seed` step.
   - Added `node ace generate:key` to Step 2.
   - Added `npx playwright install chromium` to Step 1.
   - Documented Protomaps build selection and availability in Step 5.
   - Consolidated map execution commands into `docs/SETUP.md`, with `docs/ARCHITECTURE.md` §6 explaining the pipeline and linking to `SETUP.md`.

---

## 2. Screens

Screenshots of the landing page captured fresh at 360 px, 390 px (deviceScaleFactor: 2), and 1440 px (deviceScaleFactor: 1):

| Viewport | Screenshot Link | Dimensions |
| :--- | :--- | :--- |
| Mobile 360 px | [beranda-360.png](beranda-360.png) | 720 × 9142 |
| Mobile 390 px | [beranda-390.png](beranda-390.png) | 780 × 8986 |
| Desktop 1440 px | [beranda-1440.png](beranda-1440.png) | 1440 × 3010 |

---

## 3. Axe Accessibility Audit (Landing Page)

Audit executed using `@axe-core/playwright` across tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`:

```
[Axe] Landing violations: 0
[Axe] Landing passes: 29
```

Zero accessibility violations found on `/`.

---

## 4. Full SETUP.md Proof from Clean Clone

The following commands were executed in an empty scratch directory (`/tmp/clean-test/umimaclean`) with no `node_modules`, no pre-existing `.env`, and freshly created databases (`umimaclean_clean_dev` and `umimaclean_clean_test`):

### Step 1: Install dependencies and Playwright browser

```sh
$ npm install
added 850 packages, and audited 857 packages in 9s
297 packages are looking for funding
  run `npm fund` for details
31 vulnerabilities (2 low, 29 moderate)

$ npx playwright install chromium
BEWARE: your OS is not officially supported by Playwright; downloading fallback build for ubuntu24.04-x64.
```

### Step 2: Environment configuration & generate key

```sh
$ cp .env.example .env
$ node ace generate:key
DONE:    add APP_KEY to .env
```

### Step 3: Database creation and extension enablement

```sh
$ podman compose --profile tools run --rm -T psql -d postgres
CREATE DATABASE umimaclean_clean_dev TEMPLATE template0;
CREATE DATABASE umimaclean_clean_test TEMPLATE template0;
\connect umimaclean_clean_dev
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
\connect umimaclean_clean_test
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

### Step 4: Run migrations

```sh
$ node ace migration:run
[ info ] Upgrading migrations version from "1" to "2"
❯ migrating database/migrations/1761885935168_create_users_table
❯ migrated database/migrations/1761885935168_create_users_table

Migrated in 93 ms
❯ Scanned "postgres" database and found 1 tables
❯ Scanned table users
❯ Creating schema classes for scanned tables
[ success ] Schema classes generated (19 ms)
```

### Step 5: Verification Suite (§3 of SETUP.md)

#### `npm run lint`

```sh
$ npm run lint

> umimaclean@0.1.2 lint
> eslint .
```
*(Exited with code 0, 0 errors, 0 warnings)*

#### `npm run typecheck`

```sh
$ npm run typecheck

> umimaclean@0.1.2 typecheck
> tsc --noEmit && tsc --noEmit --project inertia/tsconfig.json
```
*(Exited with code 0, 0 errors)*

#### `npm test`

```sh
$ npm test

> umimaclean@0.1.2 test
> node ace test

[ info ] loading hooks...
[ info ] generating indexes...
[ info ] codegen: created 6 file(s)
[ info ] booting application to run tests...
[ info ] Upgrading migrations version from "1" to "2"
❯ Executed 1 migrations (390 ms)

unit / AuthService (tests/unit/auth_service.spec.ts)
  ✔ registers a new user account with hashed password (21.72ms)
  ✔ verifies credentials successfully for valid user (17.09ms)
  ✔ fails verification for incorrect password (12.02ms)
  ✔ resolves RegisterController and SessionController with injected AuthService from container (2.62ms)

unit / One light theme (tests/unit/theme.spec.ts)
  ✔ the shadcn components carry no dark: classes (2.54ms)
  ✔ app.css defines no dark theme (0.41ms)

functional / Authentication Routes (tests/functional/auth.spec.ts)
1:09:42 AM [vite] (ssr) connected.
1:09:43 AM [vite] (client) [optimizer] bundling dependencies...
  ✔ POST /signup registers user and redirects to dashboard (1s)
  ✔ POST /login authenticates valid credentials and redirects to dashboard (201.71ms)
  ✔ POST /logout terminates user session and redirects to login (25.51ms)

functional / Search engines (GUEST-3) (tests/functional/seo.spec.ts)
  ✔ robots.txt keeps signed-in and development pages out and points to the sitemap (7.33ms)
  ✔ the sitemap lists the public pages only (4.92ms)
  ✔ a public page arrives server-rendered with its title, description and Open Graph tags (15.88ms)

browser / Authentication Browser Flow (tests/browser/auth_flow.spec.ts)
  ✔ home page renders and displays authentication entry points (482.88ms)
  ✔ login page displays login form with credentials fields (468.05ms)
  ✔ signup page displays registration form with all required fields (384.18ms)
  ✔ user logs in through browser form and lands on dashboard (490ms)
  ✔ sign-in also works before the page scripts run (server-rendered form) (195.04ms)

browser / Look and feel (tests/browser/look.spec.ts)
  ✔ / loads nothing from another host, in Indonesian, with one main heading (1s)
  ✔ /syarat loads nothing from another host, in Indonesian, with one main heading (1s)
  ✔ /privasi loads nothing from another host, in Indonesian, with one main heading (1s)
  ✔ /login loads nothing from another host, in Indonesian, with one main heading (1s)
  ✔ /signup loads nothing from another host, in Indonesian, with one main heading (987.46ms)
  ✔ /_preview/staf loads nothing from another host, in Indonesian, with one main heading (997.03ms)
  ✔ /_preview/admin loads nothing from another host, in Indonesian, with one main heading (1s)
  ✔ /_preview/alur loads nothing from another host, in Indonesian, with one main heading (1s)
  ✔ /_preview/cetak loads nothing from another host, in Indonesian, with one main heading (1s)
  ✔ /_preview/404 loads nothing from another host, in Indonesian, with one main heading (1s)
  ✔ /_preview/500 loads nothing from another host, in Indonesian, with one main heading (1s)
  ✔ stays light when the device prefers a dark theme (318.64ms)
  ✔ the first Tab press shows a visible focus ring (961.02ms)
  ✔ / has no WCAG 2.1 AA violations (axe) (2s)
  ✔ /syarat has no WCAG 2.1 AA violations (axe) (2s)
  ✔ /privasi has no WCAG 2.1 AA violations (axe) (2s)
  ✔ /login has no WCAG 2.1 AA violations (axe) (1s)
  ✔ /signup has no WCAG 2.1 AA violations (axe) (1s)
  ✔ /_preview/404 has no WCAG 2.1 AA violations (axe) (2s)
  ✔ /_preview/500 has no WCAG 2.1 AA violations (axe) (2s)
  ✔ / does not scroll sideways at 360 px (1s)
  ✔ /syarat does not scroll sideways at 360 px (949.23ms)
  ✔ /privasi does not scroll sideways at 360 px (923.88ms)
  ✔ /login does not scroll sideways at 360 px (984.59ms)
  ✔ /signup does not scroll sideways at 360 px (918.6ms)
  ✔ /_preview/staf does not scroll sideways at 360 px (931.8ms)
  ✔ /_preview/admin does not scroll sideways at 360 px (1s)
  ✔ /_preview/alur does not scroll sideways at 360 px (929.71ms)
  ✔ /_preview/cetak does not scroll sideways at 360 px (958.01ms)
  ✔ /_preview/404 does not scroll sideways at 360 px (1s)
  ✔ /_preview/500 does not scroll sideways at 360 px (1s)
  ✔ the before and after slider moves with the keyboard (472.19ms)
❯ Reverted 1 migrations (15 ms)

 PASSED 

Tests  49 passed (49)
 Time  39s
```
