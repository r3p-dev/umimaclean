# M3b process checkpoint: slimmer agent workflow

Date: 2026-11-17. Commit: 103d602 (v0.3.2) plus the uncommitted changes listed in each log header. A process checkpoint between M3b and M4a: process documents, tooling and evidence housekeeping only. No server, frontend, database or seeder behavior changed; the only test code touched is the screenshot helper (`tests/helpers/screenshots.ts`).

## Checklist

Logs are in the git-ignored `tmp/evidence/M3b-process/logs/` on the machine that ran them. The excerpts below are exact lines from them; the only edit is that ANSI colour codes written by the test runner were removed.

| Criterion | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| 1. `npm run check` passes with short output | PASS | `node scripts/evidence_run.ts M3b-process 1-check -- npm run check` | below |
| 1. A deliberate lint error fails `npm run check` and prints the relevant tail; the file is restored | PASS | `… 1b-check-lint-error -- npm run check`, then `… 1c-diff-after-restore -- git diff --exit-code --stat -- app/helpers/money.ts` | below |
| 2. Evidence runner: a command that exits 1 gives FAIL and a non-zero exit | PASS | `… 2a-runner-negative -- sh -c '…evidence_run.ts … -- false; echo …'` | below |
| 2. check_commits fails on a missing path, on AI attribution, and on an image added under docs/evidence | PASS | `… 2b-…`, `… 2c-…`, `… 2f-…`, `… 2e-… -- sh -c 'node scripts/check_commits.ts <plan>; echo …'` | below |
| 3. Evidence screenshots and axe logs land in `tmp/evidence/M3b-process/screenshots/`, nothing under docs/evidence; a second run fails on the existing file; plain `npm test` writes no evidence | PASS | `… 3a-… -- env EVIDENCE_MILESTONE=M3b-process node ace test browser --files=tests/browser/landing_pricing.spec.ts` (3c: settings_flow.spec.ts; 3d: rerun; 3e: `npm test`) | below |
| 4. Decisions log list matches the old table word for word, per D-number; every other table cell unchanged | PASS | `… 4-integrity -- python3 -I <throwaway script>` (not committed) | below |
| 5. `npm run format` does not change the converted docs again | PASS | `… 5c-format-stable -- sh -c 'git diff > a && npm run format > /dev/null && git diff > b && cmp a b && …'` | below |
| 6. `git ls-files docs/evidence` shows only markdown files | FAIL | `… 6-evidence-files -- sh -c '…'` | below: 7 files that are neither logs nor images are kept until the owner decides (Known limitations) |
| 7. Every rule of the old AGENTS.md has a place | decision recorded | – | Rule mapping below |
| 8. Before and after numbers | PASS | `… 8-numbers -- bash <throwaway script>` | below |
| 9. check_commits passes on the suggested commits | PASS | `… 9-check-commits -- node scripts/check_commits.ts tmp/evidence/M3b-process/commits.plan --print-fish` | below |

Criterion 6 is measured on the working tree: the deletions are not committed yet, so the excerpt lists the tracked paths that still exist. After the owner's commits, `git ls-files docs/evidence` gives the same list.

**1. npm run check, final state** (`tmp/evidence/M3b-process/logs/1-check.log`):

```text


> umimaclean@0.3.2 check
> node scripts/check.ts

ok   lint (19s)
ok   typecheck (9s)
ok   test (205s)

exit 0
```

**1. Negative control: deliberate lint error in `app/helpers/money.ts`** (`tmp/evidence/M3b-process/logs/1b-check-lint-error.log`):

```text
FAIL lint (21s, exit 1)
```

**1. File restored: `git diff --exit-code --stat -- app/helpers/money.ts` prints nothing** (`tmp/evidence/M3b-process/logs/1c-diff-after-restore.log`):

```text


exit 0
```

**2. Evidence runner, command exits 1** (the inner run prints its log tail; its header lines starting with `#` are left out here) (`tmp/evidence/M3b-process/logs/2a-runner-negative.log`):

```text

FAIL exit=1 log=tmp/evidence/M3b-process/logs/2a-inner-false.log


exit 1
runner exit code: 1

exit 0
```

**2. check_commits, plan missing `docs/SETUP.md`** (`tmp/evidence/M3b-process/logs/2b-commits-missing-path.log`):

```text

FAIL 1 problem(s) in tmp/evidence/M3b-process/neg-missing-path.plan:
- docs/SETUP.md: changed but in no commit
check_commits exit code: 1

exit 0
```

**2. check_commits, AI attribution in a subject** (`tmp/evidence/M3b-process/logs/2c-commits-attribution.log`):

```text

FAIL 1 problem(s) in tmp/evidence/M3b-process/neg-attribution.plan:
- commit 1 "chore: deny git in settings (Generated with Claude)": AI attribution in "chore: deny git in settings (Generated with Claude)"
check_commits exit code: 1

exit 0
```

**2. check_commits, plan adds `docs/evidence/M3b/probe.png`** (`tmp/evidence/M3b-process/logs/2f-commits-png-alone.log`):

```text

.gitignore:33:docs/evidence/**/*.png	docs/evidence/M3b/probe.png
FAIL 1 problem(s) in tmp/evidence/M3b-process/neg-png.plan:
- commit 11 "docs(evidence): add a screenshot": docs/evidence/M3b/probe.png matches no changed path
check_commits exit code: 1

exit 0
```

**2. check_commits, plan adds `docs/evidence/M3b/probe.jpg` (an image extension not in .gitignore)** (`tmp/evidence/M3b-process/logs/2e-commits-jpg.log`):

```text

FAIL 1 problem(s) in tmp/evidence/M3b-process/neg-jpg.plan:
- docs/evidence/M3b/probe.jpg: image under docs/evidence must not be added or modified
check_commits exit code: 1

exit 0
```

**3. Browser test with `EVIDENCE_MILESTONE=M3b-process`** (landing_pricing.spec.ts) (`tmp/evidence/M3b-process/logs/3a-browser-evidence.log`):

```text
 PASSED 

Tests  2 passed (2)
 Time  15s

exit 0
```

**3. Where the files landed** (`tmp/evidence/M3b-process/logs/3b-evidence-files.log`):

```text

tmp/evidence/M3b-process/screenshots/harga-mulai-dari-sepatu-1440.png
tmp/evidence/M3b-process/screenshots/harga-mulai-dari-sepatu-360.png
tmp/evidence/M3b-process/screenshots/harga-mulai-dari-sepatu-390.png
tmp/evidence/M3b-process/screenshots/harga-mulai-dari-sepatu-screenshots.log
tmp/evidence/M3b-process/screenshots/harga-tanpa-mulai-dari-helm-1440.png
tmp/evidence/M3b-process/screenshots/harga-tanpa-mulai-dari-helm-360.png
tmp/evidence/M3b-process/screenshots/harga-tanpa-mulai-dari-helm-390.png
tmp/evidence/M3b-process/screenshots/harga-tanpa-mulai-dari-helm-screenshots.log
-- untracked or modified under docs/evidence (deletions excluded):
?? docs/evidence/README.md
?? docs/evidence/TEMPLATE.md

exit 0
```

**3. Axe log run** (settings_flow.spec.ts, writes `screenshots-axe.log`) (`tmp/evidence/M3b-process/logs/3c-browser-evidence-axe.log`):

```text
 PASSED 

Tests  1 passed (1)
 Time  49s

exit 0
```

**3. Same browser test again: fails on the existing file** (`tmp/evidence/M3b-process/logs/3d-browser-evidence-rerun.log`):

```text
ℹ Error: EEXIST: file already exists, copyfile '/home/r3p/Projects/someshit/umimaclean/tmp/screenshots/harga-mulai-dari-sepatu-360.png' -> '/home/r3p/Projects/someshit/umimaclean/tmp/evidence/M3b-process/screenshots/harga-mulai-dari-sepatu-360.png'
ℹ Error: EEXIST: file already exists, copyfile '/home/r3p/Projects/someshit/umimaclean/tmp/screenshots/harga-tanpa-mulai-dari-helm-360.png' -> '/home/r3p/Projects/someshit/umimaclean/tmp/evidence/M3b-process/screenshots/harga-tanpa-mulai-dari-helm-360.png'
 FAILED 
Tests  2 failed (2)
exit 1
```

**3. Plain `npm test`** (`tmp/evidence/M3b-process/logs/3e-plain-npm-test.log`):

```text
 PASSED 

Tests  215 passed (215)
 Time  3m

exit 0
```

**3. Nothing written by the plain run** (file list with modification times before and after) (`tmp/evidence/M3b-process/logs/3f-no-evidence-written.log`):

```text

no file under tmp/evidence/M3b-process/screenshots or docs/evidence was added or changed by npm test

exit 0
```

**4. Decisions log and table integrity** (lines for earlier evidence files left out; each says "every cell identical") (`tmp/evidence/M3b-process/logs/4-integrity.log`):

```text
Decisions log: 83 old entries, 86 new entries
  identical: 82; with allowed changes: 3; mismatches: 0
  allowed: D76 field decision: 'Superseded by D84. ' (was '')
  allowed: D77 field why: 'hausdorff.log: removed 2026-11-17, see git history before this change' (was '`docs/evidence/M3-0.3.1/hausdorff.log`')
  allowed: D77: 10 extra lines appended (first: '- **Result** (exact lines from the removed hausdorff.log):')
  new entries: D84, D85, D86
docs/ARCHITECTURE.md: 11 tables, every cell identical
docs/CONVENTIONS.md: 0 tables, every cell identical
docs/DEPENDENCIES.md: 6 tables, every cell identical
docs/PLAN.md: 1 tables, every cell identical (Confirmed column removed before comparing)
docs/PRD/customer.md: 1 tables, every cell identical
docs/PRD/guest.md: 1 tables, every cell identical
docs/PRD/owner.md: 1 tables, every cell identical
docs/PRD/shared.md: 6 tables, every cell identical
docs/PRD/staff.md: 1 tables, every cell identical
docs/PRD/summary.md: 3 tables, every cell identical
docs/SETUP.md: 0 tables, every cell identical
other tables compared: 73
exit 0
```

**5. Formatting is stable** (`tmp/evidence/M3b-process/logs/5c-format-stable.log`):

```text

npm run format changed nothing more
 8 files changed, 641 insertions(+), 379 deletions(-)

exit 0
```

**6. Files left under docs/evidence** (`tmp/evidence/M3b-process/logs/6-evidence-files.log`):

```text
tracked paths under docs/evidence that still exist, by extension:
      3 diff
      1 geojson
     20 md
      1 py
      1 sh
      1 sql
non-markdown among them:
docs/evidence/M3-0.3.1/hausdorff.sql
docs/evidence/M3-0.3.1/shadcn-tabs.diff
docs/evidence/M3-0.3.2/clip_polygon.geojson
docs/evidence/M3-0.3.2/geojson_to_sql.py
docs/evidence/M3-0.3.2/measure_osm_import.sh
docs/evidence/M3a-fix/shadcn-dialog.diff
docs/evidence/M3a-fix/shadcn-switch.diff
deleted (unstaged), by extension:
    112 log
    271 png
exit 0
```

**8. Before and after: reading set and documents** (`tmp/evidence/M3b-process/logs/8-numbers.log`):

```text
== Session-start reading set (bytes)
before: AGENTS.md + CLAUDE.md + every docs/ and docs/PRD/ document = 321932; + every docs/evidence/*/EVIDENCE.md = 147240; total 469172
after: AGENTS.md 8766 + CLAUDE.md 11 + docs/PLAN.md up to the Active milestone section's end 7890 = 16667
== docs/ markdown (bytes, before -> after)
docs/ARCHITECTURE.md 174409 -> 88971
docs/CONVENTIONS.md 18056 -> 18056
docs/DEPENDENCIES.md 31089 -> 13440
docs/PLAN.md 30885 -> 34905
docs/PRD/customer.md 4768 -> 4768
docs/PRD/guest.md 4607 -> 4607
docs/PRD/owner.md 5732 -> 4992
docs/PRD/shared.md 21452 -> 17223
docs/PRD/staff.md 6862 -> 6324
docs/PRD/summary.md 7468 -> 4306
docs/SETUP.md 8055 -> 9052
decisions log section (ARCHITECTURE §7): 107092 -> 47397
```

**8. Before and after: tracked files under docs/evidence** (`tmp/evidence/M3b-process/logs/8-numbers.log`):

```text
== tracked files under docs/evidence by extension, before (HEAD) -> after (still existing or new, not ignored)
before diff 3 files 18153 bytes
before geojson 1 files 21155 bytes
before log 112 files 551223 bytes
before md 20 files 187243 bytes
before png 271 files 39547701 bytes
before py 1 files 739 bytes
before sh 1 files 6443 bytes
before sql 1 files 2173 bytes
after diff 3 files 18153 bytes
after geojson 1 files 21155 bytes
after md 22 files 189861 bytes
after py 1 files 739 bytes
after sh 1 files 6443 bytes
after sql 1 files 2173 bytes

exit 0
```

**9. check_commits on the suggested commits** (fish commands cut from this excerpt; full output in the log) (`tmp/evidence/M3b-process/logs/9-check-commits.log`):

```text

PASS 10 commits cover 404 changed paths

exit 0
```

## Rule mapping

Every rule of the old `AGENTS.md` (v0.3.2), item by item, and where it lives now. "Changed" marks a rule whose mechanism this checkpoint changed; the goal of the rule is kept.

| Old rule | Now |
| --- | --- |
| Intro: what Umima.Clean is, built one milestone at a time from written specs | AGENTS.md intro |
| Intro: no application code until the active milestone is defined in PLAN | AGENTS.md intro |
| Intro: code easy to read and explain; clarity beats cleverness; works but unexplainable is not done | AGENTS.md intro |
| §1 Read every document at the start of every session | Changed: AGENTS.md "Session start" (always / when needed / not routinely) |
| §1 Table: what each document defines | AGENTS.md "Session start" (what to read for what); the documents themselves |
| §1 Table: who writes each document | AGENTS.md "Session start", last bullet |
| §1 PRD wins on behavior, ARCHITECTURE §1 on technology, CONVENTIONS on style; report conflicts | AGENTS.md "Session start" |
| §1 Visual design and anything left open: ask the owner, who points to the reference | AGENTS.md "Session start" |
| §1 Current stable versions and official docs, no deprecated APIs, pin container images | AGENTS.md "Session start" (tag and digest per D2); CONVENTIONS §12 |
| §2.1 Align: read PLAN and every evidence file to find the active milestone | Changed: AGENTS.md "Milestone loop" 1 (PLAN status table and Active milestone; the Confirmed column) |
| §2.1 Previous milestone not confirmed: stop and ask | AGENTS.md "Milestone loop" 1 |
| §2.2 Follow CONVENTIONS; unit, functional (happy path, authorization, PRD rule by ID) and browser tests | AGENTS.md "Milestone loop" 3 |
| §2.2 lint, typecheck and tests pass with no deprecation warnings | AGENTS.md "Milestone loop" 3 (`npm run check` runs all three); CONVENTIONS §12 |
| §2.3 Update ARCHITECTURE §2+ on routes, modules, schema, state machines, decisions | AGENTS.md "Milestone loop" 5 |
| §2.3 Every workaround: short code comment and decisions-log entry | AGENTS.md "Milestone loop" 5; CONVENTIONS §0 rule 1 |
| §2.3 DEPENDENCIES for every package or image; PLAN status | AGENTS.md "Milestone loop" 5 |
| §2.4 Seed data (owner, two staff, customers with addresses, price list, areas, orders in every status); seeder prints demo accounts | AGENTS.md "Milestone loop" 5 |
| §2.5 Not done until EVIDENCE.md exists | AGENTS.md "Evidence", first line |
| §2.5 EVIDENCE.md holds the content of the report | Changed: AGENTS.md "Report" (details only in EVIDENCE.md), `docs/evidence/TEMPLATE.md` |
| §2.5 Screenshots and logs in the same folder | Changed: `tmp/evidence/<milestone>/`, never committed (AGENTS.md "Evidence", D84 superseding D76) |
| §2.5 Known limitations and deferred items | AGENTS.md "Evidence"; TEMPLATE "Known limitations / deferred" |
| §2.6 Report and stop, wait for confirmation | AGENTS.md "Milestone loop" 6 |
| §3 Slow, reviewable progress; one sitting | AGENTS.md "Milestone loop", intro |
| §3 Stop after every milestone; split into checkpoints and stop at each | AGENTS.md "Milestone loop", intro |
| §4 Report in Indonesian, short and concrete | AGENTS.md "Report" |
| §4.1 Ringkasan with requirement IDs | AGENTS.md "Report" 1 |
| §4.2 Cara menjalankan dan melihat | Changed: EVIDENCE.md only (AGENTS.md "Report"; TEMPLATE "Run & view") |
| §4.3 Tampilan: desktop and mobile screenshots of every new or changed page, linked | Changed: one-line descriptions with local `tmp/evidence/…` paths (AGENTS.md "Evidence"; TEMPLATE "Screens") |
| §4.4 Cara kerja: click to database and back, with a sequence | Changed: EVIDENCE.md only (TEMPLATE "How it works") |
| §4.5 Tur kode in reading order | Changed: EVIDENCE.md only (TEMPLATE "Code tour") |
| §4.6 Keputusan dan penyimpangan, every workaround with its reason | Changed: EVIDENCE.md only (TEMPLATE "Decisions & deviations") |
| §4.7 Bukti: exact commands and real, unedited output | Changed: evidence runner logs plus exact excerpts (AGENTS.md "Evidence"; TEMPLATE checklist) |
| §4.8 Pertanyaan terbuka, suggested commits, next milestone | AGENTS.md "Report" 3–5 |
| §5 Ask before hard-to-reverse or contradicting decisions; otherwise decide and record in §7 | AGENTS.md "Milestone loop" 4 |
| §5 Never claim something works without running it | AGENTS.md "Evidence", first bullet |
| §5 Can't run it: say so and give the exact commands | AGENTS.md "Evidence" (`NOT RUN` with commands) |
| §5 No real outside services from tests; Midtrans sandbox; Fonnte log driver, real message only when asked | AGENTS.md "Never"; CONVENTIONS §0 rule 4 |
| §5 No production systems, no real customer data | AGENTS.md "Never"; `.claude/settings.json` denies `ssh server` |
| §5 Never edit `database/schema.ts` by hand | AGENTS.md "Never" |
| §6 SemVer, version in package.json, Keep a Changelog | AGENTS.md "Versioning" |
| §6 Before 1.0.0: minor per milestone, patch for review fixes | AGENTS.md "Versioning" |
| §6 1.0.0 = approved PLAN plus hardening | AGENTS.md "Versioning" |
| §6 After 1.0.0, and what "breaking" means | AGENTS.md "Versioning" |
| §6 Agent suggests bump and tag command; owner creates tags | AGENTS.md "Versioning" |
| §7 No commit, push, tag, rebase, reset, stash, branches, `git add`; read-only git is fine | AGENTS.md "Never"; `.claude/settings.json` deny rules |
| §7 Suggested commits at the end of every milestone and natural checkpoints, small and ordered | AGENTS.md "Git" |
| §7 Conventional Commits, subject ≤ 72, imperative, scope, body explains why | AGENTS.md "Git"; `scripts/check_commits.ts` checks format and length |
| §7 Exact paths per commit | AGENTS.md "Git" |
| §7 Fish command per commit, no heredocs or `$'…'` | AGENTS.md "Git"; `check_commits.ts --print-fish` |
| §7 Last commit is the version bump, then the tag command | AGENTS.md "Git" |
| §7 Every path in exactly one commit | AGENTS.md "Git"; `check_commits.ts` |
| §7 Run `git status --short` at the end and confirm | Duplicate of the previous row, now done by `check_commits.ts` (AGENTS.md "Git", last bullet) |
| §7 No AI attribution | AGENTS.md "Never"; `check_commits.ts` |
| §7 No secrets, `.env`, map data, uploads, dumps in a commit | AGENTS.md "Never" (now also logs and screenshots); `check_commits.ts` forbidden files |
| §7 Keep `.gitignore` current and mention every change | AGENTS.md "Git" |

## Run & view

```sh
npm run check                                  # one line per step
VERBOSE=1 npm run check                        # full output
node scripts/evidence_run.ts M4a lint -- npm run lint
node scripts/check_commits.ts tmp/<plan> --print-fish
```

`AGENTS.md`, the Active milestone section of `docs/PLAN.md`, the decisions log and code map in `docs/ARCHITECTURE.md`, `docs/evidence/README.md` and `docs/evidence/TEMPLATE.md` are the documents to read.

## Screens

No page changed. Criterion 3 wrote 30 files (screenshots of the landing price list and the owner settings pages, and their logs) only to prove where they land; they were not opened, and they were deleted afterwards.

## How it works

- `scripts/evidence_run.ts`: checks the milestone and name are plain names, refuses an existing log, writes the header (`git rev-parse`, `git status --short`), starts the command without a shell with stdout and stderr going to the log, appends `exit <n>`, prints one line (plus the tail on failure) and exits with the command's code.
- `scripts/check.ts`: runs `npm run lint`, `npm run typecheck`, `node ace test --reporters=dot` in order, each into `tmp/check/<step>.log`; stops at the first failure and prints its tail.
- `scripts/check_commits.ts`: parses the plan, reads `git status --porcelain=v1 -z --untracked-files=all`, matches pathspecs like git (folder prefix, `*` across `/`), then checks coverage, subjects, attribution and forbidden files.
- `tests/helpers/screenshots.ts`: unchanged for a plain run; with `EVIDENCE_MILESTONE` it copies each file to `tmp/evidence/<milestone>/screenshots/` with `COPYFILE_EXCL`.

## Code tour

1. `AGENTS.md`: the rules, in the order a session needs them.
2. `docs/PLAN.md`: Confirmed column, evidence list, Active milestone with handoff.
3. `docs/evidence/README.md`, `docs/evidence/TEMPLATE.md`: where evidence lives and its shape.
4. `scripts/evidence_run.ts`, `scripts/check.ts`, `scripts/check_commits.ts`, `package.json` (`check`).
5. `tests/helpers/screenshots.ts`, `docs/SETUP.md` §3.
6. `prettier.config.js`, `.prettierignore`, `.gitignore`.
7. `docs/ARCHITECTURE.md`: code map (§3), decisions log as a list, D84–D86.
8. `.claude/settings.json`: deny rules for one agent tool; AGENTS.md stays the source of truth.

## Decisions & deviations

- D84 (supersedes D76): artifacts only in `tmp/evidence/`; `EVIDENCE_DIR` became `EVIDENCE_MILESTONE`, a folder name, so the helper cannot write into `docs/evidence/`.
- D85: wide tables other than the decisions log are **not** converted to lists. Prettier's `proseWrap: "never"` for `docs/**/*.md` prints them without padding, keeps their structure (the M0 plan asks for state machines as tables; the PRD is the owner's), and keeps `npm run format` from bringing the padding back. It changed nothing outside tables (criterion 4 compares every cell). `docs/evidence` is in `.prettierignore` because `npm run format` at v0.3.2 would already have rewritten seven earlier evidence files.
- D86: tooling in `scripts/` as TypeScript run directly by Node 24 (no dependency, linted and type-checked); names in snake_case (CONVENTIONS §3) rather than `evidence-run`.
- The `prettier` key moved from `package.json` to `prettier.config.js` (Prettier reads only one configuration; the file extends `@adonisjs/prettier-config` unchanged).
- The decisions log entry D77 kept its measurement as exact lines from the removed `hausdorff.log` in an added sub-item; the link became the pointer. D76 got only "Superseded by D84."
- `AGENTS.md` sections are no longer numbered; references such as "AGENTS.md §3" or "§7" in D14, D35, D81 and in earlier evidence were left as they were (decisions-log content is not rewritten).
- The Confirmed column counts the owner's release tag that includes a milestone as confirmation; there is no other written confirmation.

## Known limitations / deferred

- Seven files under `docs/evidence/` are neither logs nor images and were kept: `M3-0.3.1/hausdorff.sql`, `M3-0.3.1/shadcn-tabs.diff`, `M3-0.3.2/clip_polygon.geojson`, `M3-0.3.2/geojson_to_sql.py`, `M3-0.3.2/measure_osm_import.sh`, `M3a-fix/shadcn-dialog.diff`, `M3a-fix/shadcn-switch.diff`. Criterion 6 stays FAIL until the owner decides.
- The suggested `git add 'docs/evidence/*.log'` and `'docs/evidence/*.png'` commands were not run (no staging allowed). `git ls-files -- 'docs/evidence/*.log'` and `'docs/evidence/*.png'` match exactly the 112 logs and 271 PNG files, using the same pathspec rules.
- Deny rules in `.claude/settings.json` match the command as written; `git -C dir commit` or a command inside `sh -c` is not matched (Claude Code documentation, "Configure permissions"). AGENTS.md remains the rule.
- A plain `git status` in an evidence log header lists every uncommitted path, so headers are long while many files are changed.
