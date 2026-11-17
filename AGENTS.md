# Working on `umimaclean`

**Umima.Clean** is an ordering and payment web app for a shoe, bag and helmet cleaning business in Bandung Raya, built one milestone at a time from written specs. The owner must be able to read the code top to bottom and explain every flow: clarity beats cleverness, and a feature that works but can't be explained is not done. **Do not write application code until the active milestone is defined in `docs/PLAN.md`.**

## Never

- State-changing git (`add`, `commit`, `push`, `tag`, `rebase`, `reset`, `stash`, creating or switching branches): the owner reviews and commits everything. Read-only git (`status`, `diff`, `log`, `show`) is fine.
- Production systems or real customer data: this is a development checkout, and mistakes there hurt real people.
- Real outside services from tests: they cost money, send real messages and make tests flaky. Midtrans: sandbox keys only. Fonnte: log driver by default; a real message only to a number the owner gives, and only when asked.
- Hand edits to `database/schema.ts`: it is generated from the migrations.
- Secrets, `.env` files, map/OSM/OSRM data, uploads, database dumps, logs or screenshots in a suggested commit: they are private, large or reproducible.
- AI attribution in commit messages (`Co-Authored-By`, "Generated with", Claude or any assistant): the history is the owner's.

## Session start

**Always read:** this file, and in `docs/PLAN.md` the status table and the **Active milestone** section. Its handoff says where the last session stopped.

**Read when needed:**

- `docs/PRD/`: the sections for the requirement IDs the milestone lists (`summary.md` explains the IDs).
- `docs/ARCHITECTURE.md`: start from the code map in §3, then the sections you touch; look up decisions in §7 by D-number.
- `docs/CONVENTIONS.md`: §0 always applies; then the sections for the layer you touch.
- `docs/DEPENDENCIES.md` before adding a package or container image; `docs/SETUP.md` when changing setup.

**Not read routinely:** evidence of earlier milestones. The PLAN status table points to each folder.

- Never `cat` long logs or large files; use `grep`, `tail`, `wc`, or read one section.
- Use subagents for large exploration when your tool has them, and have them return summaries.
- On behavior the PRD wins; on technology `docs/ARCHITECTURE.md` §1; on code style `docs/CONVENTIONS.md`. If two documents conflict, say so in your report instead of choosing silently.
- Visual design (layouts, components, colors, typography, copy, images) and anything the documents leave open: ask the owner, who points you to the reference.
- Check current stable versions and official documentation instead of memory; never use deprecated APIs; pin container images by tag and digest.
- The owner writes this file, `docs/PRD/`, `docs/CONVENTIONS.md` and `docs/ARCHITECTURE.md` §1. You write `docs/ARCHITECTURE.md` §2+, `docs/SETUP.md` (zero-to-running and full teardown), `docs/DEPENDENCIES.md`, `docs/PLAN.md` (the owner approves it) and the evidence.

## Milestone loop

Progress is **slow and reviewable**: each milestone is small enough that the owner can look at the screens, read the code and understand it in one sitting. If a milestone grows, split it into checkpoints (`M5a`, `M5b`, …). **Stop after every milestone and every checkpoint.**

1. **Align:** find the active milestone in the PLAN status table. If the previous one has no owner confirmation (Confirmed column), stop and ask.
2. **Plan:** before writing code, send a 5–10 line plan (what you'll build, which files you'll touch) and wait for approval.
3. **Implement and test** following `docs/CONVENTIONS.md`. Cover the acceptance criteria: unit tests for services, state machines and helpers; functional tests for every route (happy path, authorization, and the PRD rule it implements, named by requirement ID); browser tests for the main journeys. `npm run check` (lint, typecheck, tests) passes with no deprecation warnings.
4. **Decide or ask:** ask before any decision that is hard to reverse or contradicts the documents. Otherwise decide, record the decision and its reason in `docs/ARCHITECTURE.md` §7, and continue.
5. **Docs and seed data:** update `docs/ARCHITECTURE.md` §2+ when routes, modules, schema, state machines or decisions change; every workaround gets a short code comment and a decisions-log entry. Update `docs/DEPENDENCIES.md` for every package or image added, and the PLAN status. Keep a usable development database: one owner, two staff, a few customers with addresses, the price list, the service areas, and sample orders in every status once orders exist. The seeder prints the demo accounts.
6. **Evidence and report** (below), then the **handoff:** update the Handoff of PLAN's Active milestone section (done, remaining, new decisions). The next session starts there. Then stop and wait for confirmation.

## Evidence

A milestone is not done until `docs/evidence/<milestone>/EVIDENCE.md` exists, following `docs/evidence/TEMPLATE.md`.

- Never claim something works without running it. PASS only for what was actually run, exited 0, and whose output you checked.
- Run the verification of each acceptance criterion through the evidence runner, **one run per criterion, not per command** (join commands with `sh -c '… && …'`): `node scripts/evidence_run.ts <milestone> <name> -- <cmd…>` (`docs/SETUP.md` §3).
- Raw logs and screenshots go only to `tmp/evidence/<milestone>/` (git-ignored; screenshots with `EVIDENCE_MILESTONE`), only for the milestone being reviewed, and are **never committed**.
- Excerpts in EVIDENCE.md (at most about 20 lines each) are exact text copied from those logs, never reconstructed or summarized.
- Open every screenshot and describe it in one line in EVIDENCE.md: page, width, what it shows, and its local `tmp/evidence/…` path. Every new or changed page at desktop and mobile width.
- Status per criterion: `PASS`, `FAIL`, `NOT RUN` (with the exact commands for the owner to run), or `decision recorded`.
- List known limitations and deferred items.
- Each `docs/evidence/<milestone>/` holds only `EVIDENCE.md`; besides those, `docs/evidence/` holds only `README.md` and `TEMPLATE.md` (enforced by `.gitignore` and `scripts/check_commits.ts`).
- Fixes and patches after review get their own folder: `docs/evidence/<milestone>-<version>/` for a patch release (`M2-0.2.1`, `M3-0.3.2`), or `<checkpoint>-fix<k>` (`M4a-fix1`) for a checkpoint that ships no version.

## Report

To the owner, in chat, **in Indonesian**, short (at most about 25 lines; measurements, options and logs go only in EVIDENCE.md):

1. **Ringkasan**: what was built, with the requirement IDs covered.
2. A link to the EVIDENCE.md.
3. **Pertanyaan terbuka**.
4. **Suggested commits** (below).
5. The next milestone.

Everything else goes **only in EVIDENCE.md** (English is fine): how to run and view (commands from a clean checkout, URLs, seeded accounts, what to click), screens, how each flow works from the click to the database and back (route → middleware → controller → validator → service → model → page, with a short sequence), a code tour of new or changed files in reading order (one line each), and decisions, deviations and workarounds with their reasons.

## Versioning

Semantic Versioning. The version lives in `package.json`; changes go in `CHANGELOG.md` (Keep a Changelog).

- Before 1.0.0: each milestone ends with a **minor** bump (the version in PLAN; a checkpoint `a` has none). Fixes after the owner's review are **patch** bumps (`0.N.1`, …).
- 1.0.0 = every requirement in the approved PLAN plus the hardening milestone: the version the business can use.
- After 1.0.0: features → minor, fixes → patch, breaking changes → major ("breaking" = a data change that can't be migrated automatically, or a removed feature or URL).
- You suggest the bump and the tag command; the owner creates tags.

## Git

The owner commits; you suggest. At the end of every milestone, and at any natural checkpoint inside one, add **Suggested commits**: an ordered list of small, focused commits.

- Conventional Commits: subject ≤ 72 characters, imperative mood, a scope where it helps (`feat(orders): …`, `docs: …`), and a short body explaining **why**.
- The exact paths of each commit. Every changed path is in exactly one commit.
- One command per commit for the **fish** shell (no heredocs, no `$'…'`): `git add path/a path/b; and git commit -m "type(scope): subject" -m "Body paragraph."`
- The last commit of a milestone is the version bump (`package.json`, `package-lock.json`, `CHANGELOG.md`), followed by the tag command for the owner, e.g. `git tag -a v0.4.0 -m "v0.4.0"`.
- Keep `.gitignore` current and mention every change to it.
- Write the commits as a plan file under `tmp/` and run `node scripts/check_commits.ts <plan> --print-fish`: it checks every path against `git status`, the subjects, attribution and forbidden files, and prints the fish commands to paste. Only suggest commits it passes.
