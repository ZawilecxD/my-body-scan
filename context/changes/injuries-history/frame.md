# Frame: injuries-history

## Problem (observed, not assumed)

Reopen clears `archived_at`, so archive/reopen cycles are not retained. Solutions cannot be removed. There is no audit trail for create / archive / reopen / solution add / solution remove — only the current injury row and current solution rows.

## Who it affects / impact

Mateusz (primary user): needs to see when an injury flared (archive→reopen) and what solutions were tried or dropped, without reconstructing from memory.

## Alternatives considered

1. **Do nothing** — keep current thread + status only; lose archive cycles on reopen; no solution removal.
2. **Derive-only** — stop clearing `archived_at` on reopen and add `removed_at` on solutions; no unified event list (weak for multiple archive cycles).
3. **Append-only event log + soft-delete solutions** — `injury_events` for create/archive/reopen/solution_added/solution_removed; `solutions.removed_at` so active lists hide removed rows while history keeps them.

## Chosen direction + why

Option 3. One event table covers the named lifecycle events; soft-delete preserves solution content for history without hard-delete + JSON snapshots. Same sqlite/provider; no new dependency. History UI on injury detail only.

## Explicitly not doing

- Comment add/remove events (out of stated intent)
- Global cross-injury timeline / export / sync
- Hard-delete of solutions
- Editing past events
- Confirm dialogs beyond existing patterns
- Test runner / jest-expo / Playwright
- New dependencies
- iOS / web polish; diagnosis copy (FR-19)

## Assumptions

- Soft-delete solutions via `removed_at`; active queries filter `removed_at IS NULL`.
- Event types: `created` | `archived` | `reopened` | `solution_added` | `solution_removed`.
- Payload: optional `solution_id` (integer as text or nullable column); no large JSON blobs.
- Backfill on migrate: one `created` event per existing injury (`created_at`); one `archived` if status is archived (`archived_at` or `created_at`); one `solution_added` per existing solution (`created_at`). No invented removals.
- History section on injury detail, oldest-first; Remove only when injury is open.
- Automated gate: `npx tsc --noEmit`.

## Abort-if

- Ticket were multi-slice (e.g. plus comments history + global feed) — it is not.
- No runnable Automated criterion — `npx tsc --noEmit` exists.
- Shared UI-kit / cross-app contract change — none.
