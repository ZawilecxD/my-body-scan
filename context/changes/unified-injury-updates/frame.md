# Frame: unified-injury-updates

## Problem

Injury detail makes Mateusz record "how bad" and "what happened" as two separate writes (severity readings and comments) and shows them as two lists. The approved product direction says one chronological update is the history later screens will read. Comments and readings already stored on device must not disappear in that switch.

## Chosen direction

Add one `injury_updates` row type (optional severity 0–10, optional note, timestamp). On upgrade, copy every comment and every severity reading into that table inside the same transaction that stamps schema version 8, then drop the old tables. Injury detail replaces the two compose sections with one update form and one timeline. Backup and the physio summary read the new table. Solutions and lifecycle events stay separate.

Identical or nearby timestamps stay as separate rows. Copy comments first (oldest id first), then readings, and display by `created_at` then `id`, so a shared timestamp shows the comment before the reading. Do not merge them: a merge would invent a pairing the user never saved.

## Not doing

- Edit or delete of injuries or updates (roadmap §10)
- Interventions, outcomes, reminders, Today (roadmap §11–13)
- Folding solutions into updates
- General-health fields (sleep, mood, medication, trigger, duration)
- In-app downgrade of schema 8
- Restoring backups whose `schemaVersion` is not 8
- A new test runner or Playwright
- Coalescing legacy rows that happened close together

## Assumptions

- This roadmap item is one change. The listed layers are the implementation of that one outcome, not extra slices.
- Automated gate remains `npx tsc --noEmit`. This repo has no unit or e2e runner; do not add one.
- Recovery from a bad upgrade is a backup exported before upgrading, not a downgrade path. Same rule as prior schema bumps: older `schemaVersion` backups do not restore.
- Open injuries accept updates. Archived injuries show history and refuse new writes.
- Summary keeps its current defaults and window rules. "Comments" in the summary becomes "Notes" (the note field). Latest severity is still the newest update that has a severity, not limited to the summary window.
- No glossary collision left open: see `context/foundation/glossary.md` (injury update vs note vs injury event).

## Abort-if

- The work grows into edit/delete, interventions, or Today.
- A migration rule would skip or overwrite a legacy comment or reading to make the new row shape fit.
- `npx tsc --noEmit` cannot be run in this repo.
