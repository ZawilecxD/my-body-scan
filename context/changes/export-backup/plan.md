---
change_id: export-backup
created: 2026-08-29
---

# Plan: Export / backup injury data

## Overview

Ship on-device export and replace-restore of the full injury log as versioned JSON so uninstall or phone swap does not lose data. Dump/restore in `src/db/backup.ts`; `/backup` screen with share + document picker; home Backup link.

## Current State

Schema v5: `injuries`, `comments`, `solutions` (with `removed_at`), `injury_events`. CRUD is per-entity and often filtered (`status = 'open'`, `removed_at IS NULL`) — no bulk dump/restore. No settings/backup screen. `expo-file-system` is transitive only; no `expo-sharing` / `expo-document-picker`. Automated gate: `npx tsc --noEmit`.

## Desired End State

On Android, Mateusz can:

1. Open Backup from home, export a JSON file of all injuries (open + archived), comments, solutions (including soft-deleted), and events, and share/save it via the system share sheet.
2. Pick a prior export file and restore it (after confirm), replacing all local injury data while preserving IDs and relationships.
3. After restore (and after force-stop), open list, archive, threads, and history match the backup (FR-18).
4. No cloud, accounts, or merge semantics.

## What We're NOT Doing

- Cloud sync / accounts
- Merge restore (replace-all only)
- Raw SQLite `.db` as the user-facing format
- Encryption, physio PDF (slice 7)
- Test runner / jest-expo / Playwright
- iOS-only plugins beyond what Expo install requires for the packages used
- Schema version bump (stay on v5)

## Approach

Add `BackupPayload` + parse/validate helpers; `dumpBackup(db)` reading all four tables unfiltered; `replaceFromBackup(db, payload)` in one `withTransactionAsync` (DELETE all rows + clear `sqlite_sequence` + INSERT with explicit IDs). Install `expo-file-system`, `expo-sharing`, `expo-document-picker`. `/backup` screen: Export writes JSON to `Paths.cache` then `Sharing.shareAsync`; Restore uses `DocumentPicker.getDocumentAsync` → `File.text()` → validate → `Alert` confirm → replace → success message. Home `headerRight` Backup link with ref guard.

## Critical Details

- **Payload (`formatVersion: 1`):**
  ```ts
  {
    formatVersion: 1,
    schemaVersion: 5, // must equal DATABASE_VERSION
    exportedAt: string, // ISO
    injuries: Injury[],
    comments: Comment[],
    solutions: Solution[],
    events: InjuryEvent[],
  }
  ```
  Domain camelCase. Reject if `formatVersion !== 1` or `schemaVersion !== 5` or arrays missing / wrong shapes. Fail loud with a clear Error message.

- **Dump SQL:** `SELECT … FROM injuries|comments|solutions|injury_events` with no status/`removed_at` filters; map rows the same way existing modules do (reuse mappers if exported, or duplicate the small map functions in `backup.ts` — prefer importing private-adjacent mappers only if already exported; otherwise keep mapping local in `backup.ts`).

- **Replace contract (one transaction):**
  1. Validate payload (incl. every injury `landmarkId` via `getLandmarkById`; if `limb` set, must be valid for that landmark / catalog rules already used by create).
  2. `DELETE FROM injury_events; DELETE FROM comments; DELETE FROM solutions; DELETE FROM injuries;`
  3. Insert rows with explicit `id` columns in dependency order: injuries → comments → solutions → events.
  4. Commit. Callers reload UI on focus.
  Do **not** touch `sqlite_sequence` — tables use plain `INTEGER PRIMARY KEY` (no `AUTOINCREMENT`), so that table does not exist and a DELETE would abort the transaction. Explicit IDs make a sequence reset unnecessary; SQLite will allocate later inserts above `max(id)`.

- **Export file:** `my-body-scan-backup-YYYYMMDD-HHmmss.json` under `Paths.cache`; `mimeType: 'application/json'`. If sharing unavailable, fail loud.

- **UI:** English labels “Backup”, “Export”, “Restore”; show last error / success on screen; ref guards on Export, Restore, and navigate; confirm copy: restoring replaces all local injury data.

- **Deps:** `npx expo install expo-file-system expo-sharing expo-document-picker`. Add `"expo-document-picker"` to `app.json` plugins only if the package docs require it for this project’s platforms; do not add iCloud / `usesIcloudStorage` (Android-first).

- **Export `DATABASE_VERSION`:** export a constant from `migrate.ts` (or a tiny `src/db/version.ts`) so backup validation does not hardcode `5` in two places — minimal: `export const DATABASE_VERSION = 5` from `migrate.ts`.

## Standards to apply

- `context/standards/global/conventions.md` — code in `src/db/` + `src/app/`; fail loud; no PII in logs (do not console.log backup bodies).
- `context/standards/global/minimal-implementation.md` — dump/restore + one screen only.
- `context/standards/global/coding-style.md` — Themed* / `@/` / English UI.
- `context/standards/global/sqlite.md` — restore mutations in one `withTransactionAsync` (no schema bump / WAL change required).
- `context/standards/frontend/navigation.md` — ref guards on navigate and export/restore presses.

## Lessons in play

- Guard async navigation against double tap — **in play** (Backup link + Export/Restore).
- Make schema version bumps atomic with DDL — not in play (no bump).
- Hide the splash on DB init failure — not in play.

## Assumptions

- Automated criterion is `npx tsc --noEmit` (no test runner; do not add one).
- Replace-all restore with confirm; no merge.
- JSON formatVersion 1; schemaVersion must match live `DATABASE_VERSION`.
- Preserve IDs on restore.
- Soft-deleted solutions and all events are included in the dump.
- Landmark catalog validation on restore; unknown landmark fails before wipe.
- Home Backup link; no full settings shell.
- `npm run lint` is not the gate; `tsc` is.

## Phase 1: Backup dump and replace API

### Overview

Domain/payload types, export `DATABASE_VERSION`, `src/db/backup.ts` dump + replace. No UI, no new packages yet.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/db/migrate.ts` | Export version | `export const DATABASE_VERSION = 5` (keep migrate behavior). |
| `src/domain/backup.ts` (or types in `injury.ts`) | Payload type | `BackupPayload` with formatVersion/schemaVersion/exportedAt + four arrays. Prefer `src/domain/backup.ts` to avoid bloating injury.ts. |
| `src/db/backup.ts` | Dump + replace | `dumpBackup(db): Promise<BackupPayload>`; `parseBackupJson(text): BackupPayload` (validate); `replaceFromBackup(db, payload): Promise<void>` transactional wipe+insert+sequence reset; landmark validation before wipe. |

### Success Criteria

#### Automated

- `npx tsc --noEmit` exits 0.

#### Manual

- Spot-check dump/replace contracts (no UI).

## Phase 2: Packages, Backup screen, home link

### Overview

Install FS/share/picker packages; `/backup` UI; home header link.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `package.json` / lockfile / `app.json` | Deps | `expo-file-system`, `expo-sharing`, `expo-document-picker` via `npx expo install`; plugin only if required. |
| `src/app/backup.tsx` | Export + Restore UI | Export → dump → write cache File → shareAsync (ref guard). Restore → pick → parse → Alert confirm → replaceFromBackup → success/error (ref guard). |
| `src/app/index.tsx` | Entry | `headerRight` Backup link → `/backup` with navigating ref guard (alongside Archive / Log injury). |

### Success Criteria

#### Automated

- `npx tsc --noEmit` exits 0.

#### Manual

- On device: export a non-empty log; clear/restore (or second install path); open/archive/thread/history match; force-stop persists; confirm dialog blocks accidental replace.

## Testing Strategy

- Automated: `npx tsc --noEmit` after each phase.
- Manual: Android emulator round-trip export → restore.
- No new test runner.

## References

- `context/changes/export-backup/ticket.md`
- `context/changes/export-backup/frame.md`
- `context/foundation/roadmap.md` §5
- `context/foundation/prd.md` (FR-18, FR-19)
- Expo SDK 57: `expo-file-system` File/Paths, `expo-sharing`, `expo-document-picker`
- `context/standards/global/sqlite.md`
- `context/standards/frontend/navigation.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Backup dump and replace API

#### Automated

- [x] 1.1 Domain payload, DATABASE_VERSION export, dumpBackup / parseBackupJson / replaceFromBackup — 125e9f4
- [x] 1.2 `npx tsc --noEmit` exits 0 — 125e9f4

#### Manual

- [ ] 1.3 Spot-check dump/replace contracts (no UI)

### Phase 2: Packages, Backup screen, home link

#### Automated

- [x] 2.1 Install packages; `/backup` screen; home Backup link — 572a610
- [x] 2.2 `npx tsc --noEmit` exits 0 — 572a610

#### Manual

- [ ] 2.3 Device: export → restore round-trip + force-stop persist
