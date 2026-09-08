---
change_id: illness-disease-log
created: 2026-09-08
---

# Plan: Illness & disease log

## Overview

Let Mateusz log systemic illnesses/chronic conditions (not landmark injuries), record episodes to see recurrence frequency, and keep user-authored symptom tactics (text + optional http(s) URL). Schema v7 adds `illnesses`, `illness_episodes`, and `symptom_tactics`; backup dump/restore includes them. No diagnosis or advice (FR-19).

## Current State

Schema v6: injuries + comments/solutions/events/severity_readings. Home is open injuries (graphic/list) with Archive / Backup / Summary. No illness domain. Backup `formatVersion: 1` / `schemaVersion: 6`. Automated gate: `npx tsc --noEmit`. `isHttpUrl` + RN `Linking` already used for solutions.

## Desired End State

On Android, Mateusz can:

1. From home, open **Illnesses** → see all illnesses (name + episode count; latest episode date when any).
2. Create an illness with required name and optional notes; first episode is recorded at create time.
3. Open an illness → see name/notes, episode list (oldest→newest) with count, add another episode, add symptom tactics (text + optional URL), tap valid http(s) tactic URLs.
4. Force-stop → data still present (FR-18).
5. Export/restore → illnesses, episodes, tactics round-trip with schemaVersion 7.

## What We're NOT Doing

- Landmark / map / injury coupling
- Diagnosis, advice, clinical taxonomy, severity-of-illness scoring (FR-19)
- Archive/reopen for illnesses; edit/delete
- Soft-delete / remove for tactics (unlike injury solutions `removed_at`)
- Physio-summary inclusion; i18n; new deps; jest/Playwright
- iOS/web polish

## Approach

Bump to schema v7 with three tables. Domain types in `src/domain/illness.ts`. Persist modules mirroring `injuries` / `solutions`. Screens under `src/app/illnesses/`. Home header link. Extend backup payload. Reuse `isHttpUrl` + Linking.

## Critical Details

- **Schema v7** (atomic with `user_version`, per `sqlite.md`):
  - `DATABASE_VERSION = 7`.
  - WAL outside transaction (unchanged).
  - **DDL:**
    ```
    illnesses:
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL

    illness_episodes:
      id INTEGER PRIMARY KEY NOT NULL,
      illness_id INTEGER NOT NULL,
      noted_at TEXT NOT NULL,
      created_at TEXT NOT NULL

    symptom_tactics:
      id INTEGER PRIMARY KEY NOT NULL,
      illness_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      url TEXT,
      created_at TEXT NOT NULL
    ```
  - **`V7_FROM_V6`** = three `CREATE TABLE IF NOT EXISTS` + `PRAGMA user_version = 7`.
  - **Required migrate structure:** today’s `V6_FROM_V5` ends with `PRAGMA user_version = ${DATABASE_VERSION}`. After bumping to 7, that would stamp 7 without illness tables. Do this instead:
    1. Change `V6_FROM_V5` to create `severity_readings` only (no version pragma) — rename conceptually to `V6_SCHEMA_FROM_V5`.
    2. Define `V7_FROM_V6` = illness DDLs + `PRAGMA user_version = 7`.
    3. **`user_version === 0`:** one transaction = full current schema (injuries + comments + solutions v5 + events + readings + three illness tables) + `user_version = 7` only.
    4. **`user_version` in 1..5:** existing upgrade limbs + V5 fragment (no version) + V6 schema (readings only) + `V7_FROM_V6`. Never stamp 7 without illness tables.
    5. **`user_version === 6`:** one transaction = `V7_FROM_V6` only — do not re-run V5/V6 fragments.
    6. Never run a transaction that sets `user_version = 7` unless that same transaction created the three illness tables.

- **Domain (`src/domain/illness.ts`):**
  - `Illness = { id, name, notes: string | null, createdAt }`
  - `IllnessEpisode = { id, illnessId, notedAt, createdAt }`
  - `SymptomTactic = { id, illnessId, body, url: string | null, createdAt }`
  - Empty notes → `null` at write boundary.

- **`src/db/illnesses.ts`:**
  - `createIllness(db, { name, notes? })` — trim name (throw if empty); trim notes → null if empty; ISO `createdAt`; **in one `withTransactionAsync`:** INSERT illness then INSERT first episode with `notedAt = createdAt` (same timestamp); return illness. Never commit an illness without its first episode.
  - `listIllnesses(db)` → newest first (`ORDER BY created_at DESC, id DESC`).
  - `getIllnessById(db, id)` → illness or null.
  - Fail loud.

- **`src/db/episodes.ts`:**
  - `createEpisode(db, { illnessId, notedAt? })` — require illness exists; `notedAt` default now ISO; `createdAt` now; INSERT; return row.
  - `listEpisodesForIllness(db, illnessId)` → oldest first (`ORDER BY noted_at ASC, id ASC`).
  - `countEpisodesByIllnessIds(db, ids)` → `Record<number, number>`; empty ids → `{}` no query.
  - **Required** for list preview: `latestEpisodeNotedAtByIllnessIds(db, ids): Record<number, string>` — empty ids → `{}` no query; otherwise one SELECT for those ids, fold in JS to the latest `noted_at` per `illness_id` (same empty-`IN ()` guard as `listLatestSolutionsByInjuryIds`).

- **`src/db/tactics.ts`:**
  - `createSymptomTactic(db, { illnessId, body, url? })` — trim body (throw if empty); url empty → null; non-empty must pass `isHttpUrl`; require illness exists; INSERT; return.
  - `listSymptomTacticsForIllness(db, illnessId)` → newest first (`ORDER BY created_at DESC, id DESC`).
  - No remove/soft-delete.

- **Backup:**
  - `BackupPayload`: add `illnesses`, `episodes`, `tactics`; keep `formatVersion: 1`; `schemaVersion` follows `DATABASE_VERSION` (7).
  - `dumpBackup`: SELECT all three ordered by id.
  - `parseBackupJson`: require the three arrays; parse each field; tactic url null or http(s) string (reject non-http if present — store as stored; parse allows null/string; if non-empty string, optionally validate with `isHttpUrl` like solutions don’t currently re-validate protocol on parse — match solutions: accept string/null without re-running isHttpUrl on parse for parity, OR validate — prefer validate http(s) on parse for tactics when url non-null to fail loud).
  - `replaceFromBackup`: DELETE illness children then illnesses (and existing injury deletes unchanged). Suggested delete order: events, comments, solutions, readings, injuries, episodes, tactics, illnesses — or: episodes, tactics, illnesses alongside injury deletes. Insert: injuries…readings as today, then illnesses → episodes → tactics. Validate episode/tactic illnessId exists in payload illnesses set.

- **UI:**
  - Home (`src/app/index.tsx`): header **Illnesses** link → `/illnesses` (ref guard).
  - `src/app/illnesses/index.tsx`: list name + “N episodes” (+ latest noted date if count > 0); empty state; **Log illness** → `/illnesses/new`.
  - `src/app/illnesses/new.tsx`: name (required), notes (optional); Save with **ref** re-entry guard; `router.replace` to detail.
  - `src/app/illnesses/[id].tsx`: ScrollView + `keyboardShouldPersistTaps="handled"`; header fields; Episodes section (count, list, Log episode with ref guard); Symptom tactics section (compose body+url, list, Open link via Linking; same http(s) rules as solutions — do not gate on `canOpenURL`).
  - English labels; no clinical wording.

## Standards to apply

- `context/standards/global/conventions.md` — `src/domain` / `src/db` / app routes; fail loud.
- `context/standards/global/minimal-implementation.md` — illness log only; no archive, no map, no remove tactics.
- `context/standards/global/coding-style.md` — Themed* / `@/` / English UI; terms illness / episode / symptom tactic.
- `context/standards/global/sqlite.md` — WAL outside tx; DDL + `user_version` in one transaction.
- `context/standards/frontend/navigation.md` — ref guard on create / add episode / add tactic / home navigate.

## Lessons in play

- Make schema version bumps atomic with DDL — **in play** (`migrate.ts` v7).
- Guard async navigation against double tap — **in play** for create/add presses.
- Hide the splash on DB init failure — not in play.

## Assumptions

- Automated criterion is `npx tsc --noEmit` (no test runner; do not add one).
- Creating an illness always creates the first episode at the same timestamp.
- Episode `notedAt` defaults to “now”; no date picker required for v1 (manual date entry out of scope unless trivial ISO field — default now only).
- Tactics have no soft-delete.
- Old schema-6 backups remain unrestorable (existing exact schemaVersion match).
- Single change covering list + episodes + tactics (roadmap §8), phased internally.

## Phase 1: Schema v7, illness APIs, backup

### Overview

Migration to v7, domain types, illnesses/episodes/tactics db modules, backup dump/parse/replace. No UI.

### Changes Required

- File: `src/db/migrate.ts` — Intent: bump to v7 with three illness tables on all upgrade paths. Contract: Critical Details migrate structure; never leave user_version=7 without the tables.
- File: `src/domain/illness.ts` — Intent: Illness, IllnessEpisode, SymptomTactic types. Contract: as Critical Details.
- File: `src/db/illnesses.ts` — Intent: create (with first episode in one transaction), list, getById. Contract: Critical Details.
- File: `src/db/episodes.ts` — Intent: create, list, counts, latest noted-at by ids. Contract: Critical Details.
- File: `src/db/tactics.ts` — Intent: create + list. Contract: Critical Details; reuse `isHttpUrl`.
- File: `src/domain/backup.ts` — Intent: extend BackupPayload. Contract: illnesses, episodes, tactics arrays.
- File: `src/db/backup.ts` — Intent: dump/parse/replace for the three collections. Contract: schemaVersion 7; delete/insert order safe; fail loud on bad rows.

### Success Criteria

#### Automated

- `npx tsc --noEmit` exits 0.

#### Manual

- (none in this phase)

## Phase 2: Illnesses UI (list, create, detail)

### Overview

Home entry + list + create + detail with episodes and symptom tactics (Linking).

### Changes Required

- File: `src/app/index.tsx` — Intent: header Illnesses link to `/illnesses`. Contract: ref guard like other header actions.
- File: `src/app/illnesses/index.tsx` — Intent: list illnesses with episode frequency preview; navigate to create/detail. Contract: fail loud on load error; empty state; ref guards.
- File: `src/app/illnesses/new.tsx` — Intent: create form. Contract: required name; optional notes; ref guard on save; replace to detail.
- File: `src/app/illnesses/[id].tsx` — Intent: detail with episodes + tactics. Contract: Critical Details UI; Linking only after `isHttpUrl`.

### Success Criteria

#### Automated

- `npx tsc --noEmit` exits 0.

#### Manual

- Create illness → appears on list with 1 episode; add episode → count updates; add tactic with https URL → opens in browser; force-stop → data remains; export then restore on same build → illness data round-trips.
- Confirm no diagnosis/advice copy on illness screens.

## Testing Strategy

- Automated: TypeScript check only (`npx tsc --noEmit`).
- Manual: Android smoke for create/list/detail/episodes/tactics/Linking/backup as above.
- Do not add jest or Playwright.

## References

- `context/changes/illness-disease-log/ticket.md`
- `context/changes/illness-disease-log/frame.md`
- `context/foundation/roadmap.md` §8
- `context/standards/global/sqlite.md`
- `context/archive/2026-08-29-injury-thread/plan.md` (solutions/Linking pattern)
- `context/archive/2026-08-29-severity-trend/plan.md` (schema bump + backup pattern)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Schema v7, illness APIs, backup

#### Automated

- [x] 1.1 Schema v7 migration with illness tables on all paths — a38d950
- [x] 1.2 Domain types + illnesses/episodes/tactics db modules — a38d950
- [x] 1.3 Backup dump/parse/replace for illnesses, episodes, tactics — a38d950
- [x] 1.4 `npx tsc --noEmit` exits 0 — a38d950

#### Manual

- (none)

### Phase 2: Illnesses UI (list, create, detail)

#### Automated

- [x] 2.1 Home Illnesses link + list/create/detail screens — f785df0
- [x] 2.2 Episodes and symptom tactics (incl. Linking) on detail — f785df0
- [x] 2.3 `npx tsc --noEmit` exits 0 — f785df0

#### Manual

- [ ] 2.4 Android smoke: create, episodes, tactics URL, force-stop, backup round-trip
- [ ] 2.5 Confirm no diagnosis/advice copy on illness screens
