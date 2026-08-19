---
change_id: log-injury-from-list
created: 2026-08-18
---

# Plan: Log an injury from the grouped list

## Overview

Replace the Expo template with the first demoable product loop: pick a landmark from a full §5 catalog grouped by region, save a required description into `expo-sqlite`, and still see that injury after force-stop. Graphic map, comments, solutions, archive, and automated tests are out.

## Current State

SDK 57 default template is running (`src/app` + `NativeTabs` Home/Explore). `expo-sqlite` is installed and plugged in `app.json`; nothing opens a database. No domain catalog, no injury table, no product screens.

## Desired End State

On Android, Mateusz can:

1. Open the app to a list of **open** injuries grouped by region (empty state on first launch).
2. Tap **Log injury**, pick a landmark from the full PRD §5 catalog (sections by region; each row is `Name · side`).
3. Enter a required description and save.
4. Land on a read-only detail (landmark, side, description, created date).
5. Go back and see the injury on the home list. Multiple open injuries on the same landmark are allowed.
6. Force-stop and reopen: the same rows are still there. No account, no network.

## What We're NOT Doing

- Body graphic, front/back map toggle, SVG, close-ups, markers (slice 2)
- Comments, solutions, or URLs (slice 3)
- Archive / reopen / `archived_at` (slice 4)
- Trimming the §5 catalog
- Placeholder Graphic tab
- Test runner, jest-expo, or component tests
- New dependencies
- iOS / web polish
- Diagnosis, scoring, or suggested exercises (FR-19)

## Approach

Static TypeScript catalog (not SQLite) plus one `injuries` table. `SQLiteProvider` at the root. Drop `NativeTabs` for a `Stack` (`import { Stack } from 'expo-router'` per SDK 57). Four routes: home list, catalog, create form, read-only detail. After save, `router.replace` onto detail so Back skips the form.

## Critical Details

- **Landmark ids** are stable strings `{region}-{side}-{slug}`, e.g. `arms-front-elbow`. Same ids will be reused by the graphic slice — do not use autoincrement for landmarks.
- **Catalog lives in code.** Injury rows store `landmark_id TEXT`. Resolve display names via `getLandmarkById`.
- **Schema v1:** `id INTEGER PRIMARY KEY NOT NULL`, `landmark_id TEXT NOT NULL`, `description TEXT NOT NULL`, `status TEXT NOT NULL DEFAULT 'open'`, `created_at TEXT NOT NULL` (ISO-8601 UTC). No unique constraint on `landmark_id`. No `archived_at`.
- **Home list** is `WHERE status = 'open' ORDER BY created_at DESC`, grouped by the landmark's region in PRD order: head, torso, arms, legs. Row shows landmark name, side, and a description preview.
- **Create:** trim description; refuse whitespace-only. Parameterized `runAsync` for writes (`execAsync` does not escape parameters — SDK 57 sqlite docs).
- **Copy:** labels are Description / Log injury / Open injuries. No clinical or diagnostic wording (FR-19).
- **Template cleanup:** this change makes Explore, `AppTabs`, and unused welcome components dead — delete them here, do not leave stubs.

## Standards to apply

- `context/standards/global/conventions.md` — new code under `src/` next to existing layout (`src/domain`, `src/db`, `src/app`); fail loud at the sqlite/create boundary.
- `context/standards/global/minimal-implementation.md` — this slice only; no solutions field, no archive column, no Graphic placeholder, no extra repository class.
- `context/standards/global/coding-style.md` — match existing names (`ThemedText`, `ThemedView`, `@/` paths); English UI; delete code this change makes unused; domain terms from the PRD (region, landmark, injury, open).

## Lessons in play

None — `context/foundation/lessons.md` does not exist yet.

## Phase 1: Landmark catalog

### Overview

Encode the full PRD §5 catalog as a typed TypeScript module with lookup and region-grouping helpers. No UI, no SQLite.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/domain/landmarks.ts` (create) | Frozen catalog + helpers | Export `Region` (`'head' \| 'torso' \| 'arms' \| 'legs'`), `Side` (`'front' \| 'back'`), `Landmark` (`id`, `region`, `side`, `name`). Export `LANDMARKS: readonly Landmark[]` covering every §5 row exactly once. Ids: `{region}-{side}-{slug}` (`arms-front-elbow`, `head-back-skull`, …). Export `REGION_ORDER`, `getLandmarkById(id): Landmark \| undefined`, `groupLandmarksByRegion(landmarks): { region, landmarks }[]` in `REGION_ORDER`, rows left in catalog order. |

### Success Criteria

#### Automated

- `npx tsc --noEmit` passes.

#### Manual

- Catalog matches PRD §5 exactly: no extras, no missing rows, front/back duplicates kept as separate ids (Elbow · front and Elbow · back).

## Phase 2: SQLite injury store

### Overview

Open an on-device DB, migrate v1 `injuries`, and expose three functions screens will call. Wire `SQLiteProvider` in a later phase; this phase is the module.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/domain/injury.ts` (create) | Row type | `Injury`: `id: number`, `landmarkId: string`, `description: string`, `status: 'open'`, `createdAt: string`. |
| `src/db/migrate.ts` (create) | `onInit` for `SQLiteProvider` | `migrate(db: SQLiteDatabase): Promise<void>`. `PRAGMA user_version`. v0→1: `PRAGMA journal_mode = 'wal';` then `CREATE TABLE injuries (...)` as in Critical Details. Set `user_version = 1`. Idempotent if already ≥1. |
| `src/db/injuries.ts` (create) | Persistence API | All functions take `SQLiteDatabase`. `createInjury({ landmarkId, description })` trims description, throws if empty or landmark unknown, inserts `status='open'` and UTC `created_at`, returns the new `Injury` (`lastInsertRowId`). `listOpenInjuries()` returns `Injury[]` for `status='open'` newest first. `getInjuryById(id)` returns `Injury \| null`. Writes via `runAsync` with bound params. |

### Success Criteria

#### Automated

- `npx tsc --noEmit` passes.

#### Manual

- Modules exist and match the contracts above (no UI yet). Persist is proven in phase 3 via force-stop.

## Phase 3: Stack shell and product screens

### Overview

Replace Home/Explore tabs with a stack wrapped in `SQLiteProvider`. Ship home list, catalog, create form, and read-only detail. Hide the splash after DB init. Delete template files this change makes dead.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/app/_layout.tsx` | Root providers + stack | `ThemeProvider` kept. Wrap with `SQLiteProvider` (`databaseName="my-body-scan.db"`, `onInit={migrate}`). Render `<Stack />` from `expo-router`, not `NativeTabs` / `AppTabs`. Hide splash after DB is ready (`SplashScreen.preventAutoHideAsync` + hide in `onInit` or equivalent). Drop `AnimatedSplashOverlay`. |
| `src/app/index.tsx` | Open-injury list | Title: Open injuries. Header action **Log injury** → `/landmarks`. Group `listOpenInjuries` by landmark region (`REGION_ORDER`). Row: landmark name, side, description preview; tap → `/injuries/[id]`. Empty: short copy + same Log injury CTA. Reuse `ThemedText` / `ThemedView` / theme colors. |
| `src/app/landmarks.tsx` | Catalog picker | Title: Log injury. `groupLandmarksByRegion(LANDMARKS)`. Section headers = region. Row label `{name} · {side}`. Tap → `/injuries/new?landmarkId=`. |
| `src/app/injuries/new.tsx` | Create form | Require `landmarkId` param; unknown/missing id → fail loud (message, no silent insert). Show landmark `{name} · {side}`. Multiline Description. Save disabled while trimmed text is empty. On success `router.replace(`/injuries/${id}`)`. |
| `src/app/injuries/[id].tsx` | Read-only detail | Load `getInjuryById`. Missing row → fail loud. Show landmark name, side, description, created date. No edit, archive, comments, or solutions. |
| `src/app/explore.tsx` | Dead template screen | Delete. |
| `src/components/app-tabs.tsx` | Dead tabs | Delete. |
| `src/components/app-tabs.web.tsx` | Dead tabs | Delete. |
| Template-only components made unused (`hint-row`, `web-badge`, `animated-icon*`, `ui/collapsible`, `external-link` if nothing imports them) | Dead welcome UI | Delete in this phase. Keep `themed-text`, `themed-view`, `constants/theme`, color-scheme hooks. |

### Success Criteria

#### Automated

- `npx tsc --noEmit` passes.

#### Manual

- First launch: empty Open injuries list and a Log injury action. No Explore tab, no Expo welcome copy.
- Log injury shows the full catalog grouped by region; rows read `Name · side`.
- Save is blocked on an empty/whitespace description; a non-empty description creates the injury and opens detail.
- Back from detail returns to the home list (not the form). The new row sits under the correct region.
- A second injury on the same landmark is a second row, not a replace.
- Force-stop and reopen: both injuries still listed and both details still readable. Airplane mode is fine (no network used).

## Testing Strategy

No test runner this slice (explicit). Automated gate is `npx tsc --noEmit` only. Product proof is the phase 3 manual list, especially force-stop (G1 / FR-18). Add jest-expo in a later change if we want a repository regression lock.

## References

- PRD: G1, J2 (list), FR-6, FR-9, FR-10 (description only), FR-18, FR-19, FR-20; catalog §5
- Roadmap slice 1
- `context/foundation/tech-stack.md` — Expo SDK 57, `expo-sqlite`, Expo Router, no second nav/ORM
- [Expo SQLite SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/) — `SQLiteProvider`, `useSQLiteContext`, `runAsync` / `getAllAsync` / `getFirstAsync`, `onInit` + `user_version`
- [Expo Router Stack SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/stack/) — `import { Stack } from 'expo-router'`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Landmark catalog

#### Automated

- [x] 1.1 `npx tsc --noEmit` passes — d57a3c1

#### Manual

- [x] 1.2 Catalog matches PRD §5 exactly — d57a3c1

### Phase 2: SQLite injury store

#### Automated

- [x] 2.1 `npx tsc --noEmit` passes — 20cf086

#### Manual

- [x] 2.2 Injury store modules match the plan contracts — 20cf086

### Phase 3: Stack shell and product screens

#### Automated

- [x] 3.1 `npx tsc --noEmit` passes — 919b1a7

#### Manual

- [x] 3.2 Empty home list and Log injury action; template gone — 919b1a7
- [x] 3.3 Catalog grouped by region with Name · side rows — 919b1a7
- [x] 3.4 Description required; save opens detail — 919b1a7
- [x] 3.5 Back from detail lands on home list under the right region — 919b1a7
- [x] 3.6 Two open injuries on the same landmark both appear — 919b1a7
- [x] 3.7 Force-stop and reopen still shows both injuries — 919b1a7
