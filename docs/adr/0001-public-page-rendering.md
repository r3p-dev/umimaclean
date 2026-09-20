# ADR 0001 — How public pages are rendered

- **Status:** Accepted (provisional — subject to the Phase 3 measurement gate)
- **Date:** 2026-09-05
- **Phase:** 0

## Context

UmimaClean has to satisfy two goals that pull in opposite directions.

Public pages must be **findable from a few typed words** ("cuci sepatu bandung",
"cuci sepatu antar jemput gratis") and must score **≥ 99 / 100 / 100 / 100** on
mobile Lighthouse. At the same time the product behind the login is an
operations platform — order lifecycle, pickup scheduling, maps and routing —
which genuinely wants a rich client-side application.

Inertia is a SPA architecture. If the first HTML response does not already
carry the full content, the SEO goal is lost no matter how good the copy is.
Crawlers do render JavaScript, but budget-limited, inconsistently, and later.
We do not want to be in that queue.

Two options were on the table:

- **Option A** — every page goes through Inertia + SSR. Public pages stay
  extremely light, with almost no client state.
- **Option B** — public pages (landing, four service pages, pricing, area
  pages, FAQ, blog, contact) are plain Edge templates with zero JS apart from
  tiny islands. Inertia + React is reserved for authenticated areas.

## Decision

**Option A**, with Option B held as a live, pre-authorised fallback.

Two supporting decisions make Option A safe rather than optimistic:

1. **SEO head tags are written in Edge, never in React.** The
   `resources/views/partials/seo.edge` partial is the only place `<title>`,
   meta, canonical, Open Graph, and JSON-LD are emitted. `<Head>` from
   `@inertiajs/react` is not used for SEO: it is unreliable for nested elements
   and `dangerouslySetInnerHTML`, and it depends on hydration having happened.
   Rendering from Edge means the tags are in the first response regardless of
   what happens to the JS bundle.

2. **`npm run verify:seo` gates every commit.** It fetches the raw HTML of every
   public URL with no JavaScript executed and fails if an `<h1>`, a unique
   `<title>`, `meta[name=description]`, `link[rel=canonical]`, or a parseable
   `application/ld+json` block is missing. SSR breaking silently is the single
   most likely way this project fails, so it is a CI gate, not a checklist item.

## Why Option A first

Option B is the safer bet for Lighthouse and the worse bet for everything else.
Two rendering models means two layouts, two sets of components, two places for
the header and footer to drift apart, and a rewrite the first time a public
page needs real interactivity (an address picker on the order form, a gallery
lightbox). That cost is certain. The performance problem Option B solves is
only hypothetical until measured.

Option A is also cheap to abandon. Because all SEO output already comes from
Edge, moving a public page to a pure Edge template means deleting its React
component and rendering the same partial from a different view — the SEO module,
the schema graph, and the verifier are untouched.

## The measurement gate

Phase 3 audits the homepage plus two other public pages on mobile Lighthouse.

**If Performance stays below 99 after every reasonable optimisation** — font
subsetting, inlined critical CSS, an image pipeline, route-level code
splitting, HTTP caching and ETags — **then public pages move to Option B**, and
the measured numbers that forced the move are appended to this ADR.

"Every reasonable optimisation" explicitly includes shipping public pages with
no hydration at all if that is what the numbers require. The React runtime on a
page with no interactivity is dead weight.

## Evidence gathered in Phase 0

- SSR was enabled before any page was written (`config/inertia.ts`,
  `ssr.enabled: true`, entrypoint `inertia/ssr.tsx`).
- Server-rendered HTML confirmed in **development** — the raw response for `/`
  contains the `<h1>`, no JS executed.
- Server-rendered HTML confirmed in a **production build** running from
  `build/bin/server.js`.
- A silent failure was found and fixed: `@adonisjs/vite` only creates the SSR
  build environment when `serverEntryPoints` is declared in `vite.config.ts`.
  Without it, `node ace build` **succeeds**, no warning is printed, no SSR
  bundle is emitted, and production quietly serves a client-only shell while
  development still renders correctly. This is precisely the failure mode the
  verifier exists to catch, and it appeared on day one.

## Consequences

- Public controllers must return a `PageSeo` object. A page without one is not
  finished.
- TTFB becomes a risk the Astro benchmark (`r3p.dev`, `output: 'static'`) does
  not have. Public pages need HTTP caching plus ETags, and no N+1 queries.
  Tracked in Phase 3.
- No public page may pull Leaflet or map code into its initial bundle.
- `createInertiaApp({ title })` in `inertia/app.tsx` currently owns the document
  title on the client. Phase 1 must remove that so Edge is the sole author and
  the two cannot disagree.

---

## Phase 1.5 — measured, and Option A confirmed

**Date:** 2026-09-05

The spec set a single criterion for switching: *if TBT already fails, switch
before more pages are built on the wrong foundation.* It does not fail.

### What was measured

Mobile Lighthouse, all nine public URLs, against `build/bin/server.js` under
`NODE_ENV=production`.

| Run | Perf | A11y | BP | SEO | TBT |
| --- | --- | --- | --- | --- | --- |
| Nine URLs, as built | 88–91 | 100 | 100 | 100 | 0 ms (42 ms on `/faq`) |
| After asset fixes (3 URLs) | 92 | 100 | 100 | 100 | 0 ms |
| With brotli + immutable caching (3 URLs) | **99–100** | **100** | **100** | **100** | 0 ms |

### The decision

**Option A stands.** Public pages remain Inertia + SSR.

The argument for Option B was that ~96 KB gzip of React on a page with no
interactivity would show up as blocking time. It does not: **TBT is 0 ms on
eight of nine pages and 42 ms on the ninth**, against a Lighthouse threshold of
200 ms. These pages are simple enough that hydration costs nothing measurable
even under 4× CPU throttling. Switching to Edge templates would have bought
nothing that was actually being lost, at the cost of two rendering models.

The deficit was never JavaScript execution. It was bytes on the wire and two
oversized images, and both are fixed.

### What the numbers actually caught

Three real defects, none of them architectural:

1. **A 132 KB favicon.** The starter assets carried a "vector" favicon that was
   a 1000×1000 PNG wrapped in SVG. Replaced with the 1.7 KB PNG.
2. **A 101 KB logo drawn at 92×32.** Now a 3.9 KB WebP at the size it is
   displayed, with a JPEG fallback. The full-resolution wordmark stays in the
   JSON-LD `image`, which no browser fetches.
3. **No text compression.** `app.js` is 308 KB raw and 96 KB brotli. This is
   the single largest remaining lever and it is entirely an infrastructure
   concern.

### A consequence that must not be forgotten in Phase 6

**Caddy must serve brotli and immutable `Cache-Control` for hashed assets.**
That is not a refinement — the difference between 92 and 100 on these pages is
exactly that. The Adonis static server compresses nothing and sends
`max-age=0`, so a deployment that terminates TLS without compressing would ship
a measurably slower site than this ADR claims.

### Method note, learned the hard way

An audit run was recorded at a perfect 100 that was completely false: a stale
server process was still holding the port, serving HTML that referenced the
*previous* build's asset hashes. Every script 404'd, so Lighthouse measured a
page with no JavaScript at all and scored it beautifully.

**Before trusting any audit, assert that the asset URLs in the served HTML
return 200.** A performance score is only meaningful if the page under test is
the page that ships. This check is now written into CLAUDE.md.

### Also done in this phase

Tuyau and `sonner` were removed from the shared client entrypoint. The
authenticated layout now imports them itself, so they land in a chunk only
authenticated pages load: 19 KB gzip that public pages no longer download.
