# M4a-fix8 evidence: a phone change returns to the Profil it started from

Date: 2026-11-24. Commit: c324c59 (+ uncommitted changes listed in each log header).

## Checklist

| Criterion | Status | Command | Excerpt |
| --- | --- | --- | --- |
| The owner changing their phone in the staff area returns to `/staf/profil`, and "Ganti nomor" on the code page points to the staff form; every other role still returns to its own Profil (D108) | PASS | `node scripts/evidence_run.ts M4a-fix8 phone-change-area -- node ace test functional --files tests/functional/phone_change.spec.ts --files tests/functional/otp.spec.ts --files tests/functional/profile.spec.ts` | see below |
| The new test fails on the old code | PASS (expected failure) | `tests/functional/phone_change.spec.ts` copied into a throwaway clone of c324c59 | see below |
| `npm run check` | PASS | `node scripts/evidence_run.ts M4a-fix8 check -- npm run check` | see below |

Excerpt (`tmp/evidence/M4a-fix8/logs/phone-change-area.log`):

```text
Tests  28 passed (28)
```

Excerpt for the new test on the old code (`tmp/evidence/M4a-fix8/logs/new-test-on-old-code.log`):

```text
❯ Phone change (CUST-13, ACC-2, ACC-5) / the owner changing their phone in the staff area stays in the staff area (D108)
ℹ AssertionError: expected { …(11) } to contain subset { profileArea: 'staff' }
Tests  10 passed, 1 failed (11)
```

Excerpt for the full check (`tmp/evidence/M4a-fix8/logs/check.log`, totals from `check-test.log`):

```text
ok   lint (26s)
ok   typecheck (9s)
ok   test (374s)
Tests  275 passed (275)
```

A first full run failed on one Prettier line in `phone_change_controller.ts` (`check-first-lint-fail.log`); the file was formatted and the run above repeated.

## Run & view

Restart `npm run dev` (no migration). Sign in as the owner, open `/staf/profil` → "Ubah" → "Ganti", enter a new number and the password, and on the code page "Ganti nomor" goes back to `/staf/profil/nomor`; after the code you land on `/staf/profil`.

## Screens

None: no page looks different; only the target of one link and of one redirect changed, both checked by the test.

## How it works

`POST /staf/profil/nomor` → `PhoneChangeController.store` → `OtpService.startPhoneChange(…, profileArea(ctx))` stores the area in the OTP flow in the session → `GET /verifikasi` passes `profileArea` to the page, whose "Ganti nomor" uses `PROFILE_ROUTES[profileArea].phone` → `POST /verifikasi` → after the change, `profileRoute(flow.profileArea)`.

## Code tour

- `app/services/otp_service.ts`: `OtpFlow.profileArea`; `startPhoneChange` takes the area.
- `app/controllers/phone_change_controller.ts`: passes the route's area.
- `app/controllers/otp_controller.ts`: the page prop and the redirect use the flow's area.
- `app/helpers/profile_route.ts`: `areaOfRole` removed (no caller left).
- `inertia/pages/auth/otp.tsx`: "Ganti nomor" for a phone change goes to that area's form.
- `tests/functional/phone_change.spec.ts`: the new test.
- Docs: D108 sentence, PLAN status and handoff, CHANGELOG.

## Decisions & deviations

- Found while fixing: "Ganti nomor" on the code page always pointed to the customers' phone form, which staff and the owner cannot open. Same cause (the OTP step has no area), same fix.
- A phone change started before this change has no stored area and would return to the customer Profil; only possible for a code requested before the restart.

## Known limitations / deferred

- None new.
