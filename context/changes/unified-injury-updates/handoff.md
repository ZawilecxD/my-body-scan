# Handoff: unified-injury-updates

Ticket: roadmap-§9-unified-injury-updates
Status: in progress

## What landed

- (none yet)

## Assumptions

- Legacy comments and severity readings become separate update rows, even when timestamps match. Comments are copied first.
- Schema backups that are not version 8 do not restore.
- No in-app downgrade. A pre-upgrade export is the recovery path.

## Reviewer checklist (manual)

- [ ] Plan-review S1 (not applied): backup restore still does not require `updates[].injuryId` to reference an injury in the payload.
- [ ] Plan-review N1 (not applied): a legacy severity outside 0–10 fails the v8 CHECK and leaves the database on the previous version.

## Automated evidence

- (pending)

## Follow-ups / out of scope

- Edit and delete (roadmap §10)
- Interventions and outcomes (roadmap §11)
- Today, reminders, i18n summary redesign

## Context paths

- `context/changes/unified-injury-updates/change.md`
- `context/changes/unified-injury-updates/plan.md`
- `context/changes/unified-injury-updates/ticket.md`
