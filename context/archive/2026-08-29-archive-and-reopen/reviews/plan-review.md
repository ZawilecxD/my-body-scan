# Plan review: archive-and-reopen

Reviewer: in-process `/11x-deliver` (unattended). Report-only at write time; Critical applied via triage.

## Verdict

Worth executing. No Critical plan defects. Feasible, matches standards, `## Progress` mirrors phases. Automated gate is `npx tsc --noEmit` (correct for this repo). Open list/map already SQL-filter `status = 'open'`; archived leak risk is low once `archiveInjury` sets status. Migration must add an explicit `currentDbVersion === 3` branch (already in Critical Details).

## Findings

### Critical

None.

### Suggestion

1. **Tighten Phase-1 migrate contract.** Enumerate v0/v1/v2/**v3** end-states in the phase table so the new `=== 3` branch cannot be missed. **Fix:** copy four-path checklist into Phase 1 contract cell.

2. **After-archive navigation.** Prefer `router.back()` only; drop `replace('/')`. Detail uses `useEffect` not focus — reopen must set local state from returned Injury. **Fix:** lock Phase 2 contract to `router.back()` + in-place state update on reopen.

3. **Split Progress 1.1.** Domain+migrate / injuries APIs / comment-solution guards as separate checkboxes for partial-landing honesty.

4. **Couple mapInjury fix with open-only guards** in the same commit so the guard is not inert.

### Nice-to-have

5. Sequential fall-through migrations (follow-up; out of scope).

6. Guard home “Log injury” navigate while touching header (consistency).

7. Explicit `return` on each migrate branch including new v3.

8. Confirm legacy devices have `status` column (already required by open queries).

## Progress hygiene

Matches two phases; Automated vs Manual split correct. Unattended must not tick Manual. Step 1.1 is coarse (Suggestion 3) — acceptable under unattended (Critical only).

## Architectural fitness

Right seams: extend `injuries.ts` + one `/archive` route; status-gated detail. No speculative layer. `sqlite.md` atomic bump in play. Type `feature`: no extra gate.

## Applied / deferred

- **Applied (Critical):** none.
- **Deferred (Suggestion / Nice-to-have):** S1–S4, N1–N4 → park on `handoff.md` at ship. Implementer will still follow Critical Details (v3 branch + `router.back()` preference) as written in plan body.
