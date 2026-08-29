# Handoff: archive-and-reopen

Ticket: slice-4-archive-and-reopen (roadmap)
Status: implementing

## What landed
- Phase 1: Schema v4 and status API — 9c5cffb

## Assumptions
- Automated gate is `npx tsc --noEmit` (no test runner).
- `status` column already existed; only `archived_at` added.
- No confirmation dialog before archive.
- After archive, `router.back()` so open list refreshes on focus.

## Reviewer checklist (manual)
- [ ] 1.2 Spot-check modules match contracts (no UI)
- [ ] 2.2 J3 on device: archive vanishes from open/map; archive history; reopen same id; force-stop persists

## Automated evidence
- `npx tsc --noEmit` → pass (phase 1)

## Follow-ups / out of scope
- Plan-review Suggestions: tighten migrate contract in phase table; split Progress 1.1; sequential migration fall-through (N1); guard Log injury header.

## Context paths
- `context/changes/archive-and-reopen/change.md`
- `context/changes/archive-and-reopen/plan.md`
- `context/changes/archive-and-reopen/ticket.md`
