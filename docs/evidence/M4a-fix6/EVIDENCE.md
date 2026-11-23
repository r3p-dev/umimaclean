# M4a-fix6 evidence: one "Keluar", long names on the Profil card

Date: 2026-11-23. Commit: db88583 (+ uncommitted changes listed in each log header).

## What existed before this stop

- `POST /akun/keluar-perangkat-lain` (`AccountSecurityController.signOutOtherDevices`) and its "Keluar dari perangkat lain" button in the devices card of every Profil page, with one functional test, a guest test and a browser test step.
- `AccountService.signOutOtherDevices` used by that button and by a password change, a password reset and a phone change (ACC-5). A password change already had a test that other devices end; the reset journey test did not check it.
- The Profil identity card cut a long name with `truncate` next to "Ubah" (customer only).

## Checklist

| Criterion | Status | Command | Excerpt |
| --- | --- | --- | --- |
| No "Keluar dari perangkat lain" button or route (404 now); a password reset and a password change still end the other devices, remembered sign-ins included (ACC-4, ACC-5, D107) | PASS | `node scripts/evidence_run.ts M4a-fix6 reset-and-sign-out -- node ace test functional --files tests/functional/account_security.spec.ts --files tests/functional/password_reset.spec.ts` | see below |
| A long name wraps on the Profil card: whole name shown, at least 150 px wide, never under "Ubah" (which drops below the name on phones); every role, 360/390/1440, axe clean | PASS | `EVIDENCE_MILESTONE=M4a-fix6 node scripts/evidence_run.ts M4a-fix6 browser-profile -- node ace test browser --files tests/browser/account_ui_flow.spec.ts --files tests/browser/account_security_flow.spec.ts` | see below |
| `npm run check` | PASS | `node scripts/evidence_run.ts M4a-fix6 check -- npm run check` | see below |

Excerpt for the sign-out tests (`tmp/evidence/M4a-fix6/logs/reset-and-sign-out.log`):

```text
Tests  14 passed (14)
```

The reset journey test now creates two remembered sign-ins before the reset and asserts `assert.lengthOf(await User.rememberMeTokens.all(user), 0)` after it; the new test posts to `/akun/keluar-perangkat-lain` as a staff user and expects 404.

Excerpt for the browser run (`tmp/evidence/M4a-fix6/logs/browser-profile.log`, `tmp/evidence/M4a-fix6/screenshots/profil-screenshots.log`):

```text
Tests  5 passed (5)
profil-pelanggan-360: scrollWidth=360 axe=none
profil-pelanggan-390: scrollWidth=390 axe=none
profil-pelanggan-1440: scrollWidth=1440 axe=none
```

The 150 px width assertion was added after this run, once the screenshots showed that the overlap check alone missed a squeezed name; it ran in the full check below (and alone: `Tests  3 passed (3)`, not logged through the runner). The earlier runs are kept as `browser-profile-first.log` and `browser-profile-second.log`.

Excerpt for the full check (`tmp/evidence/M4a-fix6/logs/check.log`, totals from `check-test.log`):

```text
ok   lint (30s)
ok   typecheck (9s)
ok   test (346s)
Tests  267 passed (267)
```

The new assertions were not run against the old code (NOT RUN): on it, `/akun/keluar-perangkat-lain` answers 302, and the truncated name fails the "whole name shown" check.

## Screens

All 9 opened (seeded names made longer by the test: "… Kusumawardhani Wijayakusuma").

- `/profil` at 360/390 px: name on three lines beside the initials, the phone under it, "Ubah" below aligned with the name; the devices card has only its sentence; "Akun" card with "Keluar" (`tmp/evidence/M4a-fix6/screenshots/profil-pelanggan-{360,390}.png`)
- `/profil` at 1440 px: name on two lines, "Ubah" on the right (`tmp/evidence/M4a-fix6/screenshots/profil-pelanggan-1440.png`)
- `/staf/profil` and `/admin/profil` at 360/390/1440 px: the name wraps (no "Ubah" for these roles), the devices card without a button, the password form, "Akun" last; the staff tab bar is drawn over the middle of the phone full-page captures (`tmp/evidence/M4a-fix6/screenshots/profil-{staf,owner}-{360,390,1440}.png`)

Superseded after opening and deleted: a first set where "Ubah" stayed beside the name at 360 px and "Kusumawardhani" broke inside the word, and a second where the name was squeezed to one syllable per line (a `flex-1` item with no basis never lets "Ubah" wrap). Their logs: `profil-screenshots-first.log`, `profil-screenshots-second.log`.

## Code tour

- `start/routes.ts`, `app/controllers/account_security_controller.ts`: route and action removed (`.adonisjs/` registry regenerated).
- `inertia/components/organisms/account_security.tsx`: `ActiveDevicesCard` shows the count only; `AccountIdentityCard` wraps the name and puts its action below on phones.
- Tests: `tests/functional/account_security.spec.ts`, `tests/functional/password_reset.spec.ts`, `tests/browser/account_security_flow.spec.ts`, `tests/browser/account_ui_flow.spec.ts`.
- Docs: ACC-4 (`docs/PRD/shared.md`), D67 note and D107 item 8 (`docs/ARCHITECTURE.md`), CHANGELOG, PLAN handoff (with the item 3 proposal).

## Decisions & deviations

- The device count stays (ACC-4 still lists it); only the button and its route go.
- `AccountService.signOutOtherDevices` stays: a reset, a password change and a phone change use it.

## Known limitations / deferred

- Item 3 (owner and staff edit their own name and phone; owner changes a staff phone) waits for the owner's go-ahead.
