---
change_id: archive-and-reopen
created: 2026-08-29
---

# Plan: Archive when healed, reopen on flare-up

## Overview

Let Mateusz archive an open injury as healed so it leaves the open list and map markers, stays readable with full history on a separate archive screen, and can be reopened on a flare-up without a duplicate row (J3, G3, FR-8/14/15/16, M3). Schema v4 adds `archived_at`; `status` already exists. Open queries already filter `open` — fix mapping, add archive/reopen APIs and UI.

## Current State

`injuries.status` is `TEXT NOT NULL DEFAULT 'open'`; create inserts `'open'`; `listOpenInjuries` / `listOpenInjuriesForLandmark` filter `status = 'open'`. Domain `Injury.status` is typed as only `'open'`; `mapInjury` hardcodes `'open'` and ignores the row. No `archived_at` column. No archive route. Detail (`/injuries/[id]`) always shows add-comment / add-solution. Home headerRight is “Log injury” only. Schema is v3 (comments + solutions). Automated gate: `npx tsc --noEmit`.

## Desired End State

On Android, Mateusz can:

1. From an open injury, tap Archive → injury `status = 'archived'`, `archived_at` set (ISO UTC).
2. That injury disappears from the open list and from open map markers (home + region close-up counts).
3. From home, open Archive → see archived injuries; open one → description + comments + solutions (read-only compose).
4. From an archived injury, tap Reopen → `status = 'open'`, `archived_at` cleared; same `id` appears again on open list/markers (no duplicate).
5. Force-stop and reopen: statuses and `archived_at` survive (FR-18).

## What We're NOT Doing

- Third status / soft-delete / “deleted” (FR-14)
- One-way archive without reopen (FR-16 default is reopen)
- Editing or deleting comments/solutions while archived (or ever, this slice)
- Confirm dialogs, undo toasts, bulk archive
- Separate archive DB, export, cloud
- Changing map marker visuals beyond count source (already open-only)
- Test runner / jest-expo / Playwright
- New dependencies
- iOS / web polish; diagnosis copy (FR-19)

## Approach

Bump to schema v4: add nullable `archived_at`. Widen `Injury.status` to `'open' | 'archived'`; map real status + `archivedAt`. Add `archiveInjury` / `reopenInjury` / `listArchivedInjuries`. Guard `createComment` / `createSolution` so archived injuries refuse new writes. Detail: Archive vs Reopen by status; hide compose when archived. New `/archive` screen; home header link. After archive, navigate back to open list (or archive). After reopen, stay on detail (now open) or go home — prefer stay on detail so thread is immediately editable.

## Critical Details

- **Schema v4** (atomic with `user_version`, per `sqlite.md`):
  - WAL outside transaction.
  - `ALTER TABLE injuries ADD COLUMN archived_at TEXT` + `PRAGMA user_version = 4` in one `withTransactionAsync` for `currentDbVersion === 3`.
  - Fresh install (`user_version === 0`): include `archived_at TEXT` on `CREATE TABLE injuries`, then comments/solutions DDL, `user_version = 4`.
  - v1 / v2 paths: keep limb + comments/solutions as today, **also** add `archived_at` (via ALTER if table already lacked it, or include in CREATE for v0 only). Practical rule: every migration path that ends at 4 must leave `archived_at` present. For v1/v2/v3 upgrades: `ALTER TABLE injuries ADD COLUMN archived_at TEXT` in the same transaction as jumping to 4 (SQLite allows ADD COLUMN; IF NOT EXISTS is not available for columns — do not re-ALTER if somehow present).
  - Existing rows: `archived_at` NULL, `status` remains `'open'`.
- **Domain:** `status: 'open' | 'archived'`; `archivedAt: string | null`. `mapInjury` reads `row.status` (only accept `'open'` | `'archived'`; unknown → throw fail-loud) and `row.archived_at`.
- **`archiveInjury(db, id)`:** load injury; throw if missing; throw if already archived; `UPDATE … SET status = 'archived', archived_at = ?` with ISO now; return updated Injury.
- **`reopenInjury(db, id)`:** load; throw if missing; throw if already open; `UPDATE … SET status = 'open', archived_at = NULL`; return updated Injury.
- **`listArchivedInjuries`:** `WHERE status = 'archived' ORDER BY archived_at DESC` (NULL last unlikely).
- **Select lists:** include `archived_at` in all injury SELECTs.
- **Comments/solutions:** after `getInjuryById`, if `status !== 'open'`, throw `Cannot create …: injury is archived`.
- **Detail UI:** when `open` — show Archive button (ref guard), keep compose. When `archived` — show Reopen (ref guard), hide compose; show `archivedAt` date. After successful archive → `router.back()` (or `replace('/')`) so open list refreshes via focus. After reopen → reload thread in place.
- **Archive screen** `src/app/archive.tsx` → `/archive`: list archived rows (landmark label + description preview + archived date); tap → `/injuries/[id]`. Fail-loud on load error. `useFocusEffect` reload. Ref guard on row navigate.
- **Home:** add Archive link in header (alongside Log injury — e.g. a small `ThemedView` row with two `Pressable`s, or Archive as second control). Pattern match existing `linkPrimary`.

## Standards to apply

- `context/standards/global/conventions.md` — extend `src/db/injuries.ts` / domain; fail loud at archive/reopen boundaries.
- `context/standards/global/minimal-implementation.md` — status + archive screen + actions only; no confirm dialogs, no new abstraction layer.
- `context/standards/global/coding-style.md` — match Themed* / `@/` paths; English UI (“Archive”, “Reopen”, “Archived”).
- `context/standards/global/sqlite.md` — WAL outside tx; DDL + `user_version` in one transaction.
- `context/standards/frontend/navigation.md` — ref guard on archive, reopen, archive-list row press, home Archive navigate.

## Lessons in play

- Make schema version bumps atomic with DDL — **in play** (`migrate.ts` v4).
- Hide the splash on DB init failure — not in play.
- Guard async navigation against double tap — **in play** for archive/reopen/nav.

## Assumptions

- Automated criterion is `npx tsc --noEmit` (no test runner; do not add one).
- `status` column already exists; only `archived_at` is new DDL.
- One detail route serves both open and archived (status-gated UI).
- No confirmation dialog before archive.
- After archive, leave the detail screen so the open list no longer shows the row.
- `npm run lint` (`expo lint`) may need eslint config; do not block on adding a linter stack — prefer `tsc` as the Automated gate if lint is not already runnable green.

## Phase 1: Schema v4 and status API

### Overview

Domain status + `archivedAt`, migration to v4, archive/reopen/list archived, mapInjury fix, comment/solution open-only guard. No UI.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/domain/injury.ts` | Status union + archivedAt | `status: 'open' \| 'archived'`; `archivedAt: string \| null` on `Injury`. |
| `src/db/migrate.ts` | v4 | `DATABASE_VERSION = 4`. Paths in Critical Details. `archived_at` present on every path; DDL + `user_version` atomic. |
| `src/db/injuries.ts` | Map + APIs | `InjuryRow` includes `archived_at`. `mapInjury` maps real status/`archivedAt`. `archiveInjury`, `reopenInjury`, `listArchivedInjuries`. All SELECTs include `archived_at`. |
| `src/db/comments.ts` | Open-only write | Refuse create when injury status is not `open`. |
| `src/db/solutions.ts` | Open-only write | Same as comments. |

### Success Criteria

#### Automated

- `npx tsc --noEmit` passes.

#### Manual

- Modules match contracts (no UI yet). Persist proven in later phases via force-stop.

## Phase 2: Detail archive / reopen + archive screen

### Overview

Wire Archive / Reopen on detail; add `/archive` list; link from home.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/app/injuries/[id].tsx` | Status actions | Open: Archive (ref guard) → `archiveInjury` then leave detail. Archived: Reopen (ref guard) → `reopenInjury` then reload; hide compose. Show archived date when archived. History (comments/solutions) always visible. |
| `src/app/archive.tsx` (create) | Archive list | `listArchivedInjuries`; landmark + description + archived date; tap → detail; focus reload; fail-loud; nav ref guard. |
| `src/app/index.tsx` | Entry | Header control to `/archive` (keep Log injury). |

### Success Criteria

#### Automated

- `npx tsc --noEmit` passes.

#### Manual

- Archive an open injury → gone from open list and map markers; appears in Archive with full history.
- Reopen from archive → back on open list/markers, same id, compose works again; `archived_at` cleared.
- Force-stop after archive/reopen → state persists.
- Cannot add comment/solution while archived (UI hidden; API would refuse).

## Testing Strategy

- Automated: `npx tsc --noEmit` after each phase.
- Manual: J3 walkthrough on Android emulator — archive, verify open views, archive list + history, reopen, force-stop.
- No new test runner.

## Migration / Rollback

- Forward-only ADD COLUMN; rollback not required for this feature change (not `type: migration`). If needed, leave column unused — do not DROP in this change.

## References

- `context/changes/archive-and-reopen/ticket.md`
- `context/changes/archive-and-reopen/frame.md`
- `context/foundation/prd.md` (G2/G3, J3, FR-8, FR-14–16, Injury entity)
- `context/foundation/roadmap.md` slice 4
- `context/standards/**`
- `context/foundation/lessons.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Schema v4 and status API

#### Automated

- [x] 1.1 Domain status + archivedAt, migrate v4, archive/reopen/list APIs, open-only comment/solution writes — 9c5cffb

#### Manual

- [ ] 1.2 Spot-check modules match contracts (no UI)

### Phase 2: Detail archive / reopen + archive screen

#### Automated

- [x] 2.1 Detail Archive/Reopen, `/archive` screen, home Archive link; `tsc` green — 245e9d6

#### Manual

- [ ] 2.2 J3 on device: archive vanishes from open/map; archive history; reopen same id; force-stop persists
