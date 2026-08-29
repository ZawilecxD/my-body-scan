# Plan review: injury-thread

Reviewer: in-process `/11x-deliver` (unattended). Report-only at write time; Critical applied via `/11x-review-triage`.

## Verdict

Worth executing after two Critical contract gaps are closed. Feasible, matches standards, `## Progress` mirrors phases. Automated gate is `npx tsc --noEmit` (this repo has no test runner — correct, do not add one).

## Findings

### Critical

1. **Empty `IN ()` on the open list.** `listLatestSolutionsByInjuryIds(db, ids)` with `ids.length === 0` (first launch / empty list) must return `{}` / `[]` without running SQL. SQLite `WHERE injury_id IN ()` is a syntax error and would fail the list load. **Fix:** spell that empty-ids short-circuit in the Phase 1 contract.

2. **Missing injury on `createSolution`.** Phase 1 requires `createComment` to throw if `getInjuryById` is null; `createSolution` does not. Same fail-loud boundary. **Fix:** `createSolution` throws if the injury row is missing.

3. **List “Open link” nested inside row `Link`.** Phase 3 puts a tappable URL on a row that is already a `Link`/`Pressable` to `/injuries/[id]`. On Android the child press can still fire the parent navigation (or both). **Fix:** row body navigates; “Open link” is a sibling `Pressable` that only runs `Linking` and does not `router.push`.

### Suggestion

4. `URL` without a base throws on values like `youtube.com` — already fail-loud via `isHttpUrl`; no plan change needed.

5. Do not introduce `canOpenURL` for http(s) — plan already says this; keep it.

### Nice-to-have

6. KeyboardAvoidingView on detail if compose sits under the IME — out of scope unless Manual shows it.

## Progress hygiene

Matches three phases; Automated vs Manual split is correct. Unattended must not tick Manual items.

## Architectural fitness

Right seams (`src/db/comments.ts`, `src/db/solutions.ts` next to `injuries.ts`). No speculative layer. `sqlite.md` wins over the Expo sample’s extra-transaction `user_version`. Type `feature`: no extra gate.

## Applied / deferred

- **Applied (Critical):** empty-ids short-circuit; `createSolution` missing-injury throw; list “Open link” sibling `Pressable` (not nested in row `Link`). `plan.md` updated; `## Progress` titles unchanged.
- **Deferred (Suggestion / Nice-to-have):** `URL` throw on bare hosts (already fail-loud); KeyboardAvoidingView. Park on `handoff.md` at ship.
