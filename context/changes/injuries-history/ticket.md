# Ticket: Injuries history

Source: pasted (user intent for `/11x-deliver injuries-history`). No Linear issue matched.

## Intent (verbatim)

I want to keep a history of injuries add/archive/reopen and solution adding/removal

## Context

Today the injury thread keeps description, comments, and solutions, and archive/reopen toggles `status` / `archived_at`. Reopen clears `archived_at`, so prior archive cycles are not retained as an audit trail. Solutions cannot be removed.

## Acceptance

- [ ] Creating an injury records a durable history entry (add / created).
- [ ] Archiving an injury records a history entry; reopening records a history entry (prior archive cycles remain visible after reopen).
- [ ] Adding a solution records a history entry; the solution appears in the active solutions list.
- [ ] Removing a solution records a history entry; the solution disappears from the active list but remains discoverable in history.
- [ ] History for an injury is readable on that injury’s detail (chronological).
- [ ] History and soft-removed solutions survive force-stop / restart (FR-18).
- [ ] Remove solution is only available for open injuries (archived stays read-only compose, matching archive-and-reopen).
