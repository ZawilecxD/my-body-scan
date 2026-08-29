# Handoff: injuries-history

Ticket: pasted (injuries-history-event-log)
Status: mr_ready

No project git/MR skill or MCP is configured. Paste this file as the MR body.

## What landed

- Phase 1: Schema v5, events API, soft-delete solutions — d91c12e
- Phase 2: Detail History and Remove — 23bbcdf

## Assumptions

- Soft-delete solutions via `removed_at`; active lists filter `removed_at IS NULL`.
- Event types: `created` | `archived` | `reopened` | `solution_added` | `solution_removed`.
- History on injury detail only; no comment events; no global timeline.
- Backfill on upgrade: created / archived / solution_added from existing rows.
- Automated gate is `npx tsc --noEmit` (no test runner; do not add one).

## Reviewer checklist (manual)

- [ ] 1.3 Spot-check modules match contracts (no UI)
- [ ] 2.3 Device: create/archive/reopen/add/remove history + force-stop persist
- [ ] Wrap mutation + event in `withTransactionAsync` (Suggestion S1, not applied)
- [ ] Batch History solution label lookups if needed (Suggestion S2, not applied)

## Automated evidence

- `npx tsc --noEmit` → pass (phases 1–2)

## Follow-ups / out of scope

- Plan-review S1 / impl-review S1: transactional mutation + event
- Comment lifecycle events; global timeline; hard-delete; confirm dialogs; test runner

## Context paths

- `context/changes/injuries-history/change.md`
- `context/changes/injuries-history/plan.md`
- `context/changes/injuries-history/ticket.md`
- `context/changes/injuries-history/handoff.md`
