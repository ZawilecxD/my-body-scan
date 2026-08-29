# Impl review: injuries-history

## Verdict

Matches the plan. No Critical findings. Safe to hand off for manual device check.

## Findings

### Critical

None.

### Suggestion

**S1 — Mutation + event not in one transaction**

`createInjury` / `archiveInjury` / `reopenInjury` / `createSolution` / `removeSolution` insert the row then the event in separate statements. A process kill between them can orphan a row without its history event (or leave an event without the intended row state for remove).

**Fix:** Wrap each pair in `db.withTransactionAsync` (plan-review S1).

**S2 — N+1 solution lookups for History labels**

`labelsForEvents` calls `getSolutionById` per solution event. Fine for MVP volume; batch if lists grow.

### Nice-to-have

**N1 — History placement** — History is below comments; some users may want it above Solutions. Product preference only.

## Drift

- Phase 1: schema v5, events module, writers, soft-delete filters — done.
- Phase 2: History + Remove with ref guard — done.
- Backfill and migration structure per plan-review C1 — done.

## Coverage

- Automated: `npx tsc --noEmit` passed for both phases.
- Manual device AC still open (handoff checklist).

## Triage (unattended)

- **Applied:** none (no Critical).
- **Deferred to handoff:** S1, S2, N1.
