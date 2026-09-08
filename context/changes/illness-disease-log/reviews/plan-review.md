# Plan review: illness-disease-log

Reviewed: `plan.md` against ticket, frame, standards (`sqlite`, `minimal-implementation`, `navigation`), and lessons (atomic schema bumps).

## Verdict

Worth executing after Critical fixes. Scope matches roadmap §8; phases reach Desired End State; Automated gate (`npx tsc --noEmit`) is runnable. Migration bump pattern correctly mirrors severity-trend C1.

## Findings

### Critical

1. **`createIllness` must be atomic with the first episode**  
   Plan says INSERT illness then INSERT first episode without requiring one `withTransactionAsync`. A kill between them leaves an illness with zero episodes and breaks the “always ≥1 episode after create” frequency contract.  
   **Fix:** In Critical Details / Phase 1 contract for `illnesses.ts`, require illness + first episode INSERT in a single `withTransactionAsync`.

2. **List “latest episode date” helper must not be optional**  
   Desired End State #1 and Phase 2 list UI need latest `noted_at` per illness. Leaving `latestEpisodeNotedAtByIllnessIds` as “optional” lets Phase 1 ship without a way for the list to show frequency dates without N+1 queries or loading all episodes.  
   **Fix:** Require `latestEpisodeNotedAtByIllnessIds(db, ids): Record<number, string>` in `episodes.ts` (empty ids → `{}`, no query), same empty-`IN ()` guard as solutions.

### Suggestion

3. **Tighten backup parse for tactic URLs**  
   Plan hedges between solutions-parity and `isHttpUrl` on parse. Prefer: non-null non-empty `url` must pass `isHttpUrl` or throw (fail loud; matches write path).

4. **Header crowding**  
   Home already has Summary / Backup / Archive. Adding Illnesses is correct for MVP reachability; a later change may want a overflow/menu. Out of scope to redesign now.

### Nice-to-have

5. Optional free-text note on an episode (“symptoms this time”) — not in ticket; park.

## Progress hygiene

`## Progress` mirrors Phase 1–2; titles are concrete; Manual items correctly left for handoff under unattended.

## Architectural fitness

Separate illness domain (not injury subtype) matches frame and FR-19. Reuses `isHttpUrl` / Linking. No speculative abstractions. Feature type needs no TDD/rollback gate.

## Triage (unattended)

- **Applied (Critical):** C1 createIllness atomic with first episode; C2 `latestEpisodeNotedAtByIllnessIds` required — both written into `plan.md` Critical Details / Phase 1.
- **Deferred to handoff:** S3 backup tactic URL parse; S4 header crowding; N5 episode free-text note.
