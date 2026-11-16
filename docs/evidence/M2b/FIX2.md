# M2b-fix2 Checkpoint Evidence: Test Infrastructure Clean-up & Turnstile Isolation

Date: 2026-11-16. Checkpoint **M2b-fix2** (clean-up of test bootstrap, library unpatching, official test helpers, Turnstile container swap and browser decorator, and walk-in linkage preparation for M9).

---

## 1. Resolved Review Items

### 1. Don't Patch Libraries (ACC-5 Multi-Device Browser Test)
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

### 2. Adoption of Official Test Helpers
- **Problem**: `tests/bootstrap.ts` had custom macros (`assertValidationError`, `assertHasValidationError`, `assertValidationErrors`) with incorrect inversion logic and untyped signatures.
- **Fix**:
  - Removed all custom validation assertion macros.
  - Integrated `@adonisjs/session`'s official `assertValidationError` and `assertFlashMessage`.
  - Updated `app/exceptions/handler.ts` (`renderValidationErrorAsHTML`) so that VineJS validation errors are flashed to both `inputErrorsBag` (for Inertia) and `errors` (for `@adonisjs/session`'s official test assertion helper), resolving the assertion gap natively without library patching.
  - Registered `@adonisjs/inertia`'s official `inertiaApiClient(app)` in `tests/bootstrap.ts`.
  - Replaced manual JSON/HTML inspection with `assertInertiaComponent` and `assertInertiaPropsContains` across all functional test suites (`auth.spec.ts`, `registration.spec.ts`, `otp.spec.ts`, `password_reset.spec.ts`).

### 3. Server & Browser Turnstile Isolation (No Bypass)
- **Problem**: Tests previously relied on disabling Turnstile verification (`if (env.get('NODE_ENV') === 'test') return true`), leaving controller verification pathways untested.
- **Fix**:
  - Removed the `NODE_ENV === 'test'` early exit from `TurnstileGateway.ts`. Kept `TURNSTILE_ENABLED` solely for optional local offline development without keys.
  - Created `FakeTurnstileGateway` (`tests/helpers/fake_turnstile_gateway.ts`) accepting `TEST_TURNSTILE_TOKEN = 'test-turnstile-token'` and rejecting all other tokens with a localized VineJS validation error (`E_VALIDATION_ERROR`).
  - Registered `app.container.swap(TurnstileGateway, () => fakeTurnstile)` in `tests/bootstrap.ts`.
  - Configured a Playwright browser context decorator (`decoratorsCollection.register`) in `tests/bootstrap.ts` to route requests for `challenges.cloudflare.com/turnstile/...` to a lightweight local stub script that mounts hidden `cf-turnstile-response` and `turnstile` inputs and invokes the callback with `TEST_TURNSTILE_TOKEN`.
  - Decorator aborts any other outgoing request to non-localhost hosts, guaranteeing that the browser suite remains 100% offline and isolated.
  - Recorded Decision D62 in `docs/ARCHITECTURE.md`.

### 4. Single Customer Creation Entry Point for M9 Walk-in History (GUEST-13)
- **Problem**: M9 requires linking previous unlinked walk-in orders sharing the same phone number upon account registration. A single unambiguous entry point is required.
- **Fix**:
  - Verified that `AccountService.createCustomer` is the sole entry point for customer account creation across the codebase.
  - Added documentation comments in `app/services/account_service.ts` noting the M9 walk-in history linking point.
  - Updated `docs/PLAN.md` under M9 (0.9.0) specifying that walk-in order association takes place in `AccountService.createCustomer`.

---

## 2. Verification Results

All checks passed cleanly against PostgreSQL:

| Check | Result | Full Log File |
| :--- | :--- | :--- |
| TypeScript Compilation (`npm run typecheck`) | 0 errors | [typecheck-fix2.log](file:///home/r3p/Projects/someshit/umimaclean/docs/evidence/M2b/typecheck-fix2.log) |
| ESLint Quality Audit (`npm run lint`) | 0 errors, 0 warnings | [lint-fix2.log](file:///home/r3p/Projects/someshit/umimaclean/docs/evidence/M2b/lint-fix2.log) |
| Complete Test Suite (`npm test`) | 115 passed (115) | [test-fix2.log](file:///home/r3p/Projects/someshit/umimaclean/docs/evidence/M2b/test-fix2.log) |
| Axe Accessibility Audit (WCAG 2.1 AA) | 0 violations across all 12 audited routes | Verified in browser suite |
| Viewport 360 px Responsive Layout | No horizontal scroll | Verified in browser suite |
