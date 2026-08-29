---
change_id: severity-trend
review: impl-review
created: 2026-08-29
reviewer: 11x-impl-review (report-only)
commits: [116b83b, cdceffd]
---

# Implementation review: severity-trend

## Verdict

Matches the plan. No Critical findings. Safe to hand off for manual device check (Progress 1.4 / 2.4).

Critical: 0 · Suggestions: 2 · Nice-to-have: 3

## Triage (unattended)

- **Applied:** none (Critical: 0).
- **Deferred to handoff:** S1, S2, N1–N3.

---

## Findings

### Critical

None.

### Suggestion

**S1 — `createSeverityReading` status check + INSERT not atomic**

`getInjuryById` then a separate `INSERT`. A kill or interleaved archive between the two awaits can leave a reading on an injury that is no longer `open` (UI also gates on `isOpen`, but the DB API is the real boundary).

**Fix:** Wrap existence/status re-check + INSERT in `db.withTransactionAsync` (same class of fix as injuries-history impl-review S1). Solo JS thread makes this rare; still the fail-loud contract for archived writes.

**S2 — Restore still accepts orphan `readings[].injuryId`**

No `FOREIGN KEY`s; `parseReading` / `replaceFromBackup` do not require `injuryId ∈ payload.injuries` (same as comments/solutions/events — plan-review N2 / export-backup S2). Hand-edited backups can restore silent orphans after wipe.

**Fix:** In `assertPayloadReadyForReplace`, build a `Set` of injury ids and throw if any reading (and ideally other children) references a missing injury, before the transaction.

### Nice-to-have

**N1 — `maxLength={2}` on severity `TextInput`**

`parseSeverityInput` already rejects non-`/^\d{1,2}$/` input; `maxLength={2}` would match the contract at the control.

**N2 — Optional sparkline min/max labels**

Plan allowed optional labels; polyline alone is enough for ≥2 points. Add tiny 0/10 (or data min/max) labels only if the chart feels under-explained on device.

**N3 — Extract `SeverityTrendChart` later**

Inline in `[id].tsx` matches plan-review N1 / `minimal-implementation.md`. Extract to `src/components/severity-trend-chart.tsx` only if the screen keeps growing.

---

## Drift

- **Phase 1 (116b83b):** `DATABASE_VERSION = 6`; `V5_SCHEMA_FROM_EXISTING` without version pragma; `V6_FROM_V5` = readings DDL + `user_version = 6`; v0 full schema includes readings; v1–4 chain into V5 fragment + V6; v5 runs `V6_FROM_V5` only. `SeverityReading`, `readings.ts` (open-only create, 0–10 int, list oldest first), backup `readings` dump/parse/replace with suggested delete/insert order — done.
- **Phase 2 (cdceffd):** Severity between Solutions and Comments; open compose with integer parse + ref guard; list + empty copy; SVG polyline when ≥2; archived read-only; no `injury_events` — done.
- Plan-review **C1** migrate structure applied. Plan-review **S2** TextInput integer boundary handled via `parseSeverityInput`.

No scope creep (no chart lib, no edit/delete, no History folding, no clinical copy).

## Safety

- Schema bump atomic with DDL (`sqlite.md` / atomic-bump lesson). WAL outside the transaction.
- Create rejects non-integer / out-of-range / missing / archived injury with clear `Error`s.
- Backup parse requires `readings` array; values go through `requireNumber` + 0–10 range; restore wipe+insert stays in one transaction.
- FR-19: store/display only (`Severity`, `X / 10`, no advice or color risk coding).
- Double-tap: `addingReading` ref set synchronously; clear in `finally` (matches Comments/Solutions on this screen).

## Patterns & standards

| Source | Fit |
|---|---|
| `sqlite.md` / atomic bump lesson | Applied in migrate v6 paths |
| `navigation.md` / double-tap lesson | Ref guard on Add reading |
| Splash/DB init lesson | Correctly not in play |
| `conventions.md` | `src/db/readings.ts` beside peers; fail loud |
| `minimal-implementation.md` | Table + API + backup + detail SVG only |
| `coding-style.md` | `@/`, Themed*, English UI labels per plan |

## Type gate

Feature → automated gate is `npx tsc --noEmit` only. Re-ran: **exits 0**.

## Coverage

- Automated 1.3 / 2.3: `tsc --noEmit` claimed in Progress and verified green.
- Manual 1.4 / 2.4: still open (expected) — device migrate/readings/backup spot-check; add readings + sparkline; archive read-only; force-stop; export/restore schemaVersion 6.

## Triage (unattended)

- **Applied:** none (no Critical).
- **Deferred to handoff:** S1, S2, N1–N3.
