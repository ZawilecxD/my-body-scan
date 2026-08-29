---
change_id: export-backup
review: plan-review
created: 2026-08-29
reviewer: 11x-plan-review (report-only)
---

# Plan review: export-backup

## Verdict

Executable **after one Critical fix**. The plan is concrete (File/Intent/Contract tables, explicit payload
shape, transactional replace contract), scoped correctly to the `feature` gate (`npx tsc --noEmit`, no test
runner), and honors the cited standards and lessons. One step in the replace contract is a correctness landmine
that will abort every restore on this schema if implemented literally — that must be removed before execution,
especially since `change.md` sets `mode: unattended`.

Critical: 1 · Suggestions: 2 · Nice-to-have: 4

---

## Critical

### C1 — `DELETE FROM sqlite_sequence` will throw and roll back every restore

The replace contract step 3 (`plan.md` "Replace contract", and Phase-1 `dumpBackup/replaceFromBackup` contract)
runs:

```
DELETE FROM sqlite_sequence WHERE name IN ('injuries','comments','solutions','injury_events');
```

`sqlite_sequence` only exists once a table is created with `AUTOINCREMENT`. Every table in this schema uses a
plain rowid alias, not `AUTOINCREMENT`:

```71:79:src/db/migrate.ts
CREATE TABLE IF NOT EXISTS injuries (
  id INTEGER PRIMARY KEY NOT NULL,
  landmark_id TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  limb TEXT,
  archived_at TEXT
);
```

So `sqlite_sequence` never exists in this database. Executing that `DELETE` throws `no such table:
sqlite_sequence`, which — inside the single `withTransactionAsync` — aborts the transaction and rolls back the
wipe+insert, so **restore fails 100% of the time**. The plan hedges with "ignore if table absent … use try or
check", which contradicts listing it as a required numbered step and leaves an unattended executor to implement
the literal `DELETE`.

The step is also unnecessary: rows are inserted with explicit `id` values, and with no `AUTOINCREMENT` there is
no sequence counter to reset — the rowid high-water mark is irrelevant because IDs are never auto-assigned on
restore.

**Fix:** Delete the `sqlite_sequence` step from the replace contract (Critical Details) and from the Phase-1
`replaceFromBackup` contract. The transaction becomes: validate → `DELETE` the four tables → insert rows with
explicit IDs → commit.

**Triage (unattended):** Applied — `sqlite_sequence` step removed from `plan.md` Critical Details.

---

## Suggestions

### S1 — `parseBackupJson` must validate enum/shape fields, not just `landmarkId`, before the wipe

The validation contract only calls out rejecting bad `formatVersion`/`schemaVersion`/array shapes and validating
`landmarkId` (+ `limb`). But the read-side mappers fail loud on unknown enum values:

```189:194:src/db/injuries.ts
function parseStatus(value: string, injuryId: number): InjuryStatus {
  if (value === 'open' || value === 'archived') {
    return value;
  }
  throw new Error(`Cannot map injury ${injuryId}: unknown status "${value}"`);
}
```

`injury_events.type` has the same guard (`src/db/events.ts` `parseEventType`). If a payload carries an invalid
`status` or event `type`, the current plan would insert the raw string during restore and only blow up later on
read — i.e. after the wipe already destroyed the live data. Per `conventions.md` ("fail loud at the boundary"),
`parseBackupJson` should validate `status ∈ {open, archived}`, event `type ∈` the five known types, and `limb ∈
{left, right, null}` up front, so an invalid file is rejected *before* any mutation.

**Fix:** Extend the Phase-1 validation contract for `parseBackupJson` to enumerate the enum/nullable checks it
performs (status, event type, limb, required string fields), mirroring the read-side parsers, and state that all
validation runs before `replaceFromBackup` touches the DB.

### S2 — Phase 1's manual success criterion is not verifiable as written

Phase 1 ships `src/db/backup.ts` with `dumpBackup` / `parseBackupJson` / `replaceFromBackup` and lists manual
criterion 1.3 "Spot-check dump/replace contracts (no UI)". With no test runner (correctly out of scope) and no UI
until Phase 2, there is no runnable way to exercise these functions in Phase 1 — `tsc --noEmit` only checks types,
not behavior. As written the criterion cannot be honestly checked off.

**Fix:** Either (a) reword 1.3 to acknowledge that dump/replace behavior is first exercised by the Phase-2 device
round-trip and keep Phase 1's gate as `tsc` only, or (b) specify a throwaway dev harness (e.g. a temporary
route/script removed before done) as the spot-check mechanism. Option (a) is the minimal-implementation choice.

---

## Nice-to-have

### N1 — "FK-safe order" wording + optional referential validation

The plan repeatedly stresses "FK-safe order" for delete/insert, but no table declares a `FOREIGN KEY` constraint
(`injury_id` columns are plain `INTEGER NOT NULL`), so SQLite enforces nothing and ordering is harmless but not
required for integrity. Conversely, because nothing enforces referential integrity, a hand-edited payload with a
`comment`/`solution`/`event` pointing at a non-existent `injury_id` would restore as orphan data.
**Fix:** Soften the "FK-safe" language to "insert parents before children for readability", and optionally add a
validation that every child `injury_id` (and `solution_id` on events) resolves within the payload before wipe.

### N2 — File-system API mechanics are slightly imprecise

`Paths.cache` returns a `Directory`, not a path string, so the write path is `new File(Paths.cache,
'my-body-scan-backup-…json').write(text)` then share `file.uri`; restore is `new File(pickedUri).text()`. Also
`DocumentPicker.getDocumentAsync` defaults `copyToCacheDirectory: true`, which yields a `file://` URI the new
`File` API can read — worth relying on explicitly (a raw `content://` URI is less reliable with the `File` API).
**Fix:** Tighten the Critical Details/UI notes to name `new File(dir, name)` / `file.uri` / `new File(uri).text()`
and the `copyToCacheDirectory` default, so the unattended executor doesn't pass a `Directory` where a URL string
is expected.

### N3 — Strict `schemaVersion` equality silently breaks old backups after any future schema bump

Rejecting `schemaVersion !== DATABASE_VERSION` is correct for this change (no migration of backups). But once a
later slice bumps `DATABASE_VERSION` to 6, every v5 export becomes permanently unrestorable — relevant to the
ticket's "restore … on a new device" and the pre-publish backup story.
**Fix:** Add one line to `## Assumptions` / `What We're NOT Doing` making explicit that cross-version restore is
out of scope and old backups will be rejected after a schema bump, so the limitation is a known decision rather
than a surprise.

### N4 — Minor module-placement / duplication choices

The read-side mappers (`mapInjury`, `mapSolution`, `mapComment`, `mapEvent`) are all private, so the plan's
"reuse if exported" branch resolves to local duplication in `backup.ts` — acceptable under
`minimal-implementation.md`, but exporting them would avoid drift with zero new abstraction. Separately,
`parseBackupJson` is pure (no DB) and would sit naturally in `src/domain/backup.ts` next to `BackupPayload`,
keeping `src/db/backup.ts` to the two DB-touching functions.
**Fix:** Pick one explicitly in the plan (either export the existing mappers, or state the local-duplication is
intentional) and decide `parseBackupJson`'s home so the executor doesn't guess.

---

## Axis assessment

- **Substance** — Strong. Concrete File/Intent/Contract tables, a fully specified payload, an ordered replace
  contract, and named deps. Not hand-wavy, except the Phase-1 "spot-check" criterion (S2).
- **Feasibility** — Reaches the Desired End State on the modern SDK 57 `File`/`Paths` + `expo-sharing` +
  `expo-document-picker` APIs (verified against Expo v57 docs) once C1 is removed. C1 otherwise makes restore
  impossible; S1 leaves a wipe-before-fail window on malformed input.
- **Architectural fitness** — Correct seams: dump/restore in `src/db/backup.ts`, payload type in
  `src/domain/backup.ts`, `/backup` screen mirroring the existing `headerRight` link pattern
  (`src/app/index.tsx`), transactional restore per `sqlite.md`, ref guards per `navigation.md`, no schema bump,
  no speculative abstraction. Notably it avoids the trap of reusing `create*` helpers (which would double-insert
  events and drop IDs) by inserting raw rows with explicit IDs. Minor placement nits in N4.
- **Progress hygiene** — `## Progress` step titles match the phase headings and map to the change tables;
  automated criteria (`tsc`) are verifiable. The only gap is Phase-1 manual verifiability (S2).
