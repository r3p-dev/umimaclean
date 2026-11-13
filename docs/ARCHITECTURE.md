# Architecture

**§1 is set by the project owner.** Do not change it without asking; if you believe a decision must change, say so in your report and why. **§2 onward is written and kept current by the implementer** (first in M0, then whenever modules, routes, schema, state machines or decisions change).

---

## 1. Fixed decisions

### 1.1 Technology

| Area            | Decision                                                                                                                                                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend         | What the repo already uses (discover it from `package.json`, `adonisrc.ts`, `config/`): AdonisJS 7, Lucid, VineJS, Japa (unit, functional, browser with Playwright). Add the official packages the PRD needs: `@adonisjs/bouncer` (authorization), `@adonisjs/limiter` (rate limits), `@adonisjs/transmit` (live updates over SSE).              |
| Frontend        | Inertia + React (already installed). **Tailwind CSS v4**, **shadcn/ui on the React Aria base** (`shadcn init --base aria`, style `aria-vega`), `react-aria-components`, **`@tabler/icons-react`**. Atomic components and styling rules in `docs/CONVENTIONS.md` §9.                                                                              |
| Package manager | **npm**. `package-lock.json` is committed.                                                                                                                                                                                                                                                                                                       |
| Database        | **PostgreSQL with PostGIS**. `timestamptz` everywhere; business time zone **Asia/Jakarta**. Sessions in the database store.                                                                                                                                                                                                                      |
| Migrations      | Until v1.0.0, schema changes **edit the original create migration** (no alter migrations); the development database is reset. From v1.0.0 on, new migrations. `database/schema.ts` is generated: never edit it by hand.                                                                                                                          |
| Local services  | **Rootless Podman** runs every local service (PostgreSQL + PostGIS, OSRM). One reproducible, documented way to start, stop and reset them. No Docker-only features.                                                                                                                                                                              |
| Maps            | **Fully self-hosted.** Leaflet with `protomaps-leaflet` drawing a self-hosted PMTiles extract of Bandung Raya. Place search and labels from an `osm` schema in our PostgreSQL, filled from an OpenStreetMap extract by an ace command. Routing from a self-hosted **OSRM** with a motorbike profile. Map and OSM data files are never committed. |
| WhatsApp        | **Fonnte**, called only from one service class. Without a token (outside production), messages go to the log.                                                                                                                                                                                                                                    |
| Payments        | **Midtrans Core API** (QRIS: charge, status, cancel, notification signature) over `fetch`, from one gateway class. Sandbox only in development.                                                                                                                                                                                                  |
| Bot protection  | **Cloudflare Turnstile** on public forms, on by default; Cloudflare's test keys in development and tests.                                                                                                                                                                                                                                        |
| Scheduled jobs  | Ace commands (`docs/prd/shared.md` §10).                                                                                                                                                                                                                                                                                                         |
| Uploads         | Proof photos on disk outside `public/`, path from env, served through an authorized route.                                                                                                                                                                                                                                                       |
| Language        | UI Indonesian only. Code, comments, docs, commit messages English.                                                                                                                                                                                                                                                                               |
| Delivery        | v1.0.0 ships a production `Containerfile` with a health check endpoint. Deployment automation is out of scope.                                                                                                                                                                                                                                   |

### 1.2 Security requirements (all mandatory)

1. Sessions with secure cookie settings; CSRF and security headers via Shield. The client IP is read from `X-Forwarded-For` only when the request comes from a trusted proxy address (configurable), so per-IP limits see the real client behind a reverse proxy.
2. Authorization through **Bouncer policies**, checked on every route. Functional tests prove each role is refused where it doesn't belong (guest vs customer vs staff vs owner, and a customer vs another customer's order).
3. Rate limits exactly as the PRD states (ACC-2, ACC-3, ACC-4, GUEST-5, PAY-1), plus per-IP limits on the public area check and per-user limits on place search.
4. OTP stored only as a keyed hash, compared in constant time, never logged.
5. Midtrans notifications: verify the signature, confirm the status with Midtrans, process idempotently, never trust amounts from the client. At most one paid payment per order, enforced by the database.
6. Uploads: validate type and size; store outside `public/`; serve only to users allowed to see that order.
7. Secrets only in env, validated in `start/env.ts`; `.env` is never committed. Phone numbers masked in logs.
8. No personal data to any outside service except what `docs/prd/shared.md` §11 lists.

---

## 2. Overview

_Written in M0._

## 3. Components

_Written in M0: backend modules (controllers, services, models, policies, validators, commands), frontend structure (templates, organisms, pages), and how they connect._

## 4. Data flow

_Written in M0: a request from click to database and back; outside services; live updates._

## 5. State machines

_Written in M0: order status (`docs/prd/shared.md` ORD-2, ORD-3) and payment status (PAY-3, PAY-4), where each transition happens, and how it is tested._

## 6. Local services and data

_Written in M0: the Podman setup, the map data pipeline (OSM extract → `osm` schema, OSRM build, PMTiles extract), scheduled jobs locally and in production._

## 7. Decisions log

Every decision not covered by §1, and **every workaround**, gets an entry: number, date, decision, reason, alternatives considered, and links.

_Empty until M0._
