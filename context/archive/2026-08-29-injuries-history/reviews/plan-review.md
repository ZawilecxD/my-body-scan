# Plan review: injuries-history

## Verdict

Plan is executable. One Critical on migration path clarity; rest Suggestions.

## Findings

### Critical

**C1 — Migration fall-through under-specified for v1–v4**

Plan says “sequential fall-through or dedicated blocks” without a single required structure. A partial path could bump to 5 without `removed_at` or without backfill.

**Fix:** Require in Critical Details / Phase 1 contract: (a) v0 creates full schema at 5 including `removed_at` + `injury_events` (no backfill needed on empty DB, or empty backfill is fine); (b) for `currentDbVersion` in 1..4, one shared upgrade transaction: ensure `archived_at` if missing (existing), `ALTER solutions ADD COLUMN removed_at`, `CREATE TABLE injury_events`, backfill SELECTs, `user_version = 5`. Do not leave a path that sets version 5 without both DDL pieces and backfill.

### Suggestion

**S1 — Wrap mutation + event in `withTransactionAsync`**

Plan allows “insert after success.” Prefer one transaction for archive/reopen/remove/createSolution so a kill cannot orphan a row without its event.

**S2 — History solution body lookup**

Optional `getSolutionById` is good; if omitted, labels-only History still meets AC. Keep optional.

### Nice-to-have

**N1 — Index on `injury_events(injury_id, created_at)`** — skip for MVP volume.

## Progress hygiene

Phases and `## Progress` align; Automated criteria use existing `npx tsc --noEmit`.

## Triage (unattended)

- **Applied:** C1 (migration structure tightened in `plan.md` Critical Details).
- **Deferred to handoff:** S1, S2, N1.
