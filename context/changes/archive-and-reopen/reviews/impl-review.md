# Impl review: archive-and-reopen

Reviewer: in-process `/11x-deliver` (unattended). Report-only at write time.

Commits reviewed: `9c5cffb` (schema v4 + status API), `245e9d6` (detail + archive screen + home link).

## Verdict

Matches the plan. Migration, status mapping, open-only filters, compose gating, and ref guards are in place. Automated gate `npx tsc --noEmit` passes. No Critical findings.

## Findings

### Critical

None.

### Suggestion

1. **`onArchive` + empty back stack.** If `router.back()` is a no-op (deep link / cold start), detail stays open with stale open UI and `statusAction` stuck true. **Fix:** `canGoBack() ? back() : replace('/')`; optionally update local injury before navigate.

### Nice-to-have

2. Conditional `UPDATE … WHERE status = 'open'` for TOCTOU-safe archive/reopen (single-user app; low priority).
3. Re-read row after reopen instead of spreading loaded injury (fine for this slice).

## Drift

- Phase 1/2 contracts met. Independent migrate branches jump to v4 (prevents double ALTER). Reopen updates local injury state without full thread refetch (comments/solutions unchanged).

## Safety

- v3 branch present; one `archived_at` ALTER per path; WAL outside tx.
- `mapInjury` maps real status; open queries filter `open`.
- Compose hidden + API refuse when archived.
- Ref guards on archive/reopen/nav.

## Coverage

- Automated: `npx tsc --noEmit` → pass each phase.
- Manual 1.2 / 2.2 unchecked (device J3 walkthrough).

## Applied / deferred

- **Applied (Critical):** none.
- **Deferred (Suggestion / Nice-to-have):** S1, N1, N2 → `handoff.md`.
