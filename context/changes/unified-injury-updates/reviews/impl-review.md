---
change_id: unified-injury-updates
review: impl-review
created: 2026-09-24
reviewer: 11x-impl-review (report-only)
---

# Impl review: unified-injury-updates

## Verdict

Matches the plan. No Critical findings. Ship with the manual Android checklist still open.

Critical: 0 · Suggestions: 1 · Nice-to-have: 1

## Suggestion

### S1 — The sparkline treats a missing severity as 0

`SeverityTrendChart` uses `update.severity ?? 0`. The only caller passes updates that already have a severity, so the fallback does not change the current chart. A later caller that passed a note-only row would plot it as zero.

Fix if touched again: type the chart points as updates whose severity is a number, and do not substitute 0.

## Nice-to-have

### N1 — `injury_updates` has no index on `(injury_id, created_at)`

Lists are per injury and small at this scale. Add an index only if a later slice shows the timeline query matters.

## Facets

- **Drift** — v8 copies comments then readings, drops both tables, and stamps 8 in that transaction. Fresh installs create `injury_updates` and do not create the legacy tables. Backup stores `updates` at schema 8. Summary "Notes" and latest severity read updates. Injury detail is one timeline and one form; solutions and history stay. Archived injuries do not get the form.
- **Safety** — A failed copy rolls back with the version pragma. Rows are not filtered during the copy. New writes reject an empty update and a severity outside 0–10, and they refuse archived injuries inside the insert transaction.
- **Patterns** — WAL stays outside the transaction. Add update uses a ref guard. Old comment and reading modules are gone.
- **Type gate** — Feature. No rollback phase required. Recovery is a backup taken before upgrade.
- **Coverage** — `npx tsc --noEmit` exited 0 after phase 1 and again after phase 2. The copy SQL was also run once in a temporary SQLite database (comment text, values 4 and 0, shared timestamp order, tables dropped). That script is not a repo test.

## Triage

Unattended policy: Critical only. Nothing to apply.

- **S1 deferred** — chart null fallback. See handoff.
- **N1 deferred** — index. See handoff.
