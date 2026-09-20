# CLAUDE.md — UmimaClean

Conventions for anyone (human or agent) working in this repository. Read this
before writing a feature.

## What this is

UmimaClean cleans and repairs shoes, bags, and helmets in Bandung, Indonesia.
There are exactly four services:

| Service          | Slug                        |
| ---------------- | --------------------------- |
| Cuci sepatu      | `/layanan/cuci-sepatu`      |
| Cuci tas         | `/layanan/cuci-tas`         |
| Cuci helm        | `/layanan/cuci-helm`        |
| Reparasi sepatu  | `/layanan/reparasi-sepatu`  |

**Free pickup and delivery across Bandung** is the core differentiator. It is a
first-class selling point, not a footnote: it belongs in title tags, in the
hero, in the JSON-LD graph, and on every service page.

### This is not a laundry

Never describe UmimaClean as a laundry. The following words are banned from
copy, slugs, schema, alt text, and commit messages:

> kiloan, satuan, dry clean, dry cleaning, setrika, laundry, londri

`npm run verify:seo` is the automated backstop for the rendered output, but the
rule applies to the whole repository.

## The two non-negotiable goals

1. **Public pages are findable from a few typed words** — "cuci sepatu bandung",
   "cuci sepatu antar jemput gratis", "reparasi sepatu bandung", "cuci helm
   bandung", "cuci tas bandung".
2. **Lighthouse on public pages ≥ 99 / 100 / 100 / 100** (Performance /
   Accessibility / Best Practices / SEO), measured on mobile.

A change that regresses either goal is not done, however good it looks.

## Never invent business data

Address, opening hours, phone number, prices, turnaround times, and ratings come
from the owner. Do not guess, round, or "improve" them. If a value is missing,
stop and ask.

`aggregateRating` and `review` may only be emitted when real reviews are
actually rendered on that page. Fabricating either is fraud and a manual
penalty from Google.

## Stack

- AdonisJS 7 + Inertia 5 + React 19, TypeScript strict, Vite 8
- PostgreSQL + Lucid
- Tailwind CSS 4
- **npm only.** The lockfile is `package-lock.json`. No Bun, pnpm, or yarn.
- Deploy: GitHub Actions → GHCR → rootless Podman + systemd Quadlet, behind Caddy

## Code style

Narrative, in the vein of Harminder Virk: flat, sequential functions read top to
bottom, with `/** chapter heading */` block comments marking the movements.

**Do not** shred logic into small private methods in the Clean Code style. A
controller action that does five things in order should read as five labelled
paragraphs in one function, not five method calls that force the reader to jump
around the file.

```ts
export default class OrderController {
  async store({ request, response, auth }: HttpContext) {
    /** Validate what the customer sent us */
    const payload = await request.validateUsing(createOrderValidator)

    /** Reject addresses outside the free-pickup area */
    const area = await OperationalArea.covering(payload.latitude, payload.longitude)
    if (!area) {
      return response.badRequest({ message: 'Alamat berada di luar area jemput gratis.' })
    }

    /** Record the order and its first lifecycle transition */
    ...
  }
}
```

Other rules:

- Validate **every** endpoint's input with VineJS. No exceptions.
- Hash secrets with the official `hash` service (scrypt). Never hand-roll.
- Authorization goes through Bouncer, not bespoke policy classes.

## The SEO contract

This is the part most likely to be broken by accident.

### 1. Every public page returns a `PageSeo`

A controller that renders a public page **must** pass a `PageSeo` object
(`app/seo/types.ts`) as a prop. A page without one is not finished.

### 2. `resources/views/partials/seo.edge` is the only place head tags are written

Do not use `<Head>` from `@inertiajs/react` for SEO. It is unreliable for
nested elements and `dangerouslySetInnerHTML`, and it depends on hydration.
Rendering from Edge guarantees the tags exist in the first HTML response even
if the JS bundle never arrives.

If you need a new meta tag, add it to the partial — not to a page component.

### 3. JSON-LD is one `@graph` of `@id`-anchored nodes

Nodes reference each other by stable `@id` instead of duplicating data:

```
${ORIGIN}/#business    LocalBusiness
${ORIGIN}/#website     WebSite
${canonical}#webpage   WebPage
${canonical}#breadcrumb
${canonical}#service
```

`<` is escaped to `\u003c` on output. That is mandatory, not cosmetic — it is
what stops a stray string from closing the script tag.

### 4. URLs

- `ORIGIN` comes from `APP_URL`. Never hardcode the host; the domain is
  temporary and will move.
- Indonesian, descriptive slugs. No numeric IDs.
- `trailingSlash: never`, with 301s for the trailing-slash variant.
- Dashboard and admin routes send `X-Robots-Tag: noindex`.

### 5. No heavy libraries on public pages

Specifically **no Leaflet or map code in any public bundle**. Maps are lazy
loaded inside authenticated areas only.

## Ordering goes through the site, never WhatsApp

The booking form at `/pesan` is the front door. A chat thread has to be staffed,
read, and transcribed by hand; a form arrives structured and already checked
against the coverage area.

- **The primary CTA on every public page is "Pesan sekarang" → `/pesan`.** One
  visual treatment — the solid ink button — used consistently.
- **WhatsApp is secondary and narrowly labelled**: questions and complaints
  only, in the footer, the FAQ, and the contact page. Never beside the primary
  CTA, where it becomes a competing path to the expensive channel.
- The kecamatan field is a select built from `COVERED_KECAMATAN`, never free
  text, so the site cannot accept an order it cannot serve.
- The form is plain HTML that posts and redirects. **It must keep working with
  JavaScript disabled** — this is the page an order arrives through.

Two tests enforce this: no `wa.me` link may wear the primary-button class on any
public page, and every public page must link to `/pesan`.

Schema mirrors it: `contactPoint` stays `customer service`, and the business
node carries a `potentialAction` `OrderAction` pointing at `/pesan`.

## Every public page must be reachable by clicking

`npm run verify:seo` crawls from `/` following only in-page links and fails on
any public URL that is an orphan or more than two clicks deep. A page missing
from the navigation collects no internal link weight no matter how healthy it
looks in the sitemap.

## Coverage is a business decision, not geometry

`app/content/areas.ts` is the single source of truth for where free pickup
runs. `areaServed`, the area pages, and Phase 5 order eligibility all read from
it, so the three cannot drift.

**Never derive the area list from
`../umimaclean-route/database/data/operational_areas.geojson`.** That polygon
was drawn by hand for a stakeholder pitch and overshoots the real area by at
least eight kecamatan (Cimenyan, Cileunyi, Arjasari, Ciparay, Rancaekek,
Ngamprah, Batujajar, Padalarang). Used for eligibility it auto-approves orders
a human then has to refuse — after the customer has already been promised.

Two rules a test enforces: **Cimahi is covered** and must never appear in the
"belum terjangkau" list, and no area page may claim a kecamatan outside the
list.

`app/content/coverage_map.ts` is **generated** — run `npm run build:map` after
editing the area list. Boundary data is BIG (RBI 1:10.000), attributed on the
page; OSM lacks kecamatan boundaries for Cimahi and most of Kabupaten Bandung,
and GADM's licence forbids commercial use. The script exits non-zero if any
covered kecamatan fails to match, because silently drawing a covered area as
uncovered is exactly how this goes wrong.

## Deploying

Migrations, then the sitemap sync — in that order:

```sh
node ace migration:run --force
node ace sitemap:sync
```

`sitemap:sync` hashes each page's content and only moves a row's `updated_at`
when that hash changes, which is what makes `lastmod` honest. Running it twice
must not move any timestamp; if it does, something is hashing unstably.

## Accessibility floor

- Skip link targeting `<main id="main-content" tabindex="-1">`
- Exactly one `<h1>` per page, clean heading hierarchy, semantic landmarks
- Descriptive `alt`; `alt=""` only for decorative images. Before/after photos
  describe the actual work done.
- Contrast ≥ 4.5:1, visible focus rings, explicit `<label>` on every input
- `<html lang="id">`

## Security

Strict sha256-based CSP — **never** `unsafe-inline`. Every inline script needs
its hash computed and added to the policy. Plus HSTS, `nosniff`, and a
`Referrer-Policy`.

Operational note: for Caddy header changes, `podman restart caddy` is more
reliable than `caddy reload`.

## Commands

```sh
npm run dev              # node ace serve --hmr
npm run build            # production build, including the SSR bundle
npm run typecheck        # server + inertia projects
npm run lint
npm test
npm run verify:seo       # SEO gate — see below
npm run audit:proxy      # brotli + immutable caching, for realistic Lighthouse runs
npm run build:map        # regenerate the coverage map from BIG boundary data
```

### `npm run verify:seo`

Fetches every public URL and fails if the **raw** HTML (no JS executed) is
missing an `<h1>`, a unique non-empty `<title>`, `meta[name=description]`,
`link[rel=canonical]`, or a parseable `application/ld+json` block. It also
fails on banned laundry vocabulary.

It runs against `BASE_URL` (default `http://localhost:3333`), so the same
script gates CI and can be pointed at production.

Public paths live in `app/seo/public_paths.ts` — one list, shared by the
verifier and the sitemap, so the two cannot drift.

## Auditing performance

Lighthouse must be run against `build/bin/server.js` under `NODE_ENV=production`,
never against the dev server — the SSR bundle only exists after a build.

**Before trusting any score, assert the asset URLs in the served HTML return
200.** A stale server process holding the port will happily serve HTML
referencing the previous build's asset hashes; every script then 404s and
Lighthouse scores a page with no JavaScript at a perfect 100. This has already
happened once.

```sh
curl -s http://localhost:3334/ | grep -oE '/assets/app-[^"]*' \
  | xargs -I{} curl -s -o /dev/null -w '{} %{http_code}\n' http://localhost:3334{}
```

The Adonis static server compresses nothing and sends `Cache-Control: max-age=0`.
Production is Caddy with brotli and immutable caching for hashed assets, and the
difference is worth roughly 8 Lighthouse points — so a local audit without a
compressing proxy in front understates the real score.

## Testing

- Functional tests for the auth and ordering flows.
- SEO assertions against the **raw HTML** of public pages, not a rendered DOM.

## Local development

PostgreSQL runs in the existing rootless Podman container `postgres`
(postgis/postgis:17-3.5) on port 5432. This project uses its own databases,
`umimaclean_inertia` and `umimaclean_inertia_test`, owned by role `umimaclean`.
The `umimaclean` database belongs to an earlier prototype — leave it alone.
