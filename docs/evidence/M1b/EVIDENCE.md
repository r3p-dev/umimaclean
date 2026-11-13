# M1b evidence: foundation and look

Date: 2026-11-13. Checkpoint of 0.1.0: no version bump (0.1.0 comes at the end of M1c, `docs/PLAN.md`).

## 1. Summary

- **Shared database upgraded**: the development server runs PostgreSQL 18.6 / PostGIS 3.6.4 (the production versions, D17), with this project's databases recreated, migrated and the `osm` schema loaded again (§7.1). `docs/ARCHITECTURE.md` §6.1 describes the server as it is now.
- **Look**: Tailwind v4 and shadcn on React Aria (`aria-vega`, Tabler icons, Instrument Sans), the brand colors in shadcn's own theme variables, one light theme (D27).
- **Templates**: public, auth, customer, flow, staff, owner and print layouts, with the site header and footer, the auth brand panel, the customer, staff and owner navigation (desktop and phone), and the 404 and 500 pages. Templates without a real page yet are viewable at `/_preview/...` outside production (D32).
- **Existing pages** in the new look and in Indonesian: home (a short hero until M1c), sign-in, sign-up, the signed-in home.
- **Docs**: the PRD formatted with Prettier, plus the photo credit in GUEST-1 (owner's request); `docs/PLAN.md` splits M1b into M1b and M1c (D35); `docs/DEPENDENCIES.md` lists the packages added; `docs/ARCHITECTURE.md` decisions D27–D35.

## 2. How to run and see it

```sh
npm install
node ace migration:run
npm run dev
```

| URL                                                                      | What                                                                                                            |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `/`                                                                      | Public template with the hero (the full landing comes in M1c)                                                   |
| `/login`, `/signup`                                                      | Auth template                                                                                                   |
| `/dashboard`                                                             | Customer template (sign up first, or use `m1b-preview@example.com` / `password123` in the development database) |
| `/_preview/staf`, `/_preview/admin`, `/_preview/alur`, `/_preview/cetak` | Staff, owner, flow and print templates                                                                          |
| `/_preview/404`, `/_preview/500`                                         | The error pages (in development a real error shows the debug page instead)                                      |

## 3. Screens

1440 × 900 (desktop) and 390 × 844 at 2× (mobile), full page, with every request to a host other than `localhost` aborted (none happened).

| Page           | Desktop                                                        | Mobile                                                       |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| Home           | [beranda-desktop.png](beranda-desktop.png)                     | [beranda-mobile.png](beranda-mobile.png)                     |
| Sign in        | [masuk-desktop.png](masuk-desktop.png)                         | [masuk-mobile.png](masuk-mobile.png)                         |
| Sign up        | [daftar-desktop.png](daftar-desktop.png)                       | [daftar-mobile.png](daftar-mobile.png)                       |
| Customer home  | [pelanggan-beranda-desktop.png](pelanggan-beranda-desktop.png) | [pelanggan-beranda-mobile.png](pelanggan-beranda-mobile.png) |
| Staff template | [staf-template-desktop.png](staf-template-desktop.png)         | [staf-template-mobile.png](staf-template-mobile.png)         |
| Owner template | [owner-template-desktop.png](owner-template-desktop.png)       | [owner-template-mobile.png](owner-template-mobile.png)       |
| Flow template  | [alur-template-desktop.png](alur-template-desktop.png)         | [alur-template-mobile.png](alur-template-mobile.png)         |
| Print template | [cetak-template-desktop.png](cetak-template-desktop.png)       | [cetak-template-mobile.png](cetak-template-mobile.png)       |
| 404            | [404-desktop.png](404-desktop.png)                             | [404-mobile.png](404-mobile.png)                             |
| 500            | [500-desktop.png](500-desktop.png)                             | [500-mobile.png](500-mobile.png)                             |

## 4. How it works

No new server flow. Pages render inside a template chosen by the page (`Page.layout`); the template draws the area's navigation from `inertia/lib/navigation/*_links.ts`, where an entry without a route (its page comes later) renders as plain text. Colors come only from shadcn's variables in `inertia/css/app.css`.

## 5. Code tour (reading order)

1. `inertia/css/app.css`: Tailwind, the shadcn base stylesheet, the font, the brand values.
2. `components.json`, `tsconfig.json` (the `~/*` path for the CLI, D28), `vite.config.ts` (Tailwind plugin).
3. `inertia/components/ui/*`: the generated components (changes listed in D29).
4. `inertia/components/atoms/logo.tsx`.
5. `inertia/components/molecules/{navigation_item,form_field,flash_toasts}.tsx`.
6. `inertia/lib/navigation/*`, `inertia/lib/store/contact.ts`.
7. `inertia/components/organisms/*`: header, footer, brand panel, navigation per area, top bars.
8. `inertia/components/templates/*`: the seven layouts.
9. `inertia/pages/{home,auth/*,customer/dashboard,errors/*}.tsx`, then the previews (`staff/template_preview`, `staff/print_template_preview`, `admin/template_preview`, `customer/flow_template_preview`) and `start/routes.ts`.
10. `resources/views/inertia_layout.edge` (`lang="id"`, favicons), `inertia/app.tsx`, `app/middleware/inertia_middleware.ts` (no theme prop).
11. `tests/unit/theme.spec.ts`, `tests/browser/look.spec.ts`.
12. `app/validators/auth.ts`, `app/models/user.ts`, `database/schema.ts` (regenerated), `config/database.ts`: `full_name` is required (the owner's change to the users migration).

## 6. Decisions and deviations

- D27–D35 in `docs/ARCHITECTURE.md` §7. One workaround added: D28 (`~/*` path in the root `tsconfig.json` for the shadcn CLI).
- Arbitrary Tailwind value kept: `pb-[env(safe-area-inset-bottom)]` on the customer tab bar. The phone's safe-area inset is a runtime value from the device; no scale step can express it.
- The generated base layer of `app.css` uses `@apply` (written by `shadcn init`); our own styles use classes only.
- Validation messages are still the English defaults, and sign-in is still by email: both change with the accounts in M2.
- The customer header shows the name and a "Keluar" button; the account menu with profile and addresses comes with those pages (M2).
- `config/logger.ts` now names the logger `umimaclean`; it read an undeclared `APP_NAME` before (left from M1a).

## 7. Evidence

### 7.1 Database server

```text
$ podman inspect postgres --format 'image={{.ImageName}} … health={{.State.Health.Status}}'
image=docker.io/postgis/postgis@sha256:4a43e3c3e5d55b9208240fc71db543b79c638766280c625a425bd0a2390989c4 … mounts=postgres18_data->/var/lib/postgresql  health=healthy
$ podman healthcheck run postgres && podman volume rm postgres_data
healthy now
postgres_data
$ podman volume ls --format '{{.Name}}' | grep -E '^postgres'
postgres18_data
$ podman compose --profile tools run --rm -T psql -d postgres -f /database/create_databases.sql
CREATE DATABASE
CREATE DATABASE
… CREATE EXTENSION × 6
$ podman compose --profile tools run --rm -T psql -Atc "select version()" -c "select postgis_full_version()"
PostgreSQL 18.6 (Debian 18.6-1.pgdg13+2) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
POSTGIS="3.6.4 94d984b" [EXTENSION] PGSQL="180" GEOS="3.14.1-CAPI-1.20.5" …
$ node ace migration:run
[ success ] Schema classes generated
```

`osm` schema loaded again with `docs/ARCHITECTURE.md` §6.2 steps 4–5: [osm-import-postgres18.log](osm-import-postgres18.log), ending in `umimaclean_dev|18.6 (Debian 18.6-1.pgdg13+2)|3.6.4|13213|14457|500`. Tests on the new server: [test-postgres18.log](test-postgres18.log) (`Tests  11 passed (11)`, before the M1b tests existed).

### 7.2 Lint, typecheck, tests

[lint.log](lint.log), [typecheck.log](typecheck.log), [test.log](test.log):

```text
$ npm run lint
> eslint .
exit=0
$ npm run typecheck
> tsc --noEmit && tsc --noEmit --project inertia/tsconfig.json
exit=0
$ npm test
❯ Executed 1 migrations
 PASSED
Tests  24 passed (24)
exit=0
```

The 13 new tests: every page (9) loads nothing from another host, is `lang="id"` and has one `h1` (none on the print sheet); the page stays light when the device prefers dark; the first Tab press on the sign-in page lands on a link with a visible focus ring; the `ui/` components carry no `dark:` class; `app.css` defines no dark theme. No log contains "deprecat".

## 8. Open questions and known limitations

- The tokens of the design without a shadcn equivalent (status colors, attention/success notes, a few text sizes) are listed with proposals in the M1b report; nothing was added to `app.css` for them.
- AA contrast is not yet checked automatically: that needs an accessibility checker in the browser tests, proposed in the report for M1c.
- Templates for pages that come later show sample content only.
