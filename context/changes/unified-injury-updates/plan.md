---
change_id: unified-injury-updates
created: 2026-09-24
---

# Plan: Unified injury updates

## Overview

Replace separate injury comments and severity readings with one chronological injury update (severity, note, or both). Schema v8 copies existing rows without dropping their text, values, or timestamps, then removes the old tables. Injury detail, backup, and the physio summary all read `injury_updates`.

## Current State

Schema v7. `comments` (body, created_at) and `severity_readings` (integer value 0–10, created_at) are separate. Injury detail (`src/app/injuries/[id].tsx`) has Solutions, a Severity list plus SVG sparkline, Comments, and History (lifecycle events). Backup `formatVersion: 1` / `schemaVersion: 7` dumps comments and readings. Summary checkbox "Comments" lists comment bodies in the window; "Latest severity" is the newest reading, not window-filtered. Automated gate: `npx tsc --noEmit`. No unit or e2e runner.

`V7_FROM_V6` in `src/db/migrate.ts` ends with `PRAGMA user_version = ${DATABASE_VERSION}`. Bumping `DATABASE_VERSION` without splitting that stamp would mark the database current before updates exist.

Expo SDK 57 sqlite: `withTransactionAsync` is the transaction this file already uses during `SQLiteProvider` `onInit` (before other queries). `withExclusiveTransactionAsync` is documented as unsupported on web and takes a `txn` argument. Stay on `withTransactionAsync`. Project rule still wins over the Expo sample that stamps `user_version` after the transaction: DDL and the version pragma stay in one transaction. `PRAGMA journal_mode = 'wal'` stays outside.

## Desired End State

On Android, Mateusz can:

1. Open an injury and add one update with severity (0–10), a note, or both. The button stays off when both are missing, and when the severity field is non-empty but not an integer 0–10.
2. See updates oldest-first in one list. A sparkline appears when at least two updates have a severity. Note-only updates are not chart points.
3. After upgrading a v7 database, every previous comment body and severity value is still visible at its original timestamp.
4. Export and restore a schema-8 backup, including updates. Summary "Latest severity" and "Notes" come from updates.
5. Archived injuries show updates and do not accept new ones. Solutions and History are unchanged.

## What We're NOT Doing

- Edit/delete (roadmap §10), interventions, Today, reminders, i18n
- Merging a comment and a reading that share or nearly share a timestamp
- General-health fields
- In-app downgrade; restoring `schemaVersion` other than 8
- New dependencies, jest, Playwright
- Changing solution or illness behavior

## Approach

Bump to schema v8. New `injury_updates` table. Upgrade paths that still have `comments` and `severity_readings` copy then drop them in the same transaction as `user_version = 8`. Fresh installs create `injury_updates` only. Domain type `InjuryUpdate`. `src/db/updates.ts` replaces `comments.ts` and `readings.ts`. Backup payload swaps `comments` and `readings` for `updates`. Summary and injury detail read updates.

## Critical Details

- **Schema v8** (atomic with `user_version`, per `sqlite.md`):
  - `DATABASE_VERSION = 8`.
  - WAL outside the transaction (unchanged).
  - **`injury_updates`:**
    ```
    id INTEGER PRIMARY KEY NOT NULL,
    injury_id INTEGER NOT NULL,
    severity INTEGER,
    note TEXT,
    created_at TEXT NOT NULL,
    CHECK (severity IS NOT NULL OR note IS NOT NULL),
    CHECK (severity IS NULL OR (severity >= 0 AND severity <= 10))
    ```
  - **Copy (only when the legacy tables exist):**
    ```
    INSERT INTO injury_updates (injury_id, severity, note, created_at)
      SELECT injury_id, NULL, body, created_at FROM comments
      ORDER BY created_at ASC, id ASC;
    INSERT INTO injury_updates (injury_id, severity, note, created_at)
      SELECT injury_id, value, NULL, created_at FROM severity_readings
      ORDER BY created_at ASC, id ASC;
    DROP TABLE comments;
    DROP TABLE severity_readings;
    ```
  - Copy every row. Do not trim, skip, or coalesce. A CHECK failure aborts the transaction (no silent loss, version stays put).
  - SQLite applies `ORDER BY` on `INSERT … SELECT` to insertion order, so a shared timestamp gets a lower id for the comment than for the reading. Display order is `created_at ASC, id ASC`.
  - **`V7_SCHEMA_FROM_V6`** = the three illness `CREATE TABLE`s only. Remove the version pragma from today's `V7_FROM_V6`.
  - **`V8_FROM_LEGACY`** = create `injury_updates` + copy + drop + `PRAGMA user_version = 8`.
  - **`user_version === 0`:** one transaction = injuries, solutions (v5 shape), events, empty `injury_updates`, illness tables, `user_version = 8`. Do not create `comments` or `severity_readings`.
  - **`user_version` in 1..6:** existing upgrade limbs through illness tables (no version stamp) then `V8_FROM_LEGACY`. Those limbs already create comments and readings before v8.
  - **`user_version === 7`:** one transaction = `V8_FROM_LEGACY` only.
  - Never stamp 8 unless that same transaction created `injury_updates` and, when legacy tables were present, copied them before the drop.

- **Domain (`src/domain/injury.ts`):**
  - Add `InjuryUpdate = { id, injuryId, severity: number | null, note: string | null, createdAt }`.
  - Remove `Comment` and `SeverityReading`.
  - Leave `Solution` and `InjuryEvent` as they are.

- **`src/db/updates.ts`:**
  - `createInjuryUpdate(db, { injuryId, severity?, note? })` — trim note; empty note → null; missing severity → null. Throw if both null. Severity, when present, must be an integer 0–10. Injury must exist and `status === 'open'`. In one `withTransactionAsync`: re-read the injury, then INSERT. ISO `createdAt`. Return the row.
  - `listInjuryUpdatesForInjury(db, injuryId)` → `ORDER BY created_at ASC, id ASC`.
  - Delete `src/db/comments.ts` and `src/db/readings.ts`.

- **Backup:**
  - `BackupPayload` drops `comments` and `readings`; adds `updates: InjuryUpdate[]`. `formatVersion: 1`. `schemaVersion` follows `DATABASE_VERSION` (8).
  - Dump updates `ORDER BY id ASC`.
  - Parse: `updates` must be an array. Each row: integer id and injuryId, non-empty `createdAt`, severity null or integer 0–10, note null or string (empty string → null). Reject a row with neither severity nor note.
  - Replace: delete `injury_updates` with the other child tables (not `comments` / `severity_readings`). Insert updates after injuries. Do not add a new referential check beyond what restore already does for illnesses.

- **Summary:**
  - `includeComments` → `includeNotes` (in-memory config only; default still false). Checkbox label "Notes".
  - Latest severity: among updates with non-null severity, newest `createdAt` then highest `id`. Not window-filtered.
  - Notes section: updates with non-null note whose `createdAt` falls in the window (same bounds as today's comments), oldest first. Heading "Notes". An update with both fields contributes its note here and can also be latest severity.
  - Remove `commentInWindow`'s `Comment` dependency; filter on `createdAt`.

- **Injury detail UI:**
  - Remove the Severity block and the Comments block.
  - One "Updates" section: sparkline when two or more updates have severity (chart those points only, in list order); empty copy "No updates yet."; each card shows `N / 10` when severity is set, the note when set, and the timestamp.
  - Open injuries: optional severity field (number pad) and optional note. Button "Add update". Disabled unless severity is empty or a valid 0–10, and at least one of valid severity or non-empty trimmed note is present. Ref guard around the write (`navigation.md`). Clear both fields on success.
  - Archived: list only, no form.
  - Solutions and History stay.

## Standards to apply

- `context/standards/global/conventions.md` — `src/domain` / `src/db` / existing injury route; fail loud.
- `context/standards/global/minimal-implementation.md` — this slice only; no edit/delete, no intervention fields.
- `context/standards/global/coding-style.md` — match nearby names; delete `comments.ts` / `readings.ts`; English UI; glossary terms.
- `context/standards/global/sqlite.md` — WAL outside; DDL, copy, drop, and `user_version` in one transaction.
- `context/standards/frontend/navigation.md` — ref guard on Add update.

## Lessons in play

- Make schema version bumps atomic with DDL — **in play** (`migrate.ts` v8, including the v7 stamp split).
- Guard async navigation against double tap — **in play** for Add update.
- Hide the splash on DB init failure — not in play (layout already hides in `finally`).

## Assumptions

- Automated criterion is `npx tsc --noEmit` (no test runner; do not add one).
- Legacy rows are not merged, even when timestamps match. Comments are inserted before readings.
- Schema 7 (and older) backup files do not restore on this build.
- No in-app rollback. A pre-upgrade export is the recovery path.
- Summary label changes from Comments to Notes; section defaults stay the same.
- `createInjuryUpdate` holds the open-status check and INSERT in one transaction.

## Phase 1: Schema v8, update API, backup, summary

### Overview

Migration, domain type, update repository, backup payload, and summary reads. Injury detail keeps its two blocks in this phase so the project still typechecks after `comments.ts` and `readings.ts` are deleted: the severity block lists and creates severity-bearing updates, and the comments block lists and creates note-bearing updates. Phase 2 replaces those two blocks with one timeline and one form.

### Changes Required

- File: `src/db/migrate.ts` — Intent: bump to v8 and copy legacy rows on every upgrade path. Contract: Critical Details migrate structure. v0 never creates `comments` or `severity_readings`. v1–v7 copy then drop inside the version-8 transaction.
- File: `src/domain/injury.ts` — Intent: add `InjuryUpdate`; remove `Comment` and `SeverityReading`. Contract: Critical Details.
- File: `src/db/updates.ts` — Intent: create and list updates. Contract: Critical Details; fail loud.
- File: `src/db/comments.ts` — Intent: delete. Contract: no remaining imports.
- File: `src/db/readings.ts` — Intent: delete. Contract: no remaining imports.
- File: `src/domain/backup.ts` — Intent: `updates` replaces `comments` and `readings`. Contract: Critical Details.
- File: `src/db/backup.ts` — Intent: dump, parse, and replace updates. Contract: schemaVersion 8; delete/insert order safe; reject an update with neither field.
- File: `src/domain/summary.ts` — Intent: latest severity and notes from `InjuryUpdate`. Contract: Critical Details; heading "Notes".
- File: `src/db/summary.ts` — Intent: load updates once per injury and derive both sections. Contract: latest severity not window-filtered; notes are.
- File: `src/app/summary.tsx` — Intent: checkbox label "Notes" bound to `includeNotes`. Contract: default remains off.
- File: `src/app/injuries/[id].tsx` — Intent: stop importing deleted comment and reading modules. Contract: severity block reads and writes updates that have a severity (`createInjuryUpdate` with severity only); comments block reads and writes updates that have a note (note only). Do not merge the form or the list in this phase. Ref guards stay.

### Success Criteria

#### Automated

- `npx tsc --noEmit` exits 0.

#### Manual

- (none in this phase)

## Phase 2: Injury detail update timeline

### Overview

One Updates section and one Add update form on injury detail. Solutions and History stay.

### Changes Required

- File: `src/app/injuries/[id].tsx` — Intent: replace Severity and Comments UI with the unified timeline and form. Contract: Critical Details UI; ref guard; archived read-only; sparkline uses severity-bearing updates only.

### Success Criteria

#### Automated

- `npx tsc --noEmit` exits 0.

#### Manual

- On an open injury, save severity only, note only, and both; confirm both-empty and a non-integer severity do not save.
- Confirm an upgraded database still shows old comment text and old severity values, oldest first, and the sparkline uses only severity points.
- Archive hides the form; reopen shows it. Export then restore on this build round-trips updates. Summary "Latest severity" and "Notes" match the timeline.
- Confirm the form has no treatment, sleep, mood, or other extra fields, and no diagnosis copy.

## Testing Strategy

- Automated: `npx tsc --noEmit` after each phase.
- Manual: Android checks in phase 2. Do not add jest or Playwright.

## Migration / rollback

Forward-only. The v8 transaction copies every legacy row before `DROP TABLE`. A failure rolls the transaction back and leaves `user_version` unchanged. There is no downgrade step. Restore a backup exported from schema 7 or earlier only on a build that still reads that schema.

## References

- `context/changes/unified-injury-updates/ticket.md`
- `context/changes/unified-injury-updates/frame.md`
- `context/foundation/glossary.md`
- `context/foundation/roadmap.md` §9
- `context/foundation/prd.md` §9 PDR-1–PDR-4, PDR-6
- `context/standards/global/sqlite.md`
- Expo SDK 57 sqlite: https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Schema v8, update API, backup, summary

#### Automated

- [x] 1.1 Schema v8 migration copies legacy comments and readings — 7417c3f
- [x] 1.2 InjuryUpdate domain type and updates db module — 7417c3f
- [x] 1.3 Backup dump/parse/replace uses updates — 7417c3f
- [x] 1.4 Summary reads notes and latest severity from updates — 7417c3f
- [x] 1.5 `npx tsc --noEmit` exits 0 — 7417c3f

#### Manual

- (none)

### Phase 2: Injury detail update timeline

#### Automated

- [x] 2.1 Injury detail shows one update timeline and form
- [x] 2.2 `npx tsc --noEmit` exits 0

#### Manual

- [ ] 2.3 Android: severity-only, note-only, and both save; empty and invalid severity do not
- [ ] 2.4 Android: upgraded rows remain; sparkline ignores note-only points; archive hides the form; backup round-trip; summary Notes and Latest severity match
- [ ] 2.5 Confirm the form has no extra health fields and no diagnosis copy
