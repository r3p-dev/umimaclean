# M2 follow-up evidence (version 0.2.1)

Date: 2026-11-16. Patch release after the review of M2 (`AGENTS.md` §6: fixes after a milestone review are patch bumps).

## 1. Summary

- **ACC-5, D69**: a successful password change signs out every other device through `AccountService.signOutOtherDevices`, the same method as "Keluar dari perangkat lain": the other sessions are destroyed and every remember-me token except this device's is revoked. A refused change signs out nothing. The password card now says "Setelah diganti, perangkat lain harus masuk lagi." PRD ACC-5 and D67 updated.
- **Hover contrast, D70**: `--primary` (and the same brand value in `--ring`, `--chart-1`, `--sidebar-primary`) goes from `oklch(0.5 0.18 262)` to `oklch(0.46 0.18 262)`. The default button's hover (`bg-primary/80`) under white text goes from 4.1:1 (#4f7bd3, below AA) to 4.7:1 on white and 4.8:1 on the page background; the resting button is 7.4:1. No component changed.
- **npm audit** reviewed (section 5). Nothing upgraded.

## 2. How to see it

`npm run dev`, sign in as `082111223344` / `password123` on two browsers (one with "Ingat saya"), change the password at `/profil/ubah` on one, then reload the other: it lands on `/masuk`.

## 3. Screenshots

Chromium at 360 × 780 and 390 × 844 (2×) and 1440 × 900, full page, against a dev server on port 3335 with `TURNSTILE_ENABLED=false`. `-hover` shots keep the pointer on the primary button, as right after a click, which is the state that failed axe in M2c. Every shot passes axe (WCAG 2.1 A and AA) with no horizontal scrolling; the run's output is in `screenshots.log`.

| State                                                   | Files                                    |
| ------------------------------------------------------- | ---------------------------------------- |
| Sign-in blocked, pointer on "Masuk"                     | `masuk-terlalu-banyak-percobaan-hover-*` |
| Number used by another account, pointer on "Kirim Kode" | `profil-nomor-dipakai-hover-*`           |
| Edit profile with the new password card text            | `profil-ubah-*`                          |
| Password changed, pointer on "Ubah Kata Sandi"          | `profil-kata-sandi-diganti-*`            |
| Customer profile in the new blue                        | `profil-*`                               |
| Staff profile                                           | `staf-profil-*`                          |
| Owner profile                                           | `admin-profil-*`                         |

## 4. Tests

- Functional (`tests/functional/account_security.spec.ts`): a password change revokes the other remember-me tokens and keeps the current device's; a refused change revokes nothing; the flash message is "Kata sandi diganti. Perangkat lain sudah dikeluarkan."
- Browser (`tests/browser/account_security_flow.spec.ts`): a remembered device is signed out with "Keluar dari perangkat lain", a second remembered device is signed out by the password change, and neither comes back on reload.
- Unit (`tests/unit/account_service.spec.ts`): `changePassword` takes the current device.

## 5. npm audit (`npm-audit.log`)

33 entries (2 low, 31 moderate) all come from two advisories; the rest are packages that depend on them. The fixes `npm audit` suggests are downgrades to old major versions (`@adonisjs/core@5.9.0`, `@adonisjs/lucid@21.8.2`, `shadcn@1.0.0`) and are not applied.

| Advisory                                                                                                        | Package (installed)           | Severity | Brought in by                                                                                                                             | Reaches production?                                                                                                                                                    | Fix                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) (ReDoS with crafted glob patterns)     | `minimatch` 10.2.6 (< 11.0.1) | moderate | `eslint` (via `@eslint/config-array` 0.23.x), `typescript-eslint` 8.72.x, `ts-morph` (used by `@adonisjs/assembler` and the `shadcn` CLI) | No: dev tooling only. `@adonisjs/assembler` is a dev dependency and an optional peer of `@adonisjs/auth`; the glob patterns come from our own config, never from users | `eslint` 10.14.0 → 10.15.0 (in range) brings `@eslint/config-array` 0.23.6 with `minimatch` ^11.0.5. No upstream fix yet for `typescript-eslint` 8.72.2, `ts-morph` 28.0.0, `shadcn` 4.23.0 (all latest) |
| [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) (prototype poisoning in `mergeObject`) | `deepmerge` 4.3.1             | low      | `@adonisjs/lucid` 22.4.2, `shadcn` 4.23.0 (`@shadcn/registry`)                                                                            | Installed in production with Lucid, but used only by Lucid's schema generator (`build/src/orm/schema_generator/builder.js`, run by migrations), on our own schema      | None published: 4.3.1 is the latest release (2023). Wait for Lucid                                                                                                                                       |

## 6. Verification

| Check               | Before           | After            | Logs                                      |
| ------------------- | ---------------- | ---------------- | ----------------------------------------- |
| `npm run lint`      | exit 0           | exit 0           | `baseline-lint.log`, `lint.log`           |
| `npm run typecheck` | exit 0           | exit 0           | `baseline-typecheck.log`, `typecheck.log` |
| `npm test`          | 157 passed (157) | 159 passed (159) | `baseline-test.log`, `test.log`           |

Tests ran with `PORT=3334`, so the test HTTP server never shared a port with another running dev server.

## 7. Known limitations

- The moderate `minimatch` advisory stays in dev tooling until `typescript-eslint`, `ts-morph` and `shadcn` move to `minimatch` 11.
