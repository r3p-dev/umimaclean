# Evidence

One folder per milestone or checkpoint, each with an `EVIDENCE.md` that proves the milestone is done.

- **Raw logs and screenshots are not in the repository.** The ones committed until v0.3.2 were removed on 2026-11-17, after the owner had reviewed them; they remain in git history (any commit before that change). Links to them inside older evidence files are left as they were.
- **The committed record** is each `EVIDENCE.md`: its exact log excerpts and its one-line description of every screenshot.
- **New artifacts** live only in the git-ignored `tmp/evidence/<milestone>/` while a milestone is reviewed: `logs/` from `scripts/evidence_run.ts`, `screenshots/` from browser tests run with `EVIDENCE_MILESTONE` (`docs/SETUP.md` §3, `docs/ARCHITECTURE.md` D84).
- **Folder names:** `<milestone>/` (`M4a/`) for a milestone or checkpoint; `<milestone>-<version>/` (`M2-0.2.1/`) for a patch release after review; `<checkpoint>-fix<k>/` (`M4a-fix1/`) for a fix to a checkpoint that ships no version. Older folders (`M2a/FIX.md`, `M3a-fix/`, `M1c/PATCH-0.1.2.md`) predate this rule.
- **Template:** [TEMPLATE.md](TEMPLATE.md).
