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

Pinned in M0. The full reference (tag **and** digest) lives where the image is used (`compose.yaml`, `maps/Containerfile`, the commands in `docs/ARCHITECTURE.md` §6); this table records the tag and why it was chosen. Checked on 2026-11-13.

| Image                                                     | Tag                                       | Purpose                                                                                                                       | Why this tag                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker.io/postgis/postgis` (official PostGIS image)      | `18-3.6` (PostgreSQL 18.6, PostGIS 3.6.4) | PostgreSQL with PostGIS for development and tests (`compose.yaml`)                                                            | PostgreSQL 18 is the current stable major. PostGIS 3.7.0 was published days before M0; 3.6 is the mature line and still receives fixes. The tag moves with patch releases, so the digest pins the exact build                                                                                                                                                                |
| `ghcr.io/project-osrm/osrm-backend` (official OSRM image) | `v26.11.0-debian`                         | Routing: `osrm-extract`, `osrm-contract`, `osrm-routed` (`compose.yaml`, ARCHITECTURE §6.3)                                   | The project publishes its images on GHCR; the Docker Hub repository `osrm/osrm-backend` was last updated in 2021 (v5.25.0). v26.11.0 (2026-11-01) is the latest release. The routing files only load in the version that built them, so build and serve use the same reference. No official motorbike profile exists: `maps/motorbike.lua` is ours, documented in its header |
| `docker.io/library/debian`                                | `trixie-20261104-slim`                    | Base of the map tools image (`maps/Containerfile`): `osmium-tool` 1.18.0 from trixie, `osm2pgsql` 2.3.1 from trixie-backports | Neither tool has an official container image. Debian packages them (Debian GIS team); a dated tag makes the build repeatable                                                                                                                                                                                                                                                 |
| `docker.io/protomaps/go-pmtiles` (official, Protomaps)    | `v1.31.2`                                 | `pmtiles extract` / `pmtiles show` for the PMTiles base map (ARCHITECTURE §6.4)                                               | Latest release (2026-07-22)                                                                                                                                                                                                                                                                                                                                                  |

## 4. Data tools and datasets

Tools run from the images above, so nothing is installed on the host except Podman. Commands, sizes and timings: `docs/ARCHITECTURE.md` §6. Data files are never committed (`.gitignore`: `/storage`, `/public/tiles`).

| Need                                                              | Tool                                                                                                                                    | Data, source and license                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Download the OpenStreetMap extract                                | `curl` (host)                                                                                                                           | Geofabrik "Java" extract, <https://download.geofabrik.de/asia/indonesia/java-latest.osm.pbf> (899 MB on 2026-11-13, data up to 2026-11-12T21:23Z), © OpenStreetMap contributors, [ODbL 1.0](https://opendatacommons.org/licenses/odbl/)                                                                                                                                                                                                                         |
| Clip it to Bandung Raya                                           | `osmium extract` (osmium-tool 1.18.0)                                                                                                   | same; box 107.20–107.99 E, 7.37–6.76 S (the three regions of AREA-1 plus about 5 km)                                                                                                                                                                                                                                                                                                                                                                            |
| Load roads, places, kelurahan and postcodes into the `osm` schema | `osm2pgsql` 2.3.1 (flex output, `maps/osm_import.lua`) + `psql` in the database container (`maps/osm_schema.sql`, `maps/osm_build.sql`) | same                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Build the OSRM motorbike graph                                    | `osrm-extract` + `osrm-contract` (OSRM v26.11.0), `maps/motorbike.lua`                                                                  | same                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Produce the PMTiles extract                                       | `pmtiles extract` (go-pmtiles v1.31.2)                                                                                                  | Protomaps Basemap daily build (tileset v4.15.2), <https://build.protomaps.com/>, data © OpenStreetMap contributors (ODbL); the attribution "© OpenStreetMap contributors" is shown on every map (MAP-2)                                                                                                                                                                                                                                                         |
| Kecamatan boundaries (file produced in M3)                        | `curl`, `unzip`, `mapshaper` through `npx` (not a project dependency)                                                                   | "Indonesia – Subnational Administrative Boundaries" (OCHA COD-AB, data from Badan Pusat Statistik), <https://data.humdata.org/dataset/cod-ab-idn>, [CC BY-IGO 3.0](https://creativecommons.org/licenses/by/3.0/igo/); resource `idn_admin_boundaries.geojson.zip`, 456,203,094 bytes, updated on HDX 2026-06-23 (checked 2026-11-13). Only the filtered, simplified result for Kota Bandung, Kota Cimahi and Kabupaten Bandung (64 kecamatan) will be committed |

## 5. Runtime requirements

| Requirement                               | Source                                                                                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js                                   | The `engines` field in `package.json`                                                                                                          |
| Podman (rootless) with a compose provider | Local services. `podman compose` runs the external provider `podman-compose` (1.6.0 on the development machine; packaged by Fedora and Debian) |
