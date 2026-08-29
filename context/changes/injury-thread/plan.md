---
change_id: injury-thread
created: 2026-08-29
---

# Plan: Injury thread — comments and solutions

## Overview

Turn the read-only injury detail into the J2 thread: description plus chronological comments and proposed solutions (text + optional http(s) URL). Persist both in sqlite (schema v3), add from the same screen, open a valid URL with React Native `Linking`, and show the latest solution on the open list (G2). Archive, create-time solutions, and a test runner stay out.

## Current State

Open injuries persist in `injuries` (schema v2, `limb` column). `/injuries/[id]` shows landmark, description, created date — no comments, no solutions, no links. Home list (`/` List segment) shows landmark + description preview. `expo-sqlite` + `SQLiteProvider` already wrap the stack. `expo-linking` is installed; product code does not call `Linking`. Automated gate in this repo is `npx tsc --noEmit` (no jest/Playwright).

## Desired End State

On Android, Mateusz can:

1. Open an existing injury and read its description, proposed solutions, and comments (oldest first).
2. Add a timestamped comment (required non-empty text). It appears at the end of the comment thread.
3. Add a solution: required text, optional http(s) URL. It appears on the detail and the **latest** solution body (and URL if present) shows on that injury’s open-list row.
4. Tap a valid http(s) solution URL → system handler (browser / YouTube). Invalid or empty URLs are not tappable and are never passed to `Linking`.
5. Force-stop and reopen: comments and solutions are still there (FR-18). Airplane mode is fine except FR-17.

## What We're NOT Doing

- Archive / reopen / `archived_at` / non-`open` status (slice 4)
- Solutions field on `/injuries/new` (add after create on the thread; FR-12)
- Exercise catalog or picker (FR-11)
- In-app WebView / YouTube embed / `expo-web-browser` (tech stack: RN `Linking`)
- Edit or delete comments/solutions
- One mixed comments+solutions table
- Map-marker change (slice 2 stays count-only)
- Test runner, jest-expo, Playwright
- New dependencies
- iOS / web polish
- Diagnosis, scoring, or suggested exercises (FR-19)

## Approach

Bump sqlite to v3 with `comments` and `solutions` tables next to `injuries`. Domain types + two small db modules mirroring `src/db/injuries.ts`. Grow `/injuries/[id]` with a `ScrollView`: existing header fields, solutions section + compose, comments section + compose (oldest first). Validate URLs in domain before insert. `Linking.openURL` only after the same http(s) check. Home list loads latest solutions in one extra query and shows a preview under the description.

## Critical Details

- **Schema v3** (atomic with `user_version`, per `sqlite.md`): WAL stays outside a transaction. `CREATE TABLE IF NOT EXISTS` for both new tables plus `PRAGMA user_version = 3` in one `withTransactionAsync`.
  - `comments`: `id INTEGER PRIMARY KEY NOT NULL`, `injury_id INTEGER NOT NULL`, `body TEXT NOT NULL`, `created_at TEXT NOT NULL`.
  - `solutions`: `id INTEGER PRIMARY KEY NOT NULL`, `injury_id INTEGER NOT NULL`, `body TEXT NOT NULL`, `url TEXT`, `created_at TEXT NOT NULL`.
  - Fresh install (`user_version === 0`): create `injuries` (including `limb`, same as today’s v0→2 path) **and** the two new tables, set version 3, return.
  - v1: `ALTER` limb + create the two tables, set version 3, return.
  - v2 (current devices): create the two tables, set version 3.
  - No FK pragma. `IF NOT EXISTS` so a retry after a killed bump cannot brick.
- **Writes:** `runAsync` with bound params (`execAsync` does not escape parameters — SDK 57 sqlite). `created_at` ISO-8601 UTC like injuries.
- **Comments:** `listCommentsForInjury` `ORDER BY created_at ASC, id ASC`. `createComment` trims body, throws if empty or injury missing (`getInjuryById` null).
- **Solutions:** `createSolution` trims body (throw if empty), trims url; empty url → `null`; non-empty url must pass `isHttpUrl` or throw; throw if `getInjuryById` is null (same as comments). `listSolutionsForInjury` `ORDER BY created_at DESC, id DESC` (latest first on detail). `listLatestSolutionsByInjuryIds(ids)`: if `ids.length === 0` return `{}` and do not query (SQLite `IN ()` is invalid); otherwise one `SELECT` for those ids, fold in JS to the latest per `injury_id`.
- **`isHttpUrl`:** parse with `URL`; accept only `http:` and `https:` (case-insensitive protocol). No other schemes.
- **Linking:** `import { Linking } from 'react-native'`. On press, if `url` fails `isHttpUrl`, do nothing. Else `Linking.openURL(url)` and surface a thrown error in the detail error line. Do **not** gate http(s) on `canOpenURL` (Android 11 query restrictions can false-negative https).
- **Detail UI:** one screen, no new route. Copy: Comments, Add comment, Solutions, Add solution, URL (optional). No clinical wording. `TextInput`s match create-form styling. Add buttons use a **ref** re-entry guard (not `disabled`/`useState` alone) per `frontend/navigation.md`. Unknown/missing injury still fail-loud as today.
- **List (G2):** under the description preview, if a latest solution exists, show its body (`numberOfLines={1}`) and, when `url` is set, a `linkPrimary` “Open link” that uses the same Linking rule (so G2 is visible without opening the injury).
- **Keyboard:** `ScrollView` + `keyboardShouldPersistTaps="handled"` on detail so compose fields stay reachable.

## Standards to apply

- `context/standards/global/conventions.md` — new files under `src/domain` and `src/db`; fail loud at create/url boundaries.
- `context/standards/global/minimal-implementation.md` — this slice only; no archive column, no create-form solutions, no extra repository class, no WebView.
- `context/standards/global/coding-style.md` — match `ThemedText` / `ThemedView` / `@/` paths; English UI; domain terms comment / solution / injury.
- `context/standards/global/sqlite.md` — WAL outside tx; DDL + `user_version` in one transaction.
- `context/standards/frontend/navigation.md` — ref guard on add comment / add solution.

## Lessons in play

- Make schema version bumps atomic with DDL — **in play** (`migrate.ts` v3).
- Hide the splash on DB init failure — not in play (layout/`onInit` unchanged).
- Guard async navigation against double tap — **in play** for add presses (duplicate insert, even though we stay on screen).

## Assumptions

- Automated criterion is `npx tsc --noEmit` (repo has no test runner; do not add one).
- Latest-solution preview on the **list** satisfies G2; graphic markers unchanged.
- Solutions on create are out of this slice.

## Phase 1: Schema v3 and persist API

### Overview

Domain types, URL helper, migration to v3, comment and solution store functions. No UI.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/domain/injury.ts` | Comment + solution types | Export `Comment`: `id`, `injuryId`, `body`, `createdAt`. Export `Solution`: `id`, `injuryId`, `body`, `url: string \| null`, `createdAt`. Keep `Injury` as-is. |
| `src/domain/http-url.ts` (create) | URL gate | `isHttpUrl(value: string): boolean` — `URL` parse, protocol `http:` or `https:` only. |
| `src/db/migrate.ts` | v3 | `DATABASE_VERSION = 3`. Paths in Critical Details. Both `CREATE TABLE IF NOT EXISTS` blocks in the same transaction as `user_version = 3`. |
| `src/db/comments.ts` (create) | Comment persist | `createComment(db, { injuryId, body })`, `listCommentsForInjury(db, injuryId)`. Contracts in Critical Details. Parameterized `runAsync` / `getAllAsync`. |
| `src/db/solutions.ts` (create) | Solution persist | `createSolution(db, { injuryId, body, url? })`, `listSolutionsForInjury(db, injuryId)`, `listLatestSolutionsByInjuryIds(db, ids: number[])`. Contracts in Critical Details. |

### Success Criteria

#### Automated

- `npx tsc --noEmit` passes.

#### Manual

- Modules exist and match the contracts (no UI yet). Persist is proven in phase 2–3 via force-stop.

## Phase 2: Injury detail thread

### Overview

Replace read-only detail with description + solutions + comments, compose, and URL open.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/app/injuries/[id].tsx` | Thread UI | Load injury, comments (ASC), solutions (latest first). Show description as today. Solutions: body, optional tappable URL (`accessibilityRole="link"`), Add solution (body required, URL optional). Comments: oldest first, Add comment. Ref guard on both adds; reload lists after success; clear inputs. Fail loud on load/save as today. `ScrollView` + `keyboardShouldPersistTaps="handled"`. `Linking.openURL` only for `isHttpUrl`. |

### Success Criteria

#### Automated

- `npx tsc --noEmit` passes.

#### Manual

- Open an injury: description visible; empty comments/solutions sections do not crash.
- Add comment with whitespace-only → refused; non-empty comment appears at the bottom of the thread with a timestamp.
- Add solution with text only → appears; add with text + `https://` URL → URL is tappable; `http://` works; `javascript:` or empty-but-invalid is refused or not opened.
- Tap a valid https URL → leaves the app (system browser / YouTube). App does not embed.
- Force-stop and reopen the same injury: comments and solutions still listed in the same order.

## Phase 3: Latest solution on the open list

### Overview

G2 on the list: each open row shows its latest proposed solution without opening the injury. Tappable URL uses the same Linking rule.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/app/index.tsx` | List preview | After `listOpenInjuries`, call `listLatestSolutionsByInjuryIds` with those ids. Do **not** wrap the whole row in `Link`. Row body (`Pressable`) navigates to `/injuries/[id]`. Under the description, if a latest solution exists, show its body (`numberOfLines={1}`) and, when url is http(s), a sibling “Open link” `Pressable` that only runs `Linking` (must not `router.push`). Graphic segment unchanged. |

### Success Criteria

#### Automated

- `npx tsc --noEmit` passes.

#### Manual

- List row with no solutions looks as today (description only).
- After adding a solution on detail, Back to List shows that solution preview on the row; a newer solution replaces the preview.
- Open link on the row leaves the app for a valid https URL.

## Testing Strategy

No test runner this slice (explicit, same as slices 1–2). Automated gate is `npx tsc --noEmit` only. Product proof is the phase 2–3 manual lists, especially force-stop (FR-18) and leaving the app (FR-17). Do not add jest-expo or Playwright.

## References

- PRD: G2 (solutions on open injuries), J2 (thread), FR-11, FR-12, FR-13, FR-17, FR-18, FR-19; §5 Comment/Solution; §6 URL handler
- Roadmap slice 3
- `context/foundation/tech-stack.md` — Expo SDK 57, `expo-sqlite`, React Native `Linking`
- `context/changes/injury-thread/ticket.md`
- `context/changes/injury-thread/frame.md`
- Expo SQLite (`SQLiteProvider`, `runAsync` / `getAllAsync`, `withTransactionAsync`, `PRAGMA user_version`) — Context7 `/websites/expo_dev_versions`; project standard overrides Expo sample by keeping `user_version` inside the DDL transaction
- React Native `Linking.openURL` — Context7 `/react/react-native-website`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Schema v3 and persist API

#### Automated

- [x] 1.1 `npx tsc --noEmit` passes — 111bf80

#### Manual

- [ ] 1.2 Persist modules match the plan contracts

### Phase 2: Injury detail thread

#### Automated

- [x] 2.1 `npx tsc --noEmit` passes

#### Manual

- [ ] 2.2 Empty thread renders; whitespace comment/solution refused
- [ ] 2.3 Comments oldest-first with timestamp; solutions latest-first with optional URL
- [ ] 2.4 Valid http(s) tap leaves the app; invalid/empty not opened
- [ ] 2.5 Force-stop still shows comments and solutions

### Phase 3: Latest solution on the open list

#### Automated

- [ ] 3.1 `npx tsc --noEmit` passes

#### Manual

- [ ] 3.2 List preview shows latest solution; Open link leaves the app
