# Handoff: unified-injury-updates

Ticket: roadmap-§9-unified-injury-updates
Status: mr_ready
MR: https://github.com/ZawilecxD/my-body-scan/pull/7

## What landed

- Phase 1: Schema v8, update API, backup, summary — 7417c3f
- Phase 2: Injury detail update timeline — 7646ca2

## Assumptions

- Legacy comments and severity readings stay separate rows, even when timestamps match. Comments are copied first, so a shared timestamp shows the note before the severity.
- `formatVersion` stays 1. `schemaVersion` is 8. Older backups do not restore.
- No in-app downgrade. Export a backup before upgrading if you need a way back.
- Summary "Comments" is now "Notes". Latest severity is still the newest update that has a severity, not limited to the summary window.
- Automated gate is `npx tsc --noEmit`. This repo has no unit or e2e runner.

## Reviewer checklist (manual)

- [ ] On an open injury, save severity only, note only, and both; confirm both-empty and a non-integer severity do not save.
- [ ] Confirm an upgraded database still shows old comment text and old severity values, oldest first, and the sparkline uses only severity points.
- [ ] Archive hides the form; reopen shows it. Export then restore on this build round-trips updates. Summary "Latest severity" and "Notes" match the timeline.
- [ ] Confirm the form has no treatment, sleep, mood, or other extra fields, and no diagnosis copy.
- [ ] Plan-review S1 (not applied): backup restore still does not require `updates[].injuryId` to reference an injury in the payload.
- [ ] Plan-review N1 (not applied): a legacy severity outside 0–10 fails the v8 CHECK and leaves the database on the previous version.
- [ ] Impl-review S1 (not applied): sparkline maps a missing severity to 0. The current caller already filters those rows out.
- [ ] Impl-review N1 (not applied): no index on `injury_updates (injury_id, created_at)`.

## Automated evidence

- `npx tsc --noEmit` → pass (after phase 1 and after phase 2)
- One-off SQLite check of the v8 copy (not a repo test): a comment, a same-timestamp comment plus severity 4, and severity 0 copied in that order; `comments` and `severity_readings` were dropped; `user_version` became 8.

## Follow-ups / out of scope

- Edit and delete (roadmap §10)
- Interventions and outcomes (roadmap §11)
- Today, reminders, and the i18n summary redesign

## Context paths

- `context/changes/unified-injury-updates/change.md`
- `context/changes/unified-injury-updates/plan.md`
- `context/changes/unified-injury-updates/ticket.md`
