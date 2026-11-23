# M4a-fix7 evidence: every role edits its own profile (ACC-6, D108)

Date: 2026-11-23. Commit: 15007e3 (+ uncommitted changes listed in each log header).

## Checklist

| Criterion | Status | Command | Excerpt |
| --- | --- | --- | --- |
| Staff and the owner edit name, phone and password on the customers' Profil components; the owner stays in the staff area when using it | PASS | `node scripts/evidence_run.ts M4a-fix7 profile-and-phone -- node ace test functional --files tests/functional/phone_change.spec.ts --files tests/functional/profile.spec.ts --files tests/functional/account_security.spec.ts` | see below |
| A phone change, for every role, asks the current password (wrong one refused, no code sent), shares the 5-try limit with the password form, then the OTP to the new number, then signs out other devices and returns to the role's Profil | PASS | same run | see below |
| A customer cannot use the staff or owner profile actions | PASS | same run | see below |
| The edit and phone pages at 360/390/1440 for each role, axe clean, no horizontal scroll; staff change their phone end to end in the browser | PASS | `EVIDENCE_MILESTONE=M4a-fix7 node scripts/evidence_run.ts M4a-fix7 browser-profile -- node ace test browser --files tests/browser/account_ui_flow.spec.ts --files tests/browser/account_security_flow.spec.ts` | see below |
| The new tests fail on the old code | PASS (expected failures) | `tests/functional/{phone_change,profile}.spec.ts` copied into a throwaway clone of 15007e3 | see below |
| OWN-10: owner changes a staff member's phone (no OTP, every session ends, logged) | decision recorded | PRD OWN-10, PLAN M10b, D108; built in M10b | – |
| `npm run check` | PASS | `node scripts/evidence_run.ts M4a-fix7 check -- npm run check` | see below |

Excerpt (`tmp/evidence/M4a-fix7/logs/profile-and-phone.log`):

```text
Tests  27 passed (27)
```

Excerpt (`tmp/evidence/M4a-fix7/logs/browser-profile.log`):

```text
Tests  7 passed (7)
```

Excerpt for the new tests on the old code (`tmp/evidence/M4a-fix7/logs/new-tests-on-old-code.log`):

```text
❯ Phone change (CUST-13, ACC-2, ACC-5) / a wrong current password is refused and sends no code (CUST-13, ACC-4, D108)
ℹ AssertionError: expected { …(11) } to contain subset { Object (errors) }
❯ Phone change (CUST-13, ACC-2, ACC-5) / wrong passwords on the phone form and the password form share the 5-try limit (D108)
ℹ AssertionError: expected { …(6) } to contain subset { Object (errors) }
❯ Phone change (CUST-13, ACC-2, ACC-5) / staff and the owner change their phone the same way and return to their Profil (D108)
ℹ Error: Not an Inertia response. Make sure to use "withInertia()" method when making the request
❯ Profile pages (CUST-12, OWN-13, STAFF-16, ACC-4) / staff and the owner edit their name on the same page as customers (OWN-13, STAFF-16, D108)
ℹ Error: Not an Inertia response. Make sure to use "withInertia()" method when making the request
❯ Profile pages (CUST-12, OWN-13, STAFF-16, ACC-4) / a customer cannot use the staff or owner profile actions (D108)
ℹ AssertionError: expected 404 to equal 403
Tests  14 passed, 5 failed (19)
```

Excerpt for the full check (`tmp/evidence/M4a-fix7/logs/check.log`, totals from `check-test.log`):

```text
ok   lint (28s)
ok   typecheck (10s)
ok   test (380s)
Tests  274 passed (274)
```

## Run & view

Restart `npm run dev` (no migration). Sign in as staff or the owner, open Profil → "Ubah": name, the number with "Ganti", and the password form. "Ganti" asks the new number and the current password, sends the code, and after the code returns to that role's Profil with other devices signed out. Customers get the same password field on `/profil/nomor`.

## Screens

Opened 12 of 27 (one or more per page and role); the other 15 are the same pages at the remaining widths, produced and axe-checked by the same test, not opened.

- `/staf/profil/ubah` at 360 px: back link "Profil", "Data diri" (name, number with "Ganti"), "Ubah kata sandi"; the staff tab bar over the full-page capture (`tmp/evidence/M4a-fix7/screenshots/profil-ubah-staf-360.png`)
- `/staf/profil/nomor` at 360 px: the explanation sentence, "Nomor WhatsApp baru", "Kata sandi saat ini", "Kirim Kode" (`tmp/evidence/M4a-fix7/screenshots/profil-nomor-staf-360.png`); at 1440 px in the staff layout (`…/profil-nomor-staf-1440.png`)
- `/admin/profil/ubah` at 360 and 1440 px in the owner layout (`…/profil-ubah-owner-{360,1440}.png`); `/admin/profil/nomor` at 1440 px (`…/profil-nomor-owner-1440.png`)
- `/profil/ubah` at 390 px and `/profil/nomor` at 360 px (customer) with the new password field (`…/profil-ubah-pelanggan-390.png`, `…/profil-nomor-pelanggan-360.png`)
- `/staf/profil`, `/admin/profil` at 360 px and `/admin/profil` at 1440 px: the same cards as customers, now with "Ubah" (below the name on phones); `/profil` at 360 px (`…/profil-{staf,owner,pelanggan}-360.png`, `…/profil-owner-1440.png`)
- not opened: `profil-ubah-{pelanggan-360,pelanggan-1440,staf-390,staf-1440,owner-390}`, `profil-nomor-{pelanggan-390,pelanggan-1440,staf-390,owner-360,owner-390}`, `profil-{pelanggan-390,pelanggan-1440,staf-390,staf-1440,owner-390}`

## How it works

`GET /staf/profil/nomor` → staff middleware → `PhoneChangeController.edit` → page from the route's area (`profileArea`). `POST` → `changePhoneValidator` (phone, currentPassword) → `AccountService.verifyCurrentPassword` (limiter key `password_change_<id>`, shared with `PUT /akun/kata-sandi`) → `OtpService.startPhoneChange` → `/verifikasi` → `OtpController.verify` → `changePhone` in a transaction, `signOutOtherDevices` → the role's Profil (`profileRoute(areaOfRole(role))`).

## Code tour

- `app/helpers/profile_route.ts` (new): area of a request, Profil route per area and per role.
- `app/services/account_service.ts`: `verifyCurrentPassword` extracted from `changePassword`.
- `app/validators/profile_validator.ts`: `currentPassword` on the phone form.
- `app/controllers/profile_controller.ts`, `phone_change_controller.ts`, `otp_controller.ts`; `start/routes.ts` (staff and owner `/ubah`, `PUT`, `/nomor`).
- `inertia/lib/navigation/profile_links.ts`, `inertia/components/organisms/profile_forms.tsx` (new): route map and the shared cards.
- Pages: `customer/profile/{show,edit,phone}.tsx` (now on the shared cards), `staff/profile{,_edit,_phone}.tsx`, `admin/profile{,_edit,_phone}.tsx`.
- Tests: `tests/functional/{phone_change,profile}.spec.ts`, `tests/browser/{account_security_flow,account_ui_flow}.spec.ts`.
- Docs: ACC-6 (new), CUST-12/13, OWN-10/13, STAFF-16, D108, code map row, PLAN M10b and handoff, CHANGELOG.

## Decisions & deviations

- D108. The device count stays on every Profil page (ACC-4).
- The password form moved from the staff and owner Profil page to their "Ubah profil" page, where customers already had it.
- The owner's change of a staff phone is recorded (OWN-10, M10b) and not built.

## Known limitations / deferred

- The owner using the staff area changes their phone there and returns to the owner Profil after the code (the OTP step has no area); harmless.
