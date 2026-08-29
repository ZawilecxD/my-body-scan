# Ticket: Export / backup

Source: pasted (roadmap Post-MVP §5). No Linear issue matched for this repo.

## Slice (verbatim)

### 5. Export / backup

- **Outcome:** User can export injury data (and restore or re-import on the same or a new device) so uninstall or phone swap does not lose the log.
- **Why next:** Local-only SQLite has no recovery path today; needed before a wider audience or Play publish.
- **Next when ready:** `/11x-new export-backup on-device export and restore of injury data`

## Cited roadmap / PRD constraints (verbatim)

- From roadmap Parked: Accounts, cloud sync (on-device export/backup is Post-MVP §5, not cloud)
- From roadmap §7: Depends on: export format from slice 5 helps
- **FR-18.** All of the above data survives process death and app restart on the same device.
- **FR-19.** The app does not interpret symptoms, suggest exercises, or score pain. It stores what the user typed.
- Later (not MVP historically): export/backup — now lifted into this Post-MVP slice.

## Acceptance

- [ ] User can export all injury data (open + archived injuries, comments, solutions including soft-deleted, injury events) to a file they can keep or move off-device.
- [ ] User can restore/re-import from such a file on the same or a new install so the log is not lost after uninstall or phone swap.
- [ ] Export/restore is on-device only — no accounts, no cloud sync.
- [ ] After restore, open list / archive / threads / history match the backup; data still survives force-stop (FR-18).
- [ ] App still does not diagnose or advise (FR-19).
