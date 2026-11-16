# M2 follow-up evidence (version 0.2.2)

Date: 2026-11-16. Patch release for pre-M3 maintenance (`AGENTS.md` §6: fixes and maintenance between milestones are patch bumps).

## 1. Summary

- **ESLint upgrade (10.14.0 → 10.15.0)**: upgraded `eslint` to 10.15.0 within the range approved in `docs/DEPENDENCIES.md`. This closes the `minimatch` vulnerability path through ESLint (`@eslint/config-array` 0.23.6 uses fixed `minimatch`). Total npm audit advisories decreased from 33 to 31 (2 low, 29 moderate).
- **Test port isolation (D71)**: configured `PORT=3334`, `HOST=localhost`, and `APP_URL=http://${HOST}:${PORT}` in `.env.test`. AdonisJS's `@adonisjs/env` loader prioritizes `.env.test` over `.env` in `NODE_ENV=test`, allowing `npm test` to run cleanly without port collisions while a development server runs on port 3333.
- **Documentation & example sync**: updated `.env.example`, `docs/SETUP.md`, and recorded decision D71 in `docs/ARCHITECTURE.md` §7.
- **Browser & URL verification**: verified that browser tests (`tests/browser/auth_flow.spec.ts`, `tests/browser/account_security_flow.spec.ts`) and sitemap/robots URLs constructed from `env.get('PORT')` and `appUrl` (`APP_URL`) bind and resolve accurately to port 3334.

## 2. How to see it

1. Start the development server on default port 3333: `npm run dev`.
2. In another terminal window, run `npm test` without any inline environment variable overrides.
3. Observe that tests start their own HTTP server on port 3334 and run all 159 tests to completion without EADDRINUSE conflicts.

## 3. Screenshots

No user-facing UI, layout, styling, or text copy was modified in this patch.

## 4. Tests

All 159 unit, functional, and browser tests continue to pass without errors or deprecation warnings.

- Unit tests: abilities, account service, OTP service, phone utilities, theme tokens, trusted proxies, Turnstile gateway, WhatsApp service.
- Functional tests: account security, authentication flows, error handling, OTP endpoints, rate limits, profile endpoints, SEO.
- Browser tests: multi-device sessions, authentication journeys, responsive layout at 360, 390, and 1440 px, and automated axe accessibility audits.

## 5. npm audit (`npm-audit.log`)

31 entries (2 low, 29 moderate). The minimatch path through ESLint is closed. Other advisories remain reviewed as in M2-0.2.1:

| Advisory | Package (installed) | Severity | Brought in by | Reaches production? | Status / Fix |
| --- | --- | --- | --- | --- | --- |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) (ReDoS in minimatch) | `minimatch` (< 11.0.1) | moderate | `typescript-eslint` 8.72.x, `ts-morph` (used by `@adonisjs/assembler` and `shadcn` CLI) | No: dev tooling only. Glob patterns come from repo config, never user input. | Closed for `eslint` via 10.15.0 upgrade. Awaiting upstream patch releases for `typescript-eslint`, `ts-morph`, and `shadcn`. |
| [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) (prototype poisoning in `mergeObject`) | `deepmerge` 4.3.1 | low | `@adonisjs/lucid` 22.4.2, `shadcn` 4.23.0 (`@shadcn/registry`) | Used only by Lucid's schema generator during migrations, on our own database schema. | No patch published upstream (4.3.1 is latest release). Awaiting future Lucid release. |

## 6. Verification

| Check | Before | After | Logs |
| --- | --- | --- | --- |
| `npm run lint` | exit 0 | exit 0 | `baseline-lint.log`, `lint.log` |
| `npm run typecheck` | exit 0 | exit 0 | `baseline-typecheck.log`, `typecheck.log` |
| `npm test` | 159 passed (159) *(with `PORT=3334`)* | 159 passed (159) *(plain `npm test`)* | `baseline-test.log`, `test.log` |

## 7. Known limitations

- The remaining 31 dev-tooling advisories (`typescript-eslint`, `ts-morph`, `shadcn`, `deepmerge`) remain until upstream maintainers release compatible updates without breaking changes.
