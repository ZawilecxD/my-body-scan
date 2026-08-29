# Handoff: archive-and-reopen

Ticket: pasted (roadmap slice 4 — Archive when healed, reopen on flare-up)
Status: mr_ready

No project git/MR skill or MCP is configured. Paste this file as the MR body.

## What landed

- Phase 1: Schema v4 and status API — 9c5cffb
- Phase 2: Detail Archive/Reopen, `/archive` screen, home Archive link — 245e9d6

## Assumptions

- Automated gate is `npx tsc --noEmit` (no test runner; do not add one).
- `status` column already existed; only `archived_at` was added (v4).
- No confirmation dialog before archive.
- After archive, `router.back()` so open list refreshes on focus.
- One detail route serves open and archived (status-gated compose).

## Reviewer checklist (manual)

- [ ] 1.2 Spot-check modules match contracts (no UI)
- [ ] 2.2 J3 on device: archive vanishes from open/map; archive history; reopen same id; force-stop persists
- [ ] After archive from a screen with no back stack, prefer `canGoBack() ? back() : replace('/')` (Suggestion S1, not applied)

## Automated evidence

- `npx tsc --noEmit` → pass (phases 1–2)

## Follow-ups / out of scope

- Plan-review: tighten migrate contract in phase table; split Progress 1.1; sequential migration fall-through
- Impl-review S1: empty back-stack after archive
- Conditional UPDATE for TOCTOU-safe archive/reopen (N1)
- Third status / soft-delete / one-way archive / confirm dialogs / test runner

## Context paths

- `context/changes/archive-and-reopen/change.md`
- `context/changes/archive-and-reopen/plan.md`
- `context/changes/archive-and-reopen/ticket.md`
- `context/changes/archive-and-reopen/handoff.md`
