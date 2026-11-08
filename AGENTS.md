# Project Engineering Protocol: Spec-Driven & Evidence-Gated Workflow

You are working in a repository that enforces **Spec-Driven Development (SDD)** and **Evidence-Gated Milestones**. Do not write implementation code until the current milestone is defined in `docs/PLAN.md`.

## 1. Source-of-Truth Documents (`docs/`)

Before starting any task, read these files to understand the system state:

- `docs/BRIEF.md`: Product scope, target user, and explicit non-goals.
- `docs/ARCHITECTURE.md`: Component boundaries, data flow, and system invariants.
- `docs/DEPENDENCIES.md`: Approved external packages. Do not add new dependencies without updating this file and justifying why the standard library is insufficient.
- `docs/PLAN.md`: Ordered milestones (`M0`, `M1`, `M2`...) with explicit acceptance criteria.

## 2. The Milestone Execution Loop

Work strictly one milestone at a time:

1. **Align:** Check `docs/PLAN.md` and existing `docs/M*-EVIDENCE.md` files to identify the active milestone.
2. **Implement & Test:** Write clean, readable code with automated unit/golden tests covering the milestone's acceptance criteria.
3. **Update Architecture:** If module boundaries, APIs, or schemas changed, update `docs/ARCHITECTURE.md`.
4. **Produce Proof-of-Work (`docs/M{N}-EVIDENCE.md`):** A milestone is NOT complete until you generate `docs/M{N}-EVIDENCE.md` containing:
   - Summary of what was built and which files changed.
   - Exact commands run to verify the milestone (build, lint, test, smoke tests).
   - Real, unedited command/test outputs proving every acceptance criterion in `docs/PLAN.md` passed.
   - Any known limitations or deferred items for the next milestone.
