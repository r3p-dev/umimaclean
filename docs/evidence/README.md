# Evidence

One folder per milestone or checkpoint, each with an `EVIDENCE.md` that proves the milestone is done.

- **Rule:** each `docs/evidence/<milestone>/` holds only `EVIDENCE.md`; the only other files here are this README and `TEMPLATE.md` (`.gitignore` and `scripts/check_commits.ts` enforce it).
- **The committed record** is each `EVIDENCE.md`: its exact log excerpts and its one-line description of every screenshot.
- **New artifacts** live only in the git-ignored `tmp/evidence/<milestone>/` while a milestone is reviewed: `logs/` from `scripts/evidence_run.ts`, `screenshots/` from browser tests run with `EVIDENCE_MILESTONE` (`docs/SETUP.md` §3, `docs/ARCHITECTURE.md` D84).
- **Folder names:** `<milestone>/` (`M4a/`) for a milestone or checkpoint; `<milestone>-<version>/` (`M2-0.2.1/`) for a patch release after review; `<checkpoint>-fix<k>/` (`M4a-fix1/`) for a fix to a checkpoint that ships no version. Some older folders hold review fixes as sections of their `EVIDENCE.md` instead.
- **Template:** [TEMPLATE.md](TEMPLATE.md).

## Clean-up of 2026-11-17

After the owner had reviewed them, everything except `EVIDENCE.md` was removed from the milestone folders. The originals remain in git history (any commit before this change); links to them inside older `EVIDENCE.md` files are left as they were.

- **Folded** into the folder's `EVIDENCE.md`, verbatim under a heading named after the file (headings one level lower): `M1c/PATCH-0.1.2.md` → `## PATCH-0.1.2`; `M2a/FIX.md`, `M2a/FIX2.md` → `## FIX`, `## FIX2`; `M2b/FIX.md`, `M2b/FIX2.md` → `## FIX`, `## FIX2`; `M3b/PROCESS.md` → `## Process checkpoint (2026-11-17)`.
- **Deleted:** 112 verification logs and 271 screenshots; the diffs of generated shadcn components (`M3a-fix/shadcn-dialog.diff`, `M3a-fix/shadcn-switch.diff`, `M3-0.3.1/shadcn-tabs.diff`); `M3-0.3.1/hausdorff.sql` (its query is in `docs/ARCHITECTURE.md` D77); the OSM import measurement tools `M3-0.3.2/measure_osm_import.sh`, `geojson_to_sql.py` and `clip_polygon.geojson` (last commit `59d99c0`, noted in `docs/PLAN.md` for M4a); and one internal audit note of M3a-fix with no remaining content.
- **Edited:** the sentences about that audit note were removed from `M3a-fix/EVIDENCE.md` (one list item) and `M3b/EVIDENCE.md` (one line); nothing else in older `EVIDENCE.md` text changed.
