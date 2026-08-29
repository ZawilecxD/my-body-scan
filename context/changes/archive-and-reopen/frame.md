# Frame: archive-and-reopen

## Problem (observed, not assumed)

Injuries stay forever on the open list and map markers. There is no way to mark one healed, hide it from "current," keep its thread readable, or bring it back on a flare-up without a duplicate row. J3, G3, FR-8/14/15/16, and M3 are blocked.

## Chosen direction + why

`status` already exists on `injuries` (default `open`); open list/map queries already filter `status = 'open'`. Add `archived_at`, map real status in domain, and ship Archive / archive list / Reopen. Archive action on open injury detail; separate archive list screen; reopen on archived detail (clears `archived_at`, sets `status = 'open'`). Read-only thread when archived (no new comments/solutions) — reopen first. Same sqlite/provider; no new dependency.

## Explicitly not doing

- Soft-delete / "deleted" / third status (FR-14)
- One-way archive without reopen (FR-16 default is reopen)
- Editing history while archived (comments/solutions stay visible; compose stays open-only)
- Bulk archive, undo toast, confirmation dialogs beyond a simple confirm if the UI already uses them
- Separate archive DB or export
- Test runner / jest-expo / Playwright
- iOS / web polish, diagnosis copy (FR-19)

## Assumptions

- One slice, not an effort: status columns + archive screen + archive/reopen actions.
- Existing rows keep `status = 'open'`; new column `archived_at` is NULL until archive.
- Open injury detail gets Archive; archived detail gets Reopen and hides add-comment / add-solution.
- Archive entry point: home `headerRight` link (alongside Log injury) → `/archive` so J3 is completable (G4).
- Map markers and open list already filter `status = 'open'`; fixing `mapInjury` to read real status is enough — no marker redesign.
- Automated gate is `npx tsc --noEmit` (no test runner in repo). `npm run lint` if already green-able.
- Double-tap guard (ref) on archive / reopen / navigate, per `frontend/navigation.md`.
- `DATABASE_VERSION` is 3; this change is v4: `ALTER TABLE injuries ADD COLUMN archived_at TEXT` + `user_version` in one transaction. Fresh install (v0) includes `archived_at` in CREATE.

## Abort-if

- Ticket were multi-slice (e.g. plus photo / sync) — it is not.
- No runnable Automated criterion — `npx tsc --noEmit` exists.
- Shared UI-kit / cross-app contract change — none.
