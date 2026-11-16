# Checkpoint M2b-fix Evidence

Date: 2026-11-16. Checkpoint **M2b-fix** (review fixes for M2b, accounts, v0.2.0).

This checkpoint resolves all 5 security and architectural review findings from checkpoint M2b without starting M2c.

---

## 1. Resolved Review Findings

### 1. ACC-5 Session Tagging for Normal Sign-ins & Remember-Me
- **Problem**: `signOutOtherDevices` relies on the database session tag (`user_id`), but previously only OTP verification and password reset flows called `session.tag()`. Standard sign-in routes (`/masuk`, `/staf/masuk`) and sessions restored from remember-me cookies never tagged the session, allowing existing active sessions to stay signed in after a password reset.
- **Fix**: Centralized session tagging in `app/middleware/silent_auth_middleware.ts`. Whenever `ctx.auth.user` is resolved, `ctx.session.tag([String(ctx.auth.user.id)])` is executed. When a session is logged out or unauthenticated, it is untagged. Removed duplicate controller-level calls.
- **Test Rewrite**: Rewrote the ACC-5 test in `tests/functional/password_reset.spec.ts` to use real sign-ins:
  1. Client 1 signs in via `/masuk` with `rememberMe: true`.
  2. Client 2 signs in via `/masuk` with `rememberMe: true`.
  3. Both clients successfully access `/beranda` (HTTP 200).
  4. Client 3 executes the complete password reset flow via real routes (`/lupa-kata-sandi` → `/verifikasi` → `/kata-sandi-baru`).
  5. Client 1 and Client 2 attempt to access `/beranda` and both receive HTTP 302 redirects to `/masuk`.
  6. All `remember_me_tokens` for the user are verified deleted from the database. Zero manual session row insertions.

### 2. Database Session Store in Tests
- **Problem**: `.env.test` previously set `SESSION_DRIVER=memory`, bypassing tests for pending sign-up data persistence in the database store (`shared.md` §12) and database session tagging.
- **Fix**: Configured `SESSION_DRIVER=database` in `.env.test`. In `tests/bootstrap.ts`, patched Japa's `SessionClient.prototype.destroy` to prevent teardown hooks from destroying server-persisted database sessions between chained client requests, and introduced the `withAuthCookiesFrom(response)` helper macro on `ApiRequest` to seamlessly propagate authenticated session and encrypted remember-me cookies. All 111 tests run against PostgreSQL with the database session store.

### 3. Elimination of Swallowed Exceptions
- **Problem**: `signOutOtherDevices` wrapped session table deletions in an empty `catch {}` block, which could allow a reset to claim success while other devices remained signed in if the query failed.
- **Fix**: Removed the `try/catch` wrapper in `app/services/account_service.ts`. Session invalidation failures now properly propagate. Verified no other empty or swallowing catch blocks exist across the codebase (CONVENTIONS §11).

### 4. Separation of Production Code and Test Code
- **Problem**: `app/services/whatsapp_service.ts` contained a static `#dispatched` array that accumulated every sent message (including OTPs) in production memory indefinitely, along with test helper methods (`getLatestOtpCode`, `clearDispatched`, etc.).
- **Fix**: Removed all static arrays and test helpers from `WhatsAppService`. Created `FakeWhatsAppService` in `tests/helpers/fake_whatsapp_service.ts` and bound it in `tests/bootstrap.ts` via `app.container.swap(WhatsAppService, () => fakeWhatsApp)`. Unit, functional, and browser tests now read dispatched OTPs from `fakeWhatsApp`, keeping production code completely free of test instrumentation.

### 5. Privacy & Log Protection (ACC-1, ACC-2)
- **Problem**: WhatsApp messages logged in non-development environments could expose OTP codes or unmasked phone numbers.
- **Fix**:
  - All log statements with phone numbers use `maskPhone` (e.g. `62812****5432`).
  - In `WhatsAppService`, full message text is only logged when `NODE_ENV === 'development'`. In all other environments (test, staging, production), it logs only `{ phone: maskedPhone, kind: 'otp' }`, never the text or raw digits.
  - Added unit tests in `tests/unit/whatsapp_service.spec.ts` and `tests/unit/otp_service.spec.ts` asserting that outside development, OTP codes and unmasked phone numbers are never emitted to logs.
  - Recorded as Decision D60 in `docs/ARCHITECTURE.md`.

---

## 2. Test & Quality Verification

All verification commands executed cleanly on PostgreSQL:

| Check | Result | Evidence File |
| :--- | :--- | :--- |
| TypeScript Typecheck | 0 errors | `docs/evidence/M2b/typecheck-fix.log` |
| ESLint Audit | 0 errors, 0 warnings | `docs/evidence/M2b/lint-fix.log` |
| Japa Test Suite | 111 passed (111) | `docs/evidence/M2b/test-fix.log` |
| Axe Accessibility (WCAG 2.1 AA) | 0 violations | Verified in test suite |
| Viewport 360 px Responsive Layout | No horizontal scroll | Verified in test suite |
