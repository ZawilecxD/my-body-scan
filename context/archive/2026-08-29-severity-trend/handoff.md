# Handoff: severity-trend

Ticket: pasted (roadmap Post-MVP §6 — Severity trend)
Status: mr_ready

No project git/MR skill or MCP is configured. Paste this file as the MR body.

Commits on `main` (ahead of origin): `116b83b`, `cdceffd`.

**After you accept and merge/push to main:** run `/11x-archive severity-trend`.

## What landed

- Phase 1: Schema v6, readings API, backup — 116b83b
- Phase 2: Injury detail Severity UI + SVG trend — cdceffd

## Assumptions

- Automated gate is `npx tsc --noEmit` (no test runner; do not add one).
- Integer severity **0–10** inclusive; user-typed; no diagnosis/advice (FR-19).
- Readings are a separate detail section (not `injury_events` History).
- Open-only writes; archived read-only.
- `formatVersion` stays `1`; `schemaVersion` is `6`; old schema-5 backups remain unrestorable by design.
- SVG polyline via existing `react-native-svg` (no chart library).
- Migrate: V5 SQL fragment has no `user_version` stamp; only `V6_FROM_V5` / v0 full-create stamps 6 with `severity_readings` present (plan-review C1).

## Reviewer checklist (manual)

- [ ] 1.4 Spot-check migrate/readings/backup contracts (no UI)
- [ ] 2.4 Device: add readings, sparkline (≥2), archive read-only compose, force-stop persist, export/restore includes readings
- [ ] Plan-review S1 (parked): Phase 1 manual gate is tsc-only; prove behavior via 2.4
- [ ] Plan-review S2 (parked): UI integer parse — implemented via `parseSeverityInput` (`/^\d{1,2}$/` + 0–10); confirm on device
- [ ] Plan-review N1 (parked): chart inlined in `[id].tsx` (no separate component file)
- [ ] Impl-review S1 (not applied): wrap createSeverityReading status check + INSERT in one transaction
- [ ] Impl-review S2 (not applied): optional referential check that reading `injuryId` ∈ injuries on restore

## Automated evidence

- `npx tsc --noEmit` → pass (phases 1–2)

## Follow-ups / out of scope

- Edit/delete readings; History events for readings
- Chart library; clinical interpretation copy
- Physio summary (slice 7); iOS polish
- Cross-version restore of schema-5 backups

## Context paths

- `context/changes/severity-trend/change.md`
- `context/changes/severity-trend/plan.md`
- `context/changes/severity-trend/ticket.md`
- `context/changes/severity-trend/frame.md`
- `context/changes/severity-trend/reviews/plan-review.md`
- `context/changes/severity-trend/reviews/impl-review.md`
