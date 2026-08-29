---
change_id: severity-trend
review: plan-review
created: 2026-08-29
reviewer: 11x-plan-review (report-only)
---

# Plan review: severity-trend

## Verdict

Executable **after one Critical fix**. Phases are concrete (File/Intent/Contract), scope matches ticket/frame
(FR-18 persistence, FR-19 store-only, no History folding, SVG not a chart lib), and Progress aligns with phases.
The v6 migrate story is directionally right but collides with how `V5_FROM_EXISTING` is written today — that
must be tightened before an unattended executor touches `migrate.ts`.

Critical: 1 · Suggestions: 2 · Nice-to-have: 3

---

## Critical

### C1 — `V5_FROM_EXISTING` will stamp `user_version = 6` without `severity_readings` if left as-is

Today’s shared tail ends with an interpolated version bump:

```45:56:src/db/migrate.ts
const V5_FROM_EXISTING = `
ALTER TABLE solutions ADD COLUMN removed_at TEXT;
${INJURY_EVENTS_DDL}
INSERT INTO injury_events (injury_id, type, solution_id, created_at)
  SELECT id, 'created', NULL, created_at FROM injuries;
INSERT INTO injury_events (injury_id, type, solution_id, created_at)
  SELECT id, 'archived', NULL, archived_at FROM injuries
  WHERE status = 'archived' AND archived_at IS NOT NULL;
INSERT INTO injury_events (injury_id, type, solution_id, created_at)
  SELECT injury_id, 'solution_added', id, created_at FROM solutions;
PRAGMA user_version = ${DATABASE_VERSION};
`;
```

`DATABASE_VERSION` is currently `5`. The plan says bump it to `6` and “keep existing upgrade steps … then …
continue into V6 in the **same** transaction.” If an unattended executor only changes `DATABASE_VERSION = 6`
and treats “reach v5 shape” as running today’s `V5_FROM_EXISTING` (even briefly in its own transaction, or as
a copy-paste of “same as today’s migrate”), that SQL sets **`user_version = 6` with no `severity_readings`
table**. On the next launch, `currentDbVersion >= DATABASE_VERSION` early-returns and the app is stuck on a
v6 label without the table — exactly the class of failure the atomic-bump lesson / `sqlite.md` exist to prevent.

The plan’s “do not stop at user_version=5” / “never leave user_version=6 without the readings table” states the
invariant but does **not** tell the executor to stop interpolating `DATABASE_VERSION` inside the V5 fragment.

Reality check vs current paths:

- **v0:** dedicated full create — plan correctly requires readings + `user_version = 6` here. OK if rewritten.
- **v1–4:** each ends by embedding `V5_FROM_EXISTING` (and today the v4 block has no trailing `return`, but
  nothing follows). All inherit the dangerous pragma once `DATABASE_VERSION` is 6.
- **v5:** no branch today (early-return at version 5). Plan’s `V6_FROM_V5`-only path is required and correct —
  must **not** re-run `V5_FROM_EXISTING` (would fail on `ADD COLUMN removed_at` / duplicate event backfill).

**Fix:** In Critical Details / Phase-1 migrate contract, require explicitly:

1. Strip `PRAGMA user_version = …` from the shared V5 SQL fragment (rename if helpful, e.g. `V5_SCHEMA_FROM_EXISTING`
   with only ALTER / events DDL / backfill).
2. Define `V6_FROM_V5` = `CREATE TABLE IF NOT EXISTS severity_readings (…); PRAGMA user_version = 6;`
3. **v0:** one transaction = full current schema including `severity_readings` + `user_version = 6` only.
4. **v1–4:** one transaction = existing limb/archived/comments/solutions setup + V5 fragment **without** version
   pragma + `V6_FROM_V5` (readings CREATE before the only `user_version = 6`).
5. **v5:** one transaction = `V6_FROM_V5` only.
6. Never run a transaction that sets `user_version = 6` unless that same transaction created `severity_readings`.

---

## Suggestions

### S1 — Phase 1 manual criterion is not verifiable as written

Phase 1 ships migrate / `readings.ts` / backup with no UI and no test runner. Progress item **1.4**
(“Spot-check migrate/readings/backup contracts (no UI)”) cannot be honestly checked off: `tsc --noEmit` does
not exercise behavior, and there is no harness.

**Fix:** Either (a) drop 1.4 / reword to “behavior first proven by Phase 2 device round-trip; Phase 1 gate is
`tsc` only”, or (b) name a throwaway spot-check mechanism removed before done. Prefer (a) under
`minimal-implementation.md`.

### S2 — Pin TextInput → integer contract at the UI/API boundary

`createSeverityReading` must reject non-integer / out-of-range values, but the compose control is a
`TextInput` (`keyboardType` number-pad) that yields strings (`""`, `"08"`, `"8.5"`, `"11"`). The plan does not
say whether the screen parses before call or passes a number through a helper, so an unattended UI pass can
ship a control that always errors or silently coerces floats.

**Fix:** Specify in Phase 2 contract: parse with integer-only rules (e.g. reject if `trim` is empty or
`Number(text)` is not `Number.isInteger` in 0…10); only then call `createSeverityReading`; surface the thrown
Error in the existing detail `error` state (same pattern as comments).

---

## Nice-to-have

### N1 — Decide chart file up front

Optional `severity-trend-chart.tsx` vs inline SVG leaves a needless choice for unattended mode.

**Fix:** Pick one in the plan (inline in `[id].tsx` is enough for a small polyline; extract only if the screen
file would grow past readability). Prefer inline to avoid an extra file for one caller
(`minimal-implementation.md`).

### N2 — Soften “FK-less / delete order” as readability, not integrity

Same as export-backup: no `FOREIGN KEY` constraints exist; delete/insert order does not enforce integrity.
Orphan `injury_id`s in a hand-edited backup would restore.

**Fix:** Keep the suggested delete/insert order for consistency with `backup.ts` today; optionally note that
referential checks on `readings[].injuryId ∈ injuries` are out of scope (match existing comments/solutions).

### N3 — No index on `severity_readings(injury_id, created_at)`

Fine at solo MVP volume; list is per-injury and ordered by time.

**Fix:** Do not add an index in this change unless a measured need appears.

---

## Axis assessment

- **Substance** — Strong. Real File/Intent/Contract rows, DDL columns, backup field, UI placement, English
  copy, and explicit non-goals. Not hand-wavy aside from Phase-1 manual spot-check (S1) and TextInput parsing (S2).
- **Feasibility** — Reaches Desired End State (open compose, archived read-only, sparkline ≥2, FR-18 via SQLite,
  backup schemaVersion 6, FR-19 store/display only) **once C1 is fixed**. `react-native-svg` is already a
  dependency (`package.json`). Without C1, v1–4 (and a botched “two-step”) upgrades can label the DB as 6
  without the table.
- **Architectural fitness** — Right seams: `src/db/readings.ts` beside comments, `SeverityReading` in
  `src/domain/injury.ts`, backup payload extension, detail section not History events, SVG over new chart lib.
  Honors `sqlite.md`, `navigation.md` (ref guard on Add), `minimal-implementation.md`, and lessons in play.
  `feature` + `tsc` gate is appropriate; no speculative layers.
- **Progress hygiene** — Phase headings and `## Progress` titles match; automated steps are `tsc`. Manual 1.4
  is the weak criterion (S1); 2.4 maps cleanly to acceptance criteria 1–5.

## Standards / lessons / PRD

| Source | Fit |
|---|---|
| `sqlite.md` / atomic bump lesson | In play; C1 is the concrete migrate hazard against current `migrate.ts` |
| Double-tap / `navigation.md` | In play for Add reading — adequate |
| Splash/DB init lesson | Correctly not in play |
| FR-18 | Covered by SQLite + force-stop manual check |
| FR-19 | Covered: no advice/diagnosis/color clinical copy; user-typed 0–10 only |
| Ticket / frame | Aligned; old schema-5 backups unrestorable is an explicit assumption |

---

## Triage (unattended)

- **Applied:** C1 — migrate contract rewritten in `plan.md` (strip V5 version pragma; `V6_FROM_V5` only stamps 6 with readings).
- **Deferred to handoff:** S1, S2, N1–N3 (Suggestions / Nice-to-have).
