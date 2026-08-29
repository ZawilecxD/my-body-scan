---
change_id: severity-trend
created: 2026-08-29
---

# Plan: Severity trend

## Overview

Let Mateusz record integer 0–10 severity/pain readings on an open injury over time and see them as a chronological list plus a minimal SVG sparkline on injury detail. Schema v6 adds `severity_readings`; backup dump/restore includes the table. No diagnosis or advice (FR-19).

## Current State

Schema v5: injuries, comments, solutions (`removed_at`), `injury_events`. Injury detail shows Solutions, Comments, History. Backup `formatVersion: 1` / `schemaVersion: 5` dumps those four collections. No severity field or readings. Automated gate: `npx tsc --noEmit`. Chart libs: none; `react-native-svg` used for body map.

## Desired End State

On Android, Mateusz can:

1. Open an open injury → add a severity reading (integer 0–10 inclusive).
2. See readings for that injury oldest→newest with timestamps, plus a simple SVG polyline trend when ≥2 points.
3. Open an archived injury → see readings and trend; cannot add.
4. Force-stop → readings still present (FR-18).
5. Export/restore → readings round-trip with schemaVersion 6.

## What We're NOT Doing

- Diagnosis, advice, color-coded clinical interpretation (FR-19)
- Edit/delete readings; confirm dialogs; undo
- Folding readings into `injury_events` History
- Global severity timeline across injuries
- New chart library / jest-expo / Playwright
- Physio PDF (slice 7); iOS polish

## Approach

Bump to schema v6 with `severity_readings`. Domain type + `src/db/readings.ts` (create/list). Wire detail UI: Severity section (compose when open, list, SVG sparkline). Extend `BackupPayload` + dump/parse/replace. Prefer SVG polyline over a new dependency.

## Critical Details

- **Schema v6** (atomic with `user_version`, per `sqlite.md`):
  - `DATABASE_VERSION = 6`.
  - WAL outside transaction (unchanged).
  - **`severity_readings` DDL:**
    ```
    id INTEGER PRIMARY KEY NOT NULL,
    injury_id INTEGER NOT NULL,
    value INTEGER NOT NULL,
    created_at TEXT NOT NULL
    ```
  - **Required migrate structure (plan-review C1):** today’s `V5_FROM_EXISTING` ends with `PRAGMA user_version = ${DATABASE_VERSION}`. After bumping `DATABASE_VERSION` to 6, that would stamp version 6 **without** `severity_readings`. Do this instead:
    1. Strip `PRAGMA user_version = …` from the shared V5 SQL fragment (rename e.g. `V5_SCHEMA_FROM_EXISTING`: only ALTER `removed_at` / events DDL / backfill).
    2. Define `V6_FROM_V5` = `CREATE TABLE IF NOT EXISTS severity_readings (…); PRAGMA user_version = 6;`
    3. **`user_version === 0`:** one transaction = full current schema including `severity_readings` + `user_version = 6` only (no intermediate version 5 stamp).
    4. **`user_version` in 1..4:** one transaction = existing limb/archived/comments/solutions setup + V5 fragment **without** version pragma + `V6_FROM_V5`. Readings CREATE must run before the only `user_version = 6`.
    5. **`user_version === 5`:** one transaction = `V6_FROM_V5` only — do **not** re-run the V5 fragment (would fail on `ADD COLUMN removed_at` / duplicate event backfill).
    6. Never run a transaction that sets `user_version = 6` unless that same transaction created `severity_readings`.
  - No backfill of readings (empty history is fine).

- **Domain (`src/domain/injury.ts`):**
  - `SeverityReading = { id, injuryId, value: number, createdAt }`
  - Value contract: integer 0–10 inclusive (enforce in create + backup parse).

- **`src/db/readings.ts`:**
  - `createSeverityReading(db, { injuryId, value })` — trim not applicable; reject non-integer / out of range; require injury exists and `status === 'open'`; ISO `createdAt`; INSERT; return row.
  - `listSeverityReadingsForInjury(db, injuryId)` → oldest first (`ORDER BY created_at ASC, id ASC`).
  - Fail loud with clear Error messages.

- **Backup:**
  - `BackupPayload`: add `readings: SeverityReading[]`; keep `formatVersion: 1`; `schemaVersion` follows `DATABASE_VERSION` (6).
  - `dumpBackup`: SELECT all readings ordered by id.
  - `parseBackupJson`: require `readings` array; parse each reading (id, injuryId, value 0–10 int, createdAt).
  - `replaceFromBackup`: DELETE readings with other tables (before or after children — delete readings before injuries or after; order: events/comments/solutions/readings then injuries, or delete readings alongside other children); INSERT after injuries. Suggested delete order: `injury_events`, `comments`, `solutions`, `severity_readings`, `injuries`. Insert: injuries → comments → solutions → events → readings.

- **Detail UI (`src/app/injuries/[id].tsx`):**
  - Load readings with thread.
  - **Severity** section (place between Solutions and Comments, or above History — prefer between Solutions and Comments):
    - When open: compose — numeric input or discrete 0–10 control (simple `TextInput` keyboardType number-pad + Add is enough); ref guard on Add; clear input after success; reload readings.
    - List: value + timestamp (match Comments styling).
    - When ≥2 readings: small SVG polyline (normalized to viewBox width/height); no axes labels required beyond optional min/max; no library.
  - Archived: list + chart only; no compose.
  - English labels: “Severity”, “Add”, empty state “No severity readings yet.”
  - Do **not** emit `injury_events` for readings.

- **Optional tiny component:** `src/components/severity-trend-chart.tsx` if the SVG block would clutter the screen file — only if it keeps the screen readable; otherwise inline is fine per minimal-implementation.

## Standards to apply

- `context/standards/global/conventions.md` — extend `src/db/` / domain / detail; fail loud.
- `context/standards/global/minimal-implementation.md` — readings table + detail + backup only; SVG not a chart lib.
- `context/standards/global/coding-style.md` — Themed* / `@/` / English UI.
- `context/standards/global/sqlite.md` — WAL outside tx; DDL + `user_version` in one transaction.
- `context/standards/frontend/navigation.md` — ref guard on Add reading.

## Lessons in play

- Make schema version bumps atomic with DDL — **in play** (`migrate.ts` v6).
- Guard async navigation against double tap — **in play** for Add reading.
- Hide the splash on DB init failure — not in play.

## Assumptions

- Automated criterion is `npx tsc --noEmit` (no test runner; do not add one).
- Integer 0–10 inclusive; user-typed; no clinical interpretation copy.
- Readings are a separate section, not History events.
- No edit/delete.
- Old schema-5 backups remain unrestorable (existing `schemaVersion === DATABASE_VERSION` rule).
- `npm run lint` is not the gate if it needs extra config; `tsc` is the Automated gate.

## Phase 1: Schema v6, readings API, backup

### Overview

Migration to v6, domain type, `readings.ts`, backup dump/parse/replace for readings. No UI.

### Changes Required

- File: `src/db/migrate.ts` — Intent: bump to v6 with `severity_readings` on all upgrade paths. Contract: v0 creates full schema at 6; v1–5 end at 6 with readings table present; never leave user_version=6 without the table.
- File: `src/domain/injury.ts` — Intent: add `SeverityReading`. Contract: `{ id, injuryId, value, createdAt }`.
- File: `src/db/readings.ts` — Intent: create + list. Contract: open-only create; value 0–10 integer; list oldest first; fail loud.
- File: `src/domain/backup.ts` — Intent: add `readings` to payload. Contract: `readings: SeverityReading[]`.
- File: `src/db/backup.ts` — Intent: dump/parse/replace readings. Contract: array required; value validated; delete/insert order safe with FK-less tables.

### Success Criteria

#### Automated

- `npx tsc --noEmit` exits 0.

#### Manual

- Spot-check migrate/readings/backup contracts (no UI).

## Phase 2: Injury detail Severity UI + trend

### Overview

Severity section on injury detail: compose (open), list, SVG sparkline when ≥2 points.

### Changes Required

- File: `src/app/injuries/[id].tsx` — Intent: load/reload readings; Severity section; open-only compose with ref guard. Contract: archived read-only; empty state; timestamps; no History events.
- File: `src/components/severity-trend-chart.tsx` (optional) — Intent: SVG polyline from readings. Contract: renders for ≥2 points; uses theme colors; no new deps.

### Success Criteria

#### Automated

- `npx tsc --noEmit` exits 0.

#### Manual

- Device: add several readings on an open injury → list + sparkline; archive → no compose; force-stop → data remains; export/restore includes readings.

## Testing Strategy

- Automated: `npx tsc --noEmit` after each phase.
- Manual: device checklist above (handoff). No new test runner.

## References

- `context/changes/severity-trend/ticket.md`
- `context/changes/severity-trend/frame.md`
- `context/foundation/roadmap.md` §6
- `context/foundation/prd.md` FR-18, FR-19
- `context/archive/2026-08-29-export-backup/plan.md` (backup contracts)
- `context/archive/2026-08-29-injuries-history/plan.md` (migrate pattern)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Schema v6, readings API, backup

#### Automated

- [x] 1.1 Schema v6 + SeverityReading + readings.ts — 116b83b
- [x] 1.2 Backup dump/parse/replace includes readings — 116b83b
- [x] 1.3 tsc --noEmit passes — 116b83b

#### Manual

- [ ] 1.4 Spot-check migrate/readings/backup contracts (no UI)

### Phase 2: Injury detail Severity UI + trend

#### Automated

- [x] 2.1 Severity section compose + list on injury detail — cdceffd
- [x] 2.2 SVG sparkline for ≥2 readings — cdceffd
- [x] 2.3 tsc --noEmit passes — cdceffd

#### Manual

- [ ] 2.4 Device: add readings, sparkline, archive read-only, force-stop, backup round-trip
