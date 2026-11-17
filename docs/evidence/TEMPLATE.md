# <milestone> evidence: <title>

Date: <YYYY-MM-DD>. Commit: <short hash> (+ uncommitted changes listed in each log header).

## Checklist

One row per acceptance criterion. Status is `PASS` (run, exit 0, output checked), `FAIL`, `NOT RUN` (with the exact commands for the owner) or `decision recorded`. The excerpt is exact text copied from the log in `tmp/evidence/<milestone>/logs/`, at most about 20 lines, never reconstructed or summarized.

| Criterion (req ID) | Status | Command | Excerpt (≤20 lines) |
| --- | --- | --- | --- |
| <REQ-1: what must be true> | PASS | `node scripts/evidence_run.ts <milestone> <name> -- <cmd>` | see below |

Excerpt for <REQ-1> (`tmp/evidence/<milestone>/logs/<name>.log`):

```text
<exact lines>
```

## Run & view

Commands from a clean checkout, URLs, seeded accounts, and what to click to see each new thing.

## Screens

One line per screenshot, after opening it: page, width, what it shows, local path.

- `/<path>` at 390 px: <what it shows> (`tmp/evidence/<milestone>/screenshots/<file>.png`)

## How it works

Each new flow from the click to the database and back (route → middleware → controller → validator → service → model → page), with a short sequence (text or Mermaid).

## Code tour

New or changed files in reading order, one line each.

## Decisions & deviations

Decisions taken (with their D-number), deviations from the documents, and every workaround with its reason.

## Known limitations / deferred
