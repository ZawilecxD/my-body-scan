# Frame: export-backup

## Problem (observed, not assumed)

Injury data lives only in on-device SQLite. Uninstall, wipe, or phone swap destroys the log with no recovery path. Post-MVP §5 and a pre-publish backup story are blocked.

## Chosen direction + why

Versioned JSON dump of all four tables (injuries, comments, solutions including `removed_at`, injury_events), written to cache and shared via the system share sheet; restore via document picker with **replace-all** semantics (wipe then insert preserving IDs) inside one transaction. New `/backup` screen linked from home `headerRight` (same pattern as Archive). Explicit deps: `expo-file-system`, `expo-sharing`, `expo-document-picker` via `npx expo install`. No schema bump — payload carries `formatVersion` + `schemaVersion` (5).

## Explicitly not doing

- Cloud sync, accounts, multi-device live sync
- Merge/diff restore (replace-all only)
- Raw `.db` file copy as the product format
- Physio PDF/summary (slice 7)
- Encrypting the export file
- Test runner / jest-expo / Playwright
- iOS polish beyond what Expo packages require; web

## Assumptions

- One change, not an effort.
- Automated gate is `npx tsc --noEmit` (no test runner; do not add one).
- JSON uses domain camelCase field names; `formatVersion: 1`; reject unknown format or schemaVersion ≠ current `DATABASE_VERSION`.
- Restore validates each `landmarkId` (and limb when set) against the catalog; fail loud before mutating if invalid.
- Restore confirmation via `Alert.alert` (destructive replace).
- Double-tap / re-entry ref guards on Export, Restore, and navigate (navigation.md).
- Home gets a Backup link beside Archive / Log injury.
- `expo-file-system` is declared explicitly (not only transitive); use modern `File` / `Paths` API (`write`, `text`).
- Android-first; document-picker iCloud plugin only if required for this app’s iOS config — do not expand iOS scope.

## Abort-if

- Ticket were multi-slice (e.g. plus cloud) — it is not.
- No runnable Automated criterion — `npx tsc --noEmit` exists.
- Shared UI-kit / cross-app contract change — none.
