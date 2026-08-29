---
change_id: export-backup
review: impl-review
created: 2026-08-29
reviewer: 11x-impl-review (report-only)
commits: [125e9f4, 572a610]
---

# Implementation review: export-backup

## Verdict

**Ship-ready** (feature gate). `npx tsc --noEmit` exits 0, both phases match their Changes Required /
Contract tables, and the restore path is safe: all validation (JSON shape, `formatVersion`,
`schemaVersion`, enums, landmark catalog) runs **before** any mutation, and the wipe+insert is wrapped in
a single `withTransactionAsync` so a mid-restore failure rolls back and preserves live data. The C1
landmine from plan-review (`DELETE FROM sqlite_sequence`) was correctly not implemented.

Critical: 0 · Suggestions: 3 · Nice-to-have: 6

Manual criteria 1.3 and 2.3 (device round-trip, force-stop persistence) remain the only unverified
gates — expected for report-only; nothing in the code blocks them.

---

## Facet: Drift (code vs phase Changes Required / Contract)

Phase 1 and Phase 2 tables are honored:

- `migrate.ts` → `export const DATABASE_VERSION = 5` present; migrate behavior unchanged.
- `src/domain/backup.ts` → `BackupPayload` with `formatVersion`/`schemaVersion`/`exportedAt` + four arrays. ✓
- `src/db/backup.ts` → `dumpBackup`, `parseBackupJson`, `replaceFromBackup`; landmark validation before wipe. ✓
- `package.json` → `expo-file-system`, `expo-sharing`, `expo-document-picker` via pinned `~57.x`. ✓
- `src/app/backup.tsx` → Export (dump → cache File → shareAsync) and Restore (pick → parse → Alert → replace)
  with ref guards. ✓
- `src/app/index.tsx` → `headerRight` Backup link with `navigating` ref guard beside Archive / Log injury. ✓

One intentional deviation worth flagging so nobody "fixes" it (see N4): the Phase‑1 table still describes
`replaceFromBackup` as "wipe+insert+**sequence reset**". The code correctly omits the sequence reset — this
matches the C1-corrected Critical Details, not the stale table cell.

## Facet: Safety (dangerous decisions, error handling, data loss)

Strong. No Critical data-loss risks found.

- Validate-before-wipe: `parseBackupJson` fully validates the file, then `confirmReplace` gates on a
  destructive `Alert`, then `assertPayloadReadyForReplace` re-checks format/schema/landmark before the
  transaction opens. A malformed or wrong-schema file is rejected with live data intact.
- Atomic restore: `DELETE`×4 + inserts run inside one `withTransactionAsync`; any insert throw rolls back
  the wipe. ✓ (`sqlite.md`).
- Fail-loud everywhere: sharing-unavailable throws; JSON/enum/shape errors throw with the offending index
  and label; no error swallowing. ✓ (`conventions.md`).
- No PII in logs: no `console.log` of payload bodies; error messages carry ids/labels only. ✓
- `File.write()` on the unique timestamped (non-existent) path is safe — the Android native
  `FileSystemFile.write` does `if (!exists) { create() }` internally, so export does not depend on a prior
  `create()` call. Verified in `node_modules/expo-file-system/android/.../FileSystemFile.kt`.

## Facet: Patterns & standards

- `navigation.md` — ref guards (`exporting`/`restoring`/`navigating`) set synchronously and cleared in
  `finally` / on focus; not `useState`/`disabled`. ✓
- `sqlite.md` — restore mutations in one transaction; no schema bump; WAL untouched. ✓
- `coding-style.md` / `coding conventions` — `@/` imports, English UI ("Backup"/"Export"/"Restore"),
  `Themed*` components, `Spacing` tokens, no dead imports, no TODO/HACK. ✓
- `minimal-implementation.md` — dump/restore + one screen + one home link; read-side mappers duplicated
  locally rather than exported (allowed per plan N4). One scope nit: an unused `expo-sharing` config plugin
  (S1).
- Lessons: "Guard async navigation against double tap" — in play and applied on the Backup link and
  Export/Restore. The two DB/splash lessons are correctly not in play (no schema bump).

## Facet: Type gate

Feature change → sole automated gate is `npx tsc --noEmit`. Ran it: **exits 0** ("No errors found"). No
extra gate (no lint/test runner) added or required. ✓

## Facet: Coverage (automated success criteria)

- Phase 1 automated (`tsc --noEmit` = 0): exercised and passing. ✓
- Phase 2 automated (`tsc --noEmit` = 0): exercised and passing. ✓
- Manual 1.3 / 2.3 (device export→restore, open/archive/thread/history match, force-stop persist): not
  exercised (report-only, no device). Not claimed done in `## Progress`.

---

## Suggestions

### S1 — Unnecessary `expo-sharing` config plugin in `app.json`

`572a610` adds `"expo-sharing"` to `app.json` `plugins`. The `expo-sharing` config plugin exists only to
make the app a share **target** (iOS share extension / Android intent filters). This feature only
*initiates* sharing via `Sharing.shareAsync`, which needs no config plugin. The addition also mildly
contradicts the plan (which only contemplated an `expo-document-picker` plugin "if required" and warned
against expanding iOS scope). It is harmless (valid bare-string plugin, defaults), so not Critical.
**Fix:** Remove `"expo-sharing"` from `app.json` `plugins`. Leave `expo-document-picker` out (its plugin
is iCloud-only, not needed on Android). Confirm `npx expo config` / prebuild still resolves.

### S2 — No referential-integrity check on child rows before restore (carried from plan N1)

No table declares a `FOREIGN KEY`, so a hand-edited backup with a `comment`/`solution`/`event` pointing at
a missing `injury_id` (or an `event.solutionId` pointing at a missing solution) restores as silent orphan
data — the transaction succeeds and the wipe is permanent.
**Fix:** In `assertPayloadReadyForReplace`, build `Set` of injury ids (and solution ids) from the payload
and throw if any child `injuryId`/`solutionId` is unresolved, before the transaction. Keeps the fail-loud,
fail-before-wipe contract.

### S3 — `replaceFromBackup` trusts payload enums; validation lives only in `parseBackupJson`

Enum/shape checks (`status`, event `type`, `limb`, required strings) run in `parseBackupJson`, not in
`replaceFromBackup`. The UI always calls parse→replace, so this is fine today, but `replaceFromBackup` is
a public function whose only runtime guard is `assertPayloadReadyForReplace` (format/schema/landmark).
**Fix:** Either document that `replaceFromBackup` requires a `parseBackupJson`-validated payload, or move
the per-row enum assertions into `assertPayloadReadyForReplace` so both entry points fail loud identically.

---

## Nice-to-have

- **N1 — Export success message on a cancelled share.** On Android `Sharing.shareAsync` resolves whether
  the user completes or dismisses the sheet, so `setMessage("Exported N injuries.")` shows even on
  dismiss. Cosmetic. Consider softening the copy (e.g. "Backup ready to share").
- **N2 — Redundant `delete()` before `write()`.** `write()` with default `append:false` truncates and
  auto-creates, so the `if (file.exists) file.delete()` block in `onExport` is dead weight for a unique
  timestamped name. Optionally drop it or switch to `file.create({ overwrite: true })` for clarity.
- **N3 — Double landmark validation.** Landmark is checked in both `parseInjury` and
  `assertPayloadReadyForReplace`. Harmless; keep one if simplifying.
- **N4 — Plan Phase‑1 table still says "sequence reset".** Code correctly omits it (post-C1). Align the
  plan cell (`plan.md` Phase 1 Changes Required) with the Critical Details to avoid a future "missing
  step" false alarm. Doc-only.
- **N5 — Strict `schemaVersion` equality (carried from plan N3).** Every v5 export becomes permanently
  unrestorable once `DATABASE_VERSION` bumps to 6 — relevant to the ticket's "restore on a new device"
  story. Correct for this change; record it as a known limitation in `plan.md` Assumptions / What We're
  NOT Doing so it is a decision, not a surprise.
- **N6 — Dump mapper `parseLimbField` (strict) diverges from read-side `parseLimb` (lenient).**
  `dumpBackup` throws on a stored limb value the running app would silently coerce to `null`. Extremely
  unlikely with app-written data; noting only for mapper-drift awareness.

---

## Axis summary

- **Substance** — Real dump/replace + screen + link; validation is thorough and boundary-first.
- **Feasibility** — Uses SDK 57 `File`/`Paths` + `expo-sharing` + `expo-document-picker` correctly
  (`write` auto-creates on Android; `copyToCacheDirectory` yields a `file://` URI the `File` API reads).
- **Architectural fitness** — Correct seams (`src/db/backup.ts`, `src/domain/backup.ts`, `/backup`
  mirroring the `headerRight` pattern); explicit-ID raw inserts avoid the create-helper double-insert trap.
- **Safety** — Validate-then-confirm-then-transactional-replace; no wipe-before-fail window.
- **Progress hygiene** — Automated steps map to commits (125e9f4, 572a610); manual steps honestly pending.
