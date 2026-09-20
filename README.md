# UmimaClean

Cuci dan reparasi sepatu, tas, dan helm di Bandung, dengan antar jemput gratis.

AdonisJS + Inertia + React, server-rendered, PostgreSQL. Conventions and the
rules that are easy to break by accident live in [CLAUDE.md](./CLAUDE.md).

## Running it

```sh
npm install
cp .env.example .env && node ace generate:key
node ace migration:run
node ace sitemap:sync
npm run dev              # http://localhost:3333
```

PostgreSQL is expected on `localhost:5432` with the credentials in `.env`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build, including the SSR bundle |
| `npm run typecheck` | Server and client projects |
| `npm run lint` / `npm test` | ESLint / Japa |
| `npm run verify:seo` | Fails if any public URL's raw HTML is not crawlable |
| `npm run audit:proxy` | Brotli + immutable caching in front of the built server, for realistic Lighthouse runs |
| `npm run build:map` | Regenerates the coverage map from BIG boundary data |

## Deploying

Order matters:

```sh
node ace migration:run --force
node ace sitemap:sync
```

`sitemap:sync` only moves a page's `updated_at` when its content hash changes,
which is what keeps `lastmod` honest.

## The coverage map

`app/content/coverage_map.ts` is generated, not hand-edited. Regenerate with
`npm run build:map` after changing `app/content/areas.ts`; the script exits
non-zero if any covered kecamatan has no matching boundary, rather than quietly
drawing it as uncovered.

Boundary data comes from **Badan Informasi Geospasial (BIG)**, RBI 1:10.000
`Administrasi_AR_Kecamatan_10K`, and the map carries that attribution on the
page. OpenStreetMap was tried first and cannot supply it — kecamatan boundaries
for Kota Cimahi and most of Kabupaten Bandung are absent from OSM entirely.
GADM is deliberately not used: its licence forbids commercial use.

`npm install` reports vulnerabilities in `mapshaper`'s own dependencies
(`adm-zip`, `fflate`, and the `file-type`/`image-size` pulled in by
`@ngageoint/geopackage`). All of them are denial-of-service bugs in ZIP or
image parsers, reachable only if `mapshaper` is fed a crafted file — it never
runs against anything but the BIG shapefile above, by hand, so they're not
exploitable here. `npm audit fix --force` "fixes" this by downgrading
`mapshaper` to 0.6.13, an old major version that risks breaking this script;
that trade isn't worth it for a devDependency with no attacker-controlled
input. Left alone deliberately.

## Off-site SEO checklist

None of this can be done from the codebase. It is at least as important as
everything that can.

- [ ] **Google Business Profile** — category "Shoe repair shop" (or the closest
      equivalent). The NAP on the profile must match `app/content/business.ts`
      character for character; that identity is what merges the site and the
      profile into one entity.
- [ ] **Search Console** — verify the property, submit `/sitemap.xml`, and
      check Coverage for anything unexpectedly excluded.
- [ ] **Local directories** — keep the same NAP everywhere it appears. A
      changed abbreviation is a different business as far as matching goes.
- [ ] **Profile URLs** — send the real Instagram and TikTok URLs so they can go
      into `PROFILES`. They are emitted as `sameAs`, one of the strongest
      entity signals available, and are deliberately empty rather than guessed.
- [ ] **Before/after photos** — the primary conversion asset. Service-page
      galleries stay out until real files exist; no placeholders.

## Notes

- The domain is temporary. `ORIGIN` comes from `APP_URL`; nothing else knows
  the host.
- Reviews are rendered for readers but never marked up. Google does not show
  review rich results for a business that controls the reviews on its own site.
