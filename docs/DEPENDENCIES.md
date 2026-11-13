# Dependencies

Every package, container image and data tool this project uses, and why. **Exact versions live in `package.json` / `package-lock.json` and in the container setup**, not here, so this file doesn't go stale.

Rules (`docs/CONVENTIONS.md` §14):

- Add nothing that isn't listed here. To add something, list it with its purpose and **why AdonisJS, its official packages or the platform are not enough**, in the same change.
- Only stable, actively maintained packages. Check before adding that the version you pick isn't deprecated.
- When something is removed, remove it here too.

## 1. Installed (from the starter)

### Runtime

| Package                                                    | Purpose                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| `@adonisjs/core`                                           | Framework core: container, HTTP server, config, ace                      |
| `@adonisjs/auth`                                           | Session guard and remember-me tokens                                     |
| `@adonisjs/lucid`                                          | ORM, migrations, seeders                                                 |
| `@adonisjs/session`                                        | Sessions (database store)                                                |
| `@adonisjs/shield`                                         | CSRF and security headers                                                |
| `@adonisjs/cors`                                           | CORS (kept closed: same-origin app)                                      |
| `@adonisjs/static`                                         | Static files from `public/`                                              |
| `@adonisjs/vite`                                           | Vite integration                                                         |
| `@adonisjs/inertia`, `@inertiajs/core`, `@inertiajs/react` | Inertia server adapter and React client                                  |
| `@tuyau/core`                                              | Typed route helpers for the frontend                                     |
| `@vinejs/vine`                                             | Validation                                                               |
| `edge.js`                                                  | The single root HTML template for Inertia                                |
| `pg`                                                       | PostgreSQL driver                                                        |
| `luxon`                                                    | Dates and time zones (used by Lucid)                                     |
| `react`, `react-dom`                                       | UI                                                                       |
| `reflect-metadata`                                         | Decorator metadata for the container                                     |
| `sonner`                                                   | Toasts (also what shadcn's toast component uses)                         |
| `lucide-react`                                             | **To remove in M1**: icons are Tabler only (`docs/ARCHITECTURE.md` §1.1) |

### Development

| Package                                                                                             | Purpose                                                                          |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `@adonisjs/assembler`, `hot-hook`, `@poppinss/ts-exec`                                              | Dev server, build, hot reload, TypeScript execution                              |
| `@adonisjs/eslint-config`, `eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`             | Linting (M1 also enables the type-aware `@typescript-eslint/no-deprecated` rule) |
| `@adonisjs/prettier-config`, `prettier`                                                             | Formatting                                                                       |
| `@adonisjs/tsconfig`, `typescript`                                                                  | Type checking                                                                    |
| `@japa/runner`, `@japa/assert`, `@japa/plugin-adonisjs`, `@japa/api-client`, `@japa/browser-client` | Unit, functional and browser tests                                               |
| `vite`, `@vitejs/plugin-react`                                                                      | Frontend build                                                                   |
| `pino-pretty`, `youch`                                                                              | Readable logs and error pages in development                                     |
| `@types/luxon`, `@types/node`, `@types/pg`, `@types/react`, `@types/react-dom`                      | Types                                                                            |

## 2. Approved to add

Add each in the milestone shown, after checking its current version and docs.

| Package                                                                                                      | Purpose                                                                                          | Milestone |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | --------- |
| `tailwindcss`, `@tailwindcss/vite`                                                                           | Styling (Tailwind v4)                                                                            | M1        |
| `shadcn` (dev)                                                                                               | CLI that generates components into `inertia/components/ui/` (React Aria base)                    | M1        |
| `react-aria-components`                                                                                      | Accessible primitives under the shadcn components                                                | M1        |
| The helper packages the shadcn CLI installs for the React Aria base (class merging, variants, animation CSS) | Required by generated components; list each one here when the CLI adds it                        | M1        |
| `@tabler/icons-react`                                                                                        | Icons                                                                                            | M1        |
| `@fontsource-variable/*` for the design's fonts                                                              | Self-hosted fonts (no request to a font CDN)                                                     | M1        |
| `playwright` (dev)                                                                                           | Browser engine for `@japa/browser-client` and screenshots                                        | M1        |
| `@adonisjs/limiter`                                                                                          | Rate limits (database store)                                                                     | M2        |
| `@adonisjs/bouncer`                                                                                          | Authorization policies                                                                           | M2        |
| `proxy-addr`, `@types/proxy-addr`                                                                            | Trusted proxy list for `http.trustProxy` in `config/app.ts` (`docs/ARCHITECTURE.md` §1.2 rule 1) | M2        |
| `leaflet`, `@types/leaflet`                                                                                  | Map UI                                                                                           | M4        |
| `protomaps-leaflet`                                                                                          | Draws the self-hosted PMTiles vector tiles in Leaflet                                            | M4        |
| `@adonisjs/transmit`, `@adonisjs/transmit-client`                                                            | Live updates over SSE                                                                            | M11       |

**To propose when needed** (with a comparison, before adding): a maintained library for the Excel export (OWN-12, M10).

## 3. Container images (rootless Podman)

Pinned to exact tags in M0; record the tag and the reason for it here.

| Image                                                           | Purpose                                           |
| --------------------------------------------------------------- | ------------------------------------------------- |
| PostGIS (official `postgis/postgis`)                            | PostgreSQL with PostGIS for development and tests |
| OSRM (official `osrm/osrm-backend` or its maintained successor) | Routing with the motorbike profile                |

## 4. Data tools

Chosen in M0 (prefer running them from container images so nothing extra is installed on the host). Record the tool, version, source and license of every dataset.

| Need                                                              | Data                                                |
| ----------------------------------------------------------------- | --------------------------------------------------- |
| Clip an OpenStreetMap extract to Bandung Raya                     | OpenStreetMap (ODbL)                                |
| Load roads, places, kelurahan and postcodes into the `osm` schema | OpenStreetMap (ODbL)                                |
| Build the OSRM motorbike graph                                    | OpenStreetMap (ODbL)                                |
| Produce the PMTiles extract                                       | A maintained OpenStreetMap vector tile build (ODbL) |
| Kecamatan boundaries                                              | A licensed public boundary dataset (AREA-1)         |

## 5. Runtime requirements

| Requirement       | Source                                |
| ----------------- | ------------------------------------- |
| Node.js           | The `engines` field in `package.json` |
| Podman (rootless) | Local services                        |
