# Working on `umimaclean`

**Umima.Clean** is an ordering and payment web app for a shoe, bag and helmet cleaning business in Bandung Raya. It is built one milestone at a time from written specs. **Do not write application code until the active milestone is defined in `docs/PLAN.md`.**

The codebase must be easy to read and explain: the owner wants to read it top to bottom and explain every flow to someone else. Clarity beats cleverness. A feature that works but can't be explained is not done.

## 1. Documents

Read these at the start of every session:

| Document                              | Defines                                                                                                 | Who writes it               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------- |
| `AGENTS.md` (this file)               | How to work: milestone loop, rules, reporting, versioning, git                                          | Owner                       |
| `docs/prd/` (start with `summary.md`) | What the app does, per audience, with requirement IDs                                                   | Owner                       |
| `docs/CONVENTIONS.md`                 | How code is written: project rules, naming, layers, frontend, styling, comments                         | Owner                       |
| `docs/ARCHITECTURE.md`                | §1 fixed decisions and security (owner); §2+ components, data flow, state machines, decisions log (you) | Both                        |
| `docs/PLAN.md`                        | Milestones, versions, acceptance criteria, estimates, status                                            | You (approved by the owner) |
| `docs/DEPENDENCIES.md`                | Approved packages and container images, with reasons                                                    | You                         |
| `docs/M{N}-EVIDENCE.md`               | Proof that a milestone is done                                                                          | You                         |

On behavior the PRD wins; on technology `docs/ARCHITECTURE.md` §1 wins; on code style `docs/CONVENTIONS.md` wins. If two documents conflict, say so in your report instead of choosing silently.

**Visual design** (layouts, components, colors, typography, copy, images) and anything the documents leave open: ask me. I will point you to the reference.

Always check the current stable versions and official documentation of every tool and library instead of relying on memory, and never use deprecated APIs. Pin exact versions of container images.

## 2. Milestone loop

1. **Align:** read `docs/PLAN.md` and the existing `docs/M*-EVIDENCE.md` files to find the active milestone. If the previous milestone has no confirmation from me, stop and ask.
2. **Implement and test:** follow `docs/CONVENTIONS.md`. Cover the milestone's acceptance criteria with tests: unit tests for services, state machines and helpers; functional tests for every route (happy path, authorization, and the PRD rule it implements, named by requirement ID); browser tests for the main journeys. `npm run lint`, `npm run typecheck` and `npm test` pass with no deprecation warnings.
3. **Keep the docs current:** update `docs/ARCHITECTURE.md` §2+ when routes, modules, schema, state machines or decisions change; every workaround gets a short code comment and a decisions-log entry. Update `docs/DEPENDENCIES.md` for every package or image added. Update the status column in `docs/PLAN.md`.
4. **Seed data:** keep a usable development database: one owner, one staff, a few customers with addresses, the price list, the service areas, and sample orders in every status once orders exist. The seeder prints the demo accounts.
5. **Produce evidence:** a milestone is not done until `docs/M{N}-EVIDENCE.md` exists with the content of the report below (in English is fine), screenshots under `docs/evidence/M{N}/`, and known limitations or deferred items.
6. **Report and stop** (§4), then wait for my confirmation before the next milestone.

## 3. Pace

I want **slow, reviewable progress**. Every milestone is small enough that I can look at the screens, read the code and understand how it works in one sitting. **Stop after every milestone.** If a milestone grows, split it into checkpoints (`M5a`, `M5b`, …) and stop at each one.

## 4. Report format

Write the report to me **in Indonesian**, short and concrete:

1. **Ringkasan**: what was built, in a few sentences, with the requirement IDs covered.
2. **Cara menjalankan dan melihat**: exact commands from a clean checkout, URLs, seeded accounts, and what to click to see each new thing.
3. **Tampilan**: screenshots of every new or changed page (desktop and mobile width) under `docs/evidence/M{N}/`, linked.
4. **Cara kerja**: how each new flow works from the click to the database and back (route → middleware → controller → validator → service → model → page), with a short sequence (text or Mermaid).
5. **Tur kode**: the new or changed files **in reading order**, one line each, so I can read them in that order.
6. **Keputusan dan penyimpangan**: decisions taken, deviations from the documents, every workaround added (with its reason).
7. **Bukti**: the exact verification commands and their real, unedited output.
8. **Pertanyaan terbuka**, then **Suggested commits** (§7), then the next milestone.

## 5. Working with me

- Ask before any decision that is hard to reverse or contradicts the documents. Otherwise decide, record the decision and its reason in `docs/ARCHITECTURE.md` §7, and continue.
- Never claim something works without having run it. If you can't run something, say so and give me the exact commands to run on my machine.
- Never call real outside services from tests. Midtrans: sandbox keys only. Fonnte: log driver by default; a real message only to a number I give you, only when I ask.
- No production systems, no real customer data.
- Never edit `database/schema.ts` by hand; it is generated from migrations.

## 6. Versioning

**Semantic Versioning.** The version lives in `package.json`; changes are recorded in `CHANGELOG.md` (Keep a Changelog).

- **Before 1.0.0:** each milestone ends with a **minor** bump (the version in `docs/PLAN.md`). Fixes after my review of that milestone are **patch** bumps (`0.N.1`, …).
- **1.0.0** = every requirement in the approved `docs/PLAN.md`, plus the hardening milestone. That is the version the business can actually use.
- **After 1.0.0:** new features → minor, fixes → patch, breaking changes → major. "Breaking" means a data change that can't be migrated automatically, or a removed feature or URL.
- You suggest the bump and the tag command; **I create tags myself**.

## 7. Git: I commit, you suggest

- **Never create commits, push, tag, rebase, reset, stash, or create/switch branches. Don't stage files with `git add` either.** Read-only git (`status`, `diff`, `log`, `show`) is fine. I review and commit everything myself.
- At the end of every milestone (and at any natural checkpoint inside one), add a **"Suggested commits"** section: an ordered list of small, focused commits. For each:
  - the Conventional Commits message: subject ≤ 72 characters, imperative mood, a scope where it helps (`feat(orders): …`, `test(payments): …`, `docs: …`), and a short body explaining **why**;
  - the exact paths it includes;
  - a copy-pasteable command for the **fish** shell (no heredocs, no `$'…'`):
    `git add path/a path/b; and git commit -m "type(scope): subject" -m "Body paragraph."`
- The last suggested commit of a milestone is the version bump (`package.json`, `package-lock.json`, `CHANGELOG.md`), followed by the tag command for me to run, e.g. `git tag -a v0.3.0 -m "v0.3.0"`.
- Every changed path appears in exactly one suggested commit. Run `git status --short` at the end and confirm nothing is left out or listed twice.
- Commit messages contain **no AI attribution**: no `Co-Authored-By`, no "Generated with", no mention of Claude or any assistant.
- Never put secrets, `.env` files, map/OSM/OSRM data, uploads or database dumps in a suggested commit. Keep `.gitignore` up to date and mention every change to it.
