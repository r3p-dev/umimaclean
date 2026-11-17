# M2b evidence: Registration, WhatsApp OTP, password reset, Turnstile (version 0.1.2)

Date: 2026-11-16. Checkpoint **M2b** (second part of M2, accounts, v0.2.0; version remains **0.1.2** until M2c).

## 1. Summary

- **GUEST-10**: Customer registration (`/daftar`) with name, WhatsApp phone number (`PhoneInput`), password and confirmation (`PasswordInput`), terms checkbox (`Checkbox`), and Cloudflare Turnstile bot verification (`TurnstileWidget`). Refuses existing phone numbers, mismatched passwords, or unchecked terms. Pending sign-up state lives exclusively in the database session store (`shared.md` §12), never in a cookie or hidden form field. Account is created only after OTP confirmation on `/verifikasi`, landing signed in on `/beranda`.
- **ACC-2**: Universal WhatsApp OTP verification service supporting `register` and `reset_password` flows (and extensible to `change_phone`).
  - 6-digit numeric codes with 5 minutes validity.
  - Stored only as keyed HMAC-SHA256 (`crypto.createHmac('sha256', appKey)`) and compared in constant time (`crypto.timingSafeEqual`), never logged.
  - Locked permanently after 5 wrong attempts.
  - 60-second resend cooldown (`POST /verifikasi/kirim-ulang`).
  - Hourly rate limits enforced via `@adonisjs/limiter` database storage: at most 5 sends per phone number and 20 sends per IP per hour.
  - Outgoing delivery via `WhatsAppService` using Fonnte, with the `WHATSAPP_ALLOWED_PHONES` guard outside production and the test log driver when no token is configured. WhatsApp failures never crash the HTTP request (`MSG-3`), returning user-friendly error feedback.
- **GUEST-12**: Forgot password flow (`/lupa-kata-sandi` → `/verifikasi` → `/kata-sandi-baru`). The response to `/lupa-kata-sandi` never reveals whether the phone number is registered, displaying the exact PRD sentence: *"Jika nomor terdaftar, kode dikirim via WhatsApp."*. Unregistered numbers trigger no WhatsApp send.
- **ACC-5**: Successful password reset updates user password hash, invalidates all other active sessions in the `sessions` table, and removes all `remember_me_tokens` for that user.
- **Cloudflare Turnstile**: Verified server-side via `TurnstileGateway` for both `/daftar` and `/lupa-kata-sandi`. Cloudflare test keys used in development; disabled via `TURNSTILE_ENABLED=false` in tests. In browser tests, `challenges.cloudflare.com` is the only external host allowed, and the Turnstile iframe is excluded from Axe accessibility audits.
- **Navigation (D33)**: Added links to `/daftar` and `/lupa-kata-sandi` from `/masuk`, the landing hero ("Daftar Sekarang" button), and the site footer.
- **Test path reporting**: Updated browser test runner in `tests/browser/look.spec.ts` to output the exact page path (e.g. `authenticated page /beranda`) instead of `authenticated page [object Object]`.

## 2. How to run and see it

```sh
npm install
node ace migration:run
node ace db:seed
npm run dev
```

| URL                 | What                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------ |
| `/daftar`           | Registration form with name, WhatsApp phone, password, terms checkbox, and Turnstile |
| `/verifikasi`       | Accessible 6-digit OTP verification form with countdown timer and resend button      |
| `/lupa-kata-sandi`  | Request password reset by entering WhatsApp phone number and completing Turnstile    |
| `/kata-sandi-baru`  | Set new password and confirmation after OTP verification has been granted            |

## 3. Screens

Captured with Playwright Chromium at 360 × 780, 390 × 844 (both 2× scale), and 1440 × 900. No horizontal scrolling occurred at 360 px viewport. All pages pass WCAG 2.1 A and AA rules (axe-core).

| State / Screen                         | 360                                      | 390                                      | 1440                                       |
| -------------------------------------- | ---------------------------------------- | ---------------------------------------- | ------------------------------------------ |
| Registration (`/daftar`)               | [360](daftar-360.png)                    | [390](daftar-390.png)                    | [1440](daftar-1440.png)                    |
| Registration Validation Error          | [360](daftar-error-360.png)              | [390](daftar-error-390.png)              | [1440](daftar-error-1440.png)              |
| Verification Fresh (`/verifikasi`)     | [360](verifikasi-fresh-360.png)          | [390](verifikasi-fresh-390.png)          | [1440](verifikasi-fresh-1440.png)          |
| Verification Wrong Code Error          | [360](verifikasi-error-360.png)          | [390](verifikasi-error-390.png)          | [1440](verifikasi-error-1440.png)          |
| Verification Locked (5 Wrong Tries)    | [360](verifikasi-locked-360.png)         | [390](verifikasi-locked-390.png)         | [1440](verifikasi-locked-1440.png)         |
| Forgot Password (`/lupa-kata-sandi`)   | [360](lupa-kata-sandi-360.png)           | [390](lupa-kata-sandi-390.png)           | [1440](lupa-kata-sandi-1440.png)           |
| Forgot Password Validation Error       | [360](lupa-kata-sandi-error-360.png)     | [390](lupa-kata-sandi-error-390.png)     | [1440](lupa-kata-sandi-error-1440.png)     |
| New Password (`/kata-sandi-baru`)      | [360](kata-sandi-baru-360.png)           | [390](kata-sandi-baru-390.png)           | [1440](kata-sandi-baru-1440.png)           |
| New Password Validation Error          | [360](kata-sandi-baru-error-360.png)     | [390](kata-sandi-baru-error-390.png)     | [1440](kata-sandi-baru-error-1440.png)     |

## 4. How it works

### Registration Journey (GUEST-10 & ACC-2)

```mermaid
sequenceDiagram
  participant B as Browser
  participant RC as RegistrationController
  participant TG as TurnstileGateway
  participant OS as OtpService
  participant WS as WhatsAppService
  participant S as Session Store (DB)
  participant OC as OtpController
  participant AS as AccountService

  B->>RC: POST /daftar (name, phone, password, terms, turnstile)
  RC->>TG: assertToken(turnstile)
  RC->>RC: validate unique phone (User.isPhoneTaken)
  RC->>S: put('pending_registration', { name, phone, password })
  RC->>OS: sendOtp(session, phone, 'register', ip)
  OS->>WS: send(phone, otpCode)
  RC-->>B: 302 redirect /verifikasi

  B->>OC: POST /verifikasi (code)
  OC->>OS: verifyOtp(session, code)
  OS->>OS: check HMAC hash & attempts
  OC->>AS: createCustomer(pendingRegistration)
  AS->>AS: User.createQuietly(name, phone, password, customer)
  OC->>B: auth.login & 302 redirect /beranda
```

### Password Reset Journey (GUEST-12 & ACC-5)

```mermaid
sequenceDiagram
  participant B as Browser
  participant PC as PasswordResetController
  participant TG as TurnstileGateway
  participant OS as OtpService
  participant WS as WhatsAppService
  participant OC as OtpController
  participant AS as AccountService
  participant DB as PostgreSQL

  B->>PC: POST /lupa-kata-sandi (phone, turnstile)
  PC->>TG: assertToken(turnstile)
  alt Phone exists
    PC->>OS: sendOtp(session, phone, 'reset_password', ip)
    OS->>WS: send(phone, otpCode)
  else Phone unregistered
    Note over PC: Silently skip sending WhatsApp (anti-enumeration)
  end
  PC-->>B: 302 redirect /verifikasi (flash: "Jika nomor terdaftar, kode dikirim via WhatsApp.")

  B->>OC: POST /verifikasi (code)
  OC->>OS: verifyOtp(session, code)
  OC->>OC: session.put('otp_verified', { phone, purpose: 'reset_password' })
  OC-->>B: 302 redirect /kata-sandi-baru

  B->>PC: POST /kata-sandi-baru (password, password_confirmation)
  PC->>AS: resetPassword(phone, password)
  AS->>DB: update password hash
  AS->>AS: signOutOtherDevices(user.id, currentSessionId)
  Note over AS,DB: Invalidate other records in sessions & remember_me_tokens
  PC-->>B: 302 redirect /masuk (flash: "Kata sandi berhasil diperbarui.")
```

## 5. Code tour (reading order)

1. `database/migrations/1761885935171_create_sessions_table.ts`
2. `database/migrations/1761885935172_create_rate_limits_table.ts`
3. `database/migrations/1761885935173_create_otp_codes_table.ts`
4. `app/enums/otp_purpose_enum.ts`
5. `app/models/otp_code.ts`, `app/models/user.ts` (extended with `isPhoneTaken`)
6. `app/services/turnstile_gateway.ts`
7. `app/services/whatsapp_service.ts`
8. `app/services/otp_service.ts`
9. `app/services/account_service.ts` (added `createCustomer`, `resetPassword`, `signOutOtherDevices`)
10. `app/validators/registration_validator.ts`, `app/validators/otp_validator.ts`, `app/validators/password_reset_validator.ts`
11. `app/controllers/registration_controller.ts`
12. `app/controllers/otp_controller.ts`
13. `app/controllers/password_reset_controller.ts`
14. `start/routes.ts`
15. `inertia/lib/shared/turnstile.ts`, `inertia/lib/shared/countdown.ts`
16. `inertia/components/molecules/turnstile_widget.tsx`, `inertia/components/molecules/otp_input.tsx`, `inertia/components/molecules/form_field.tsx`
17. `inertia/pages/auth/register.tsx`, `inertia/pages/auth/otp.tsx`, `inertia/pages/auth/forgot_password.tsx`, `inertia/pages/auth/reset_password.tsx`
18. `inertia/pages/auth/login.tsx`, `inertia/components/organisms/landing/hero.tsx`, `inertia/components/organisms/site_footer.tsx` (D33 navigation links)
19. `tests/unit/turnstile_gateway.spec.ts`, `tests/unit/otp_service.spec.ts`
20. `tests/functional/registration.spec.ts`, `tests/functional/otp.spec.ts`, `tests/functional/password_reset.spec.ts`
21. `tests/browser/auth_flow.spec.ts`, `tests/browser/look.spec.ts`

## 6. Decisions and deviations

- **D55–D59 in `docs/ARCHITECTURE.md` §7**:
  - D55: Server-side database session store (`pending_registration`) protects pending sign-up data without relying on cookies or client-controlled hidden inputs (`shared.md` §12).
  - D56: OTP codes are stored as HMAC-SHA256 keyed hashes with `timingSafeEqual` comparison. Codes are never stored as plain text or logged (ACC-2).
  - D57: Multi-layer rate limiting: max 5 wrong attempts per OTP session (locks permanently), 60-second cooldown on resends, max 5 sends per phone number per hour, and max 20 sends per IP per hour (`@adonisjs/limiter`).
  - D58: Server-side Turnstile verification for all public forms with test-key bypass during automated testing (`TURNSTILE_ENABLED=false`).
  - D59: Browser tests exclude Cloudflare Turnstile iframe from Axe audits and wait for `load` event to prevent third-party network polling hangs.
- **No arbitrary Tailwind values**: standard Tailwind typography and spacing scale utilized throughout.
- **One light theme**: zero `dark:` classes in new components or auth pages.

## 7. Evidence

Verification logs: [lint.log](lint.log), [typecheck.log](typecheck.log), [test.log](test.log).

---

## FIX

## Checkpoint M2b-fix Evidence

Date: 2026-11-16. Checkpoint **M2b-fix** (review fixes for M2b, accounts, v0.2.0).

This checkpoint resolves all 5 security and architectural review findings from checkpoint M2b without starting M2c.

---

### 1. Resolved Review Findings

#### 1. ACC-5 Session Tagging for Normal Sign-ins & Remember-Me
- **Problem**: `signOutOtherDevices` relies on the database session tag (`user_id`), but previously only OTP verification and password reset flows called `session.tag()`. Standard sign-in routes (`/masuk`, `/staf/masuk`) and sessions restored from remember-me cookies never tagged the session, allowing existing active sessions to stay signed in after a password reset.
- **Fix**: Centralized session tagging in `app/middleware/silent_auth_middleware.ts`. Whenever `ctx.auth.user` is resolved, `ctx.session.tag([String(ctx.auth.user.id)])` is executed. When a session is logged out or unauthenticated, it is untagged. Removed duplicate controller-level calls.
- **Test Rewrite**: Rewrote the ACC-5 test in `tests/functional/password_reset.spec.ts` to use real sign-ins:
  1. Client 1 signs in via `/masuk` with `rememberMe: true`.
  2. Client 2 signs in via `/masuk` with `rememberMe: true`.
  3. Both clients successfully access `/beranda` (HTTP 200).
  4. Client 3 executes the complete password reset flow via real routes (`/lupa-kata-sandi` → `/verifikasi` → `/kata-sandi-baru`).
  5. Client 1 and Client 2 attempt to access `/beranda` and both receive HTTP 302 redirects to `/masuk`.
  6. All `remember_me_tokens` for the user are verified deleted from the database. Zero manual session row insertions.

#### 2. Database Session Store in Tests
- **Problem**: `.env.test` previously set `SESSION_DRIVER=memory`, bypassing tests for pending sign-up data persistence in the database store (`shared.md` §12) and database session tagging.
- **Fix**: Configured `SESSION_DRIVER=database` in `.env.test`. In `tests/bootstrap.ts`, patched Japa's `SessionClient.prototype.destroy` to prevent teardown hooks from destroying server-persisted database sessions between chained client requests, and introduced the `withAuthCookiesFrom(response)` helper macro on `ApiRequest` to seamlessly propagate authenticated session and encrypted remember-me cookies. All 111 tests run against PostgreSQL with the database session store.

#### 3. Elimination of Swallowed Exceptions
- **Problem**: `signOutOtherDevices` wrapped session table deletions in an empty `catch {}` block, which could allow a reset to claim success while other devices remained signed in if the query failed.
- **Fix**: Removed the `try/catch` wrapper in `app/services/account_service.ts`. Session invalidation failures now properly propagate. Verified no other empty or swallowing catch blocks exist across the codebase (CONVENTIONS §11).

#### 4. Separation of Production Code and Test Code
- **Problem**: `app/services/whatsapp_service.ts` contained a static `#dispatched` array that accumulated every sent message (including OTPs) in production memory indefinitely, along with test helper methods (`getLatestOtpCode`, `clearDispatched`, etc.).
- **Fix**: Removed all static arrays and test helpers from `WhatsAppService`. Created `FakeWhatsAppService` in `tests/helpers/fake_whatsapp_service.ts` and bound it in `tests/bootstrap.ts` via `app.container.swap(WhatsAppService, () => fakeWhatsApp)`. Unit, functional, and browser tests now read dispatched OTPs from `fakeWhatsApp`, keeping production code completely free of test instrumentation.

#### 5. Privacy & Log Protection (ACC-1, ACC-2)
- **Problem**: WhatsApp messages logged in non-development environments could expose OTP codes or unmasked phone numbers.
- **Fix**:
  - All log statements with phone numbers use `maskPhone` (e.g. `62812****5432`).
  - In `WhatsAppService`, full message text is only logged when `NODE_ENV === 'development'`. In all other environments (test, staging, production), it logs only `{ phone: maskedPhone, kind: 'otp' }`, never the text or raw digits.
  - Added unit tests in `tests/unit/whatsapp_service.spec.ts` and `tests/unit/otp_service.spec.ts` asserting that outside development, OTP codes and unmasked phone numbers are never emitted to logs.
  - Recorded as Decision D60 in `docs/ARCHITECTURE.md`.

---

### 2. Test & Quality Verification

All verification commands executed cleanly on PostgreSQL:

| Check | Result | Evidence File |
| :--- | :--- | :--- |
| TypeScript Typecheck | 0 errors | `docs/evidence/M2b/typecheck-fix.log` |
| ESLint Audit | 0 errors, 0 warnings | `docs/evidence/M2b/lint-fix.log` |
| Japa Test Suite | 111 passed (111) | `docs/evidence/M2b/test-fix.log` |
| Axe Accessibility (WCAG 2.1 AA) | 0 violations | Verified in test suite |
| Viewport 360 px Responsive Layout | No horizontal scroll | Verified in test suite |

---

## FIX2

## M2b-fix2 Checkpoint Evidence: Test Infrastructure Clean-up & Turnstile Isolation

Date: 2026-11-16. Checkpoint **M2b-fix2** (clean-up of test bootstrap, library unpatching, official test helpers, Turnstile container swap and browser decorator, and walk-in linkage preparation for M9).

---

### 1. Resolved Review Items

#### 1. Don't Patch Libraries (ACC-5 Multi-Device Browser Test)

- **Problem**: `tests/bootstrap.ts` previously patched `SessionClient.prototype.destroy` and added a custom `withAuthCookiesFrom` macro. Modifying library internals across all tests risks hiding session leaks and adds unnecessary maintenance overhead.
- **Fix**:
  - Removed the `SessionClient.prototype.destroy` monkey-patch.
  - Removed the `withAuthCookiesFrom` macro and associated type declarations.
  - Moved the full ACC-5 multi-device session revocation verification into the browser suite (`tests/browser/auth_flow.spec.ts`):
    1. Device 1 signs in via `/masuk` with "Ingat saya" (remember-me) checked in a dedicated browser context. A persistent token is verified in `remember_me_tokens`.
    2. Device 2 signs in via `/masuk` without remember-me in a second browser context.
    3. Device 3 resets password through `/lupa-kata-sandi` → `/verifikasi` → `/kata-sandi-baru` in a third browser context.
    4. On next page load to `/beranda`, both Device 1 and Device 2 are immediately redirected to `/masuk`.
    5. Database verifies all remember-me tokens for the user have been revoked (`tokensAfter.length === 0`).
  - Simplified the functional test in `tests/functional/password_reset.spec.ts` to focus strictly on what a single client verifies (password hash update in DB, landing on `/beranda`, generic security notice).

#### 2. Adoption of Official Test Helpers

- **Problem**: `tests/bootstrap.ts` had custom macros (`assertValidationError`, `assertHasValidationError`, `assertValidationErrors`) with incorrect inversion logic and untyped signatures.
- **Fix**:
  - Removed all custom validation assertion macros.
  - Integrated `@adonisjs/session`'s official `assertValidationError` and `assertFlashMessage`.
  - Updated `app/exceptions/handler.ts` (`renderValidationErrorAsHTML`) so that VineJS validation errors are flashed to both `inputErrorsBag` (for Inertia) and `errors` (for `@adonisjs/session`'s official test assertion helper), resolving the assertion gap natively without library patching.
  - Registered `@adonisjs/inertia`'s official `inertiaApiClient(app)` in `tests/bootstrap.ts`.
  - Replaced manual JSON/HTML inspection with `assertInertiaComponent` and `assertInertiaPropsContains` across all functional test suites (`auth.spec.ts`, `registration.spec.ts`, `otp.spec.ts`, `password_reset.spec.ts`).

#### 3. Server & Browser Turnstile Isolation (No Bypass)

- **Problem**: Tests previously relied on disabling Turnstile verification (`if (env.get('NODE_ENV') === 'test') return true`), leaving controller verification pathways untested.
- **Fix**:
  - Removed the `NODE_ENV === 'test'` early exit from `TurnstileGateway.ts`. Kept `TURNSTILE_ENABLED` solely for optional local offline development without keys.
  - Created `FakeTurnstileGateway` (`tests/helpers/fake_turnstile_gateway.ts`) accepting `TEST_TURNSTILE_TOKEN = 'test-turnstile-token'` and rejecting all other tokens with a localized VineJS validation error (`E_VALIDATION_ERROR`).
  - Registered `app.container.swap(TurnstileGateway, () => fakeTurnstile)` in `tests/bootstrap.ts`.
  - Configured a Playwright browser context decorator (`decoratorsCollection.register`) in `tests/bootstrap.ts` to route requests for `challenges.cloudflare.com/turnstile/...` to a lightweight local stub script that mounts hidden `cf-turnstile-response` and `turnstile` inputs and invokes the callback with `TEST_TURNSTILE_TOKEN`.
  - Decorator aborts any other outgoing request to non-localhost hosts, guaranteeing that the browser suite remains 100% offline and isolated.
  - Recorded Decision D62 in `docs/ARCHITECTURE.md`.

#### 4. Single Customer Creation Entry Point for M9 Walk-in History (GUEST-13)

- **Problem**: M9 requires linking previous unlinked walk-in orders sharing the same phone number upon account registration. A single unambiguous entry point is required.
- **Fix**:
  - Verified that `AccountService.createCustomer` is the sole entry point for customer account creation across the codebase.
  - Added documentation comments in `app/services/account_service.ts` noting the M9 walk-in history linking point.
  - Updated `docs/PLAN.md` under M9 (0.9.0) specifying that walk-in order association takes place in `AccountService.createCustomer`.

---

### 2. Verification Results

All checks passed cleanly against PostgreSQL:

| Check                                        | Result                                    | Full Log File                            |
| :------------------------------------------- | :---------------------------------------- | :--------------------------------------- |
| TypeScript Compilation (`npm run typecheck`) | 0 errors                                  | [typecheck-fix2.log](typecheck-fix2.log) |
| ESLint Quality Audit (`npm run lint`)        | 0 errors, 0 warnings                      | [lint-fix2.log](lint-fix2.log)           |
| Complete Test Suite (`npm test`)             | 115 passed (115)                          | [test-fix2.log](test-fix2.log)           |
| Axe Accessibility Audit (WCAG 2.1 AA)        | 0 violations across all 12 audited routes | Verified in browser suite                |
| Viewport 360 px Responsive Layout            | No horizontal scroll                      | Verified in browser suite                |
