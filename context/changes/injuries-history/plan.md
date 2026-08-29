---
change_id: injuries-history
created: 2026-08-29
---

# Plan: Injuries history

## Overview

Record an append-only history of injury create / archive / reopen and solution add / remove so Mateusz can see flare-up cycles and tried solutions after reopen. Schema v5 adds `injury_events` and `solutions.removed_at`; writers emit events; detail shows History and Remove.

## Current State

Schema v4: injuries (with `status`, `archived_at`), comments, solutions. `archiveInjury` / `reopenInjury` update status; reopen sets `archived_at = NULL`. Solutions are hard rows only — no remove API, no `removed_at`. Detail shows solutions + comments; no event timeline. Automated gate: `npx tsc --noEmit`.

## Desired End State

On Android, Mateusz can:

1. Create an injury → a `created` history event exists for that injury.
2. Archive → `archived` event; reopen → `reopened` event; both remain visible after reopen (even though `archived_at` is cleared on the injury row).
3. Add a solution → `solution_added` event; solution appears in the active list.
4. Remove a solution (open injury only) → `solution_removed` event; solution leaves the active list / open-list “latest solution” but remains visible in History.
5. Open injury detail → chronological History of those events; force-stop preserves events and `removed_at` (FR-18).

## What We're NOT Doing

- Comment lifecycle events
- Global timeline across injuries
- Hard-delete solutions or edit/delete events
- Confirm dialogs, undo toasts
- Export / sync / cloud
- Test runner / jest-expo / Playwright
- New dependencies
- iOS / web polish; diagnosis copy (FR-19)

## Approach

Bump to schema v5: `injury_events` table + `solutions.removed_at`. Domain types for events and `removedAt` on Solution. New `src/db/events.ts` (list + insert helpers). Wire `createInjury` / `archiveInjury` / `reopenInjury` / `createSolution` / new `removeSolution` to insert events (same logical operation; prefer one transaction where the write already uses a single statement — insert event immediately after success in the same module function). Filter active solution queries with `removed_at IS NULL`. Detail UI: History section + Remove on each active solution when open.

## Critical Details

- **Schema v5** (atomic with `user_version`, per `sqlite.md`):
  - `DATABASE_VERSION = 5`.
  - WAL outside transaction (unchanged pattern).
  - **Required structure (plan-review C1):**
    1. **`user_version === 0`:** one transaction creates full schema at 5: injuries (with `archived_at`), comments, solutions **with** `removed_at TEXT`, `injury_events`, `PRAGMA user_version = 5`. Empty backfill is fine (no rows).
    2. **`user_version` in 1..4:** first apply the existing upgrade steps needed so injuries have `limb`/`archived_at` and comments/solutions tables exist (same DDL as today’s v1–v4 paths, but do **not** stop at `user_version = 4`). Then in the **same** final transaction that lands on 5: `ALTER TABLE solutions ADD COLUMN removed_at TEXT`, `CREATE TABLE IF NOT EXISTS injury_events (…)`, backfill INSERTs below, `PRAGMA user_version = 5`. No path may set version 5 without both `removed_at` and `injury_events` plus backfill.
  - Prefer dedicated blocks: v0→5 full create; v1→5 / v2→5 / v3→5 / v4→5 each ending with the shared “events + removed_at + backfill + user_version=5” statements (duplicate the shared tail in each block, or a local helper string constant — no new module).
  - **`injury_events` DDL:**
    ```
    id INTEGER PRIMARY KEY NOT NULL,
    injury_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    solution_id INTEGER,
    created_at TEXT NOT NULL
    ```
  - **Backfill** (in the same transaction as DDL on upgrade; optional no-op on empty v0):
    - `INSERT INTO injury_events (injury_id, type, solution_id, created_at) SELECT id, 'created', NULL, created_at FROM injuries;`
    - `… SELECT id, 'archived', NULL, archived_at FROM injuries WHERE status = 'archived' AND archived_at IS NOT NULL;`
    - `… SELECT injury_id, 'solution_added', id, created_at FROM solutions;`
  - Existing solutions: `removed_at` NULL.

- **Domain:**
  - `InjuryEventType = 'created' | 'archived' | 'reopened' | 'solution_added' | 'solution_removed'`
  - `InjuryEvent = { id, injuryId, type, solutionId: number | null, createdAt }`
  - `Solution.removedAt: string | null`

- **`src/db/events.ts`:**
  - `insertInjuryEvent(db, { injuryId, type, solutionId?, createdAt? })`
  - `listEventsForInjury(db, injuryId)` → oldest first (`ORDER BY created_at ASC, id ASC`)
  - Fail loud on unknown type when mapping.

- **Writers (emit event after successful mutation):**
  - `createInjury` → `created` (use injury `createdAt`)
  - `archiveInjury` → `archived` (use `archivedAt`)
  - `reopenInjury` → `reopened` (ISO now; still clear `archived_at` on injury row)
  - `createSolution` → `solution_added` with `solution_id`
  - `removeSolution(db, solutionId)`: load solution + injury; throw if missing / already removed / injury not open; `UPDATE solutions SET removed_at = ?`; insert `solution_removed`; return updated Solution.

- **Solution reads:** `listSolutionsForInjury` and `listLatestSolutionsByInjuryIds` add `AND removed_at IS NULL` (and SELECT `removed_at` for mapping). Active UI never lists removed rows.

- **Detail UI** (`src/app/injuries/[id].tsx`):
  - Load events with thread.
  - **History** section: chronological labels (e.g. “Created”, “Archived”, “Reopened”, “Solution added”, “Solution removed”) + timestamp; for solution events optionally show solution body if still loadable (including removed) via a small lookup — or keep labels + time only for minimal UI. Prefer: label + time; for solution_* include short body from a `getSolutionById` that does **not** filter `removed_at`.
  - **Remove** control on each active solution when injury is open (ref guard). After remove, reload solutions + events.
  - Archived: no Remove, no compose (unchanged).

## Standards to apply

- `context/standards/global/conventions.md` — extend `src/db/*` / domain; fail loud at remove/event boundaries.
- `context/standards/global/minimal-implementation.md` — event log + soft-delete + detail History/Remove only.
- `context/standards/global/coding-style.md` — match Themed* / `@/` paths; English UI.
- `context/standards/global/sqlite.md` — WAL outside tx; DDL + backfill + `user_version` in one transaction.
- `context/standards/frontend/navigation.md` — ref guard on Remove (and existing status actions).

## Lessons in play

- Make schema version bumps atomic with DDL — **in play** (`migrate.ts` v5).
- Guard async navigation against double tap — **in play** for Remove.
- Hide the splash on DB init failure — not in play.

## Assumptions

- Automated criterion is `npx tsc --noEmit` (no test runner; do not add one).
- Soft-delete only; no hard-delete.
- No comment events.
- History on injury detail only (not a global screen).
- Backfill created / archived / solution_added as specified; no invented removals.
- Event insert immediately after mutation in the same async function (acceptable if not wrapped in one SQL transaction with the UPDATE — prefer `withTransactionAsync` when easy for remove/archive/reopen/create).
- `npm run lint` is not the gate if it needs extra config; `tsc` is the Automated gate.

## Phase 1: Schema v5, events API, soft-delete solutions

### Overview

Migration to v5, domain types, `events.ts`, wire writers, filter active solution lists. No UI.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/domain/injury.ts` | Event types + `removedAt` | `InjuryEventType`, `InjuryEvent`; `Solution.removedAt: string \| null`. |
| `src/db/migrate.ts` | v5 | `DATABASE_VERSION = 5`. `injury_events` + `removed_at` + backfill + atomic `user_version`. Fresh install includes both. |
| `src/db/events.ts` | Insert + list | `insertInjuryEvent`, `listEventsForInjury` (oldest first). |
| `src/db/injuries.ts` | Emit lifecycle events | After create/archive/reopen success, insert matching event. |
| `src/db/solutions.ts` | Soft-delete + emit + filter | `removed_at` on row/map; create emits `solution_added`; `removeSolution`; list/latest filter `removed_at IS NULL`; `getSolutionById` (any removal state) for history labels. |

### Success Criteria

#### Automated

- `npx tsc --noEmit` exits 0.

#### Manual

- Spot-check modules match contracts (no UI).

## Phase 2: Detail History and Remove

### Overview

Injury detail loads and shows History; open injuries can Remove a solution.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/app/injuries/[id].tsx` | History + Remove | Load events; History section oldest-first; Remove on active solutions when open (ref guard); reload solutions+events after remove. |

### Success Criteria

#### Automated

- `npx tsc --noEmit` exits 0.

#### Manual

- On device: create → History shows Created; archive + reopen → both events remain; add solution → listed + event; remove → gone from list, Solution removed in History; force-stop persists.

## Testing Strategy

- Automated: `npx tsc --noEmit` after each phase.
- Manual: reviewer checklist on Android emulator (lifecycle + remove + persist).
- No new test runner.

## References

- `context/changes/injuries-history/ticket.md`
- `context/changes/injuries-history/frame.md`
- `context/foundation/prd.md` (FR-18)
- `context/changes/archive-and-reopen/` (status split priors)
- `context/standards/global/sqlite.md`
- `context/standards/frontend/navigation.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Schema v5, events API, soft-delete solutions

#### Automated

- [x] 1.1 Schema v5, domain, events module, wire writers and solution filters — d91c12e
- [x] 1.2 `npx tsc --noEmit` exits 0 — d91c12e

#### Manual

- [ ] 1.3 Spot-check modules match contracts (no UI)

### Phase 2: Detail History and Remove

#### Automated

- [ ] 2.1 History section and Remove on open injury detail
- [ ] 2.2 `npx tsc --noEmit` exits 0

#### Manual

- [ ] 2.3 Device: create/archive/reopen/add/remove history + force-stop persist
