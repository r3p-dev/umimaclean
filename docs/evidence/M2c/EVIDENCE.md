# M2c evidence: Profiles, account security, phone change, rate limits (version 0.2.0)

Date: 2026-11-16. Checkpoint **M2c**, the last part of M2 (accounts). Ends with version **0.2.0**.

## 1. Summary

- **Validation errors (D63, replaces D48).** The exception handler override that flashed every validation error a second time under `errors`, and the sign-in controller's manual flashes into three bags, are gone. Validation errors take the framework's own path (`@adonisjs/session` → `inputErrorsBag` → the Inertia `errors` prop). Tests follow the redirect and assert that prop with `assertInertiaPropsContains` (`tests/helpers/inertia.ts`). The cause: in `@adonisjs/session` 8.3.0, `flashValidationErrors` writes `inputErrorsBag`, while the Japa macro `assertValidationError` reads `errors` (links in D63).
- **CUST-12**: customer profile `/profil` (name, number, active devices) and `/profil/ubah` (change the name, change the password, link to the phone change).
- **CUST-13**: `/profil/nomor` sends a code to the new number (`change_phone`, same OTP rules as ACC-2) and `/verifikasi` confirms it. A number used by another account, the current number and a malformed number are refused; a number taken while the code was pending is refused at verification. Success changes the number and signs out every other device (ACC-5). Walk-in linking stays in M9.
- **OWN-13, STAFF-16 (profile part)**: `/admin/profil` and `/staf/profil` with account security only (no name change: the owner manages staff names, OWN-10).
- **ACC-4** on every profile: change the password (current password required), number of active devices (unexpired tagged sessions), "Keluar dari perangkat lain" (destroys the other sessions and every remember-me token except this device's, D67).
- **ACC-3, ACC-4 rate limits (D64)**, failed attempts only: sign-in 5 per number and 50 per IP per 15 minutes, a successful sign-in clears that number's counter only; password change 5 per account per 15 minutes. A blocked attempt shows "Terlalu banyak percobaan … Coba lagi dalam N menit." The OTP limits of D57 are unchanged. The exact numbers were added to PRD ACC-3 and ACC-4.
- **Wrong credentials** now show the PRD text "Nomor atau kata sandi salah." (code, tests, PLAN M2a).
- **Trusted proxies (D65)**: `TRUSTED_PROXIES` (default `loopback`) decides whose `X-Forwarded-For` is honoured; `docs/SETUP.md` says production must set the Podman network of Traefik.
- **Navigation (D33, D66)**: "Profil" tab for customers on phones and their name in the desktop header; "Profil" next to "Keluar" in the staff and owner sidebars (and the owner's phone menu); an interim "Profil" tab on staff phones, whose profile page also carries "Keluar" (phones had no sign-out before).
- **Cleanups (owner-approved)**: stray table header after D1, D58 brought in line with D62, D29 alternatives column, ARCHITECTURE §3.2 vs snake_case, `AccountService`'s own exception classes (now VineJS validation errors on the field, CONVENTIONS §8) and its docblock.

## 2. How to run and see it

```sh
npm install
node ace migration:run
node ace db:seed
npm run dev
```

| Account (seeded)       | Sign in at    | See                                                         |
| ---------------------- | ------------- | ----------------------------------------------------------- |
| `082111223344` (Rina)  | `/masuk`      | `/profil`, `/profil/ubah`, `/profil/nomor`                  |
| `081312345678` (staff) | `/staf/masuk` | "Profil" in the sidebar or the phone tab → `/staf/profil`   |
| `081298765432` (owner) | `/staf/masuk` | "Profil" in the sidebar or the phone menu → `/admin/profil` |

All passwords are `password123`. Without `FONNTE_TOKEN`, the phone change code appears in the dev server log (development only, D60).

## 3. Screenshots

Chromium (Playwright) at 360 × 780 and 390 × 844 (2×) and 1440 × 900, full page, against the dev server with `TURNSTILE_ENABLED=false` (no request to Cloudflare). Every shot was also checked with axe (WCAG 2.1 A and AA) and for horizontal scrolling; the run's output is in `screenshots.log`. Each name exists as `-360.png`, `-390.png` and `-1440.png` (`admin-menu` only at 360 and 390, where the menu exists). The device counts on the profile shots are real: they include the still-unexpired sessions of earlier screenshot runs against the same development database. The phone change shots move one seeded customer through three temporary numbers and back to its seeded number. The staff tab bar is `sticky`, so in full-page shots it appears where the viewport ended.

| State                                   | Files                                     |
| --------------------------------------- | ----------------------------------------- |
| Customer home with the new navigation   | `beranda-navigasi-*`                      |
| Customer profile, 2 devices             | `profil-*`                                |
| After "Keluar dari perangkat lain"      | `profil-perangkat-lain-keluar-*`          |
| Edit profile                            | `profil-ubah-*`                           |
| Name saved                              | `profil-nama-disimpan-*`                  |
| Wrong current password                  | `profil-ubah-kata-sandi-salah-*`          |
| Phone change form                       | `profil-nomor-*`                          |
| Number used by another account          | `profil-nomor-dipakai-*`                  |
| OTP for the new number                  | `verifikasi-ganti-nomor-*`                |
| Number changed                          | `profil-nomor-diganti-*`                  |
| Sign-in blocked after 5 wrong passwords | `masuk-terlalu-banyak-percobaan-*`        |
| Staff home with the new navigation      | `staf-navigasi-*`                         |
| Staff profile                           | `staf-profil-*`                           |
| Staff password change blocked           | `staf-profil-kata-sandi-terlalu-banyak-*` |
| Owner summary with the new navigation   | `admin-navigasi-*`, `admin-menu-*`        |
| Owner profile                           | `admin-profil-*`                          |

## 4. How it works

```mermaid
sequenceDiagram
  participant B as Browser
  participant C as Controller
  participant A as AccountService
  participant L as Limiter (rate_limits)
  participant DB as users / sessions / remember_me_tokens
  B->>C: POST /masuk (phone, password)
  C->>A: verifyCustomerCredentials(input, request.ip())
  A->>L: IP key blocked? (50 / 15 min)
  A->>L: penalize(phone key, verifyCredentials) (5 / 15 min)
  L-->>A: wrong password → +1 phone, +1 IP, field error
  A-->>C: user (phone counter cleared)
  C-->>B: redirect to /beranda
  B->>C: POST /akun/keluar-perangkat-lain
  C->>A: signOutOtherDevices(user, {sessionId, remember_web cookie})
  A->>DB: delete other remember-me tokens; SessionCollection.destroy other tagged sessions
  C-->>B: redirect back + "Perangkat lain sudah dikeluarkan."
```

Phone change: `POST /profil/nomor` → `PhoneChangeController.store` → `OtpService.startPhoneChange` (refusals, OTP to the new number, flow in the session) → `/verifikasi` → `OtpController.verify` (flow must belong to the signed-in account) → `OtpService.verifyOtp` → `AccountService.changePhone` (re-checks the number in the transaction) → `signOutOtherDevices` → `/profil`.

## 5. Decisions and deviations

- D63–D68 in `docs/ARCHITECTURE.md` §7; D48 marked superseded; D58 corrected.
- Password change does not sign out other devices (ACC-5 lists only reset and phone change).
- No confirmation dialog before "Keluar dari perangkat lain" (one behaviour for every role, no new component).
- `proxy-addr` moved from "approved to add" to installed (`docs/DEPENDENCIES.md`).
- Owner-requested cleanups share files with feature changes (`docs/ARCHITECTURE.md`, `app/services/account_service.ts`, `app/controllers/session_controller.ts`), so they can't be separate commits under the one-path-one-commit rule (see the report).

## 6. Verification

| Check                     | Result                                               | Log                                                                |
| ------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| Baseline before changes   | lint 0, typecheck 0, 115 tests passed                | `baseline-lint.log`, `baseline-typecheck.log`, `baseline-test.log` |
| `npm run lint`            | exit 0                                               | `lint.log`                                                         |
| `npm run typecheck`       | exit 0                                               | `typecheck.log`                                                    |
| `npm test`                | 157 passed (157)                                     | `test.log`                                                         |
| axe + 360 px on new pages | browser suite (`look.spec.ts`) and `screenshots.log` | `test.log`, `screenshots.log`                                      |

## 7. Known limitations

- A remembered device whose session expired is not counted as active until it returns (D67).
- The staff "Profil" tab and sidebar link are interim until "Lainnya" (M10b, D66).
- The default button's hover colour (`bg-primary/80` under white text) measures 4.11:1, below AA 4.5:1, while the pointer rests on it after a click; resting states pass. Found in M2c, not changed (theme decision).
