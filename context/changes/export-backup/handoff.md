# Handoff: export-backup

Ticket: pasted (roadmap Post-MVP §5 — Export / backup)
Status: mr_ready

No project git/MR skill or MCP is configured. Paste this file as the MR body.

Commits on `main` (ahead of origin): `125e9f4`, `572a610`.

## What landed

- Phase 1: Backup dump and replace API — 125e9f4
- Phase 2: Packages, Backup screen, home link — 572a610

## Assumptions

- Automated gate is `npx tsc --noEmit` (no test runner; do not add one).
- Replace-all restore with confirm; no merge; no cloud.
- JSON `formatVersion: 1`; `schemaVersion` must equal live `DATABASE_VERSION` (5).
- Preserve IDs; include soft-deleted solutions and all events.
- Landmark (+ limb enum) validation before wipe; fail loud on bad payload.
- Home Backup link → `/backup`; `expo-file-system` / `expo-sharing` / `expo-document-picker` via `npx expo install`.

## Reviewer checklist (manual)

- [ ] 1.3 Spot-check dump/replace contracts (no UI)
- [ ] 2.3 Device: export → restore round-trip + force-stop persist
- [ ] Plan-review S1 (parked): enum validation before wipe — implemented in `parseBackupJson` anyway; confirm on device with a bad file
- [ ] Impl-review S1 (not applied): remove unnecessary `expo-sharing` plugin from `app.json` if undesired
- [ ] Impl-review S2 (not applied): optional referential integrity on child `injuryId` / `solutionId`
- [ ] Impl-review S3 (not applied): re-validate enums inside `replaceFromBackup` for non-parse callers

## Automated evidence

- `npx tsc --noEmit` → pass (phases 1–2)

## Follow-ups / out of scope

- Cross-version restore after a future schema bump (rejected by design)
- Merge restore, encryption, physio PDF (slice 7), cloud sync
- Plan-review N1–N4 / impl Nice-to-haves (share-cancel messaging, mapper export, etc.)

## Context paths

- `context/changes/export-backup/change.md`
- `context/changes/export-backup/plan.md`
- `context/changes/export-backup/ticket.md`
- `context/changes/export-backup/frame.md`
- `context/changes/export-backup/handoff.md`
