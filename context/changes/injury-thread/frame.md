# Frame: injury-thread

## Problem (observed, not assumed)

An open injury only shows landmark, description, and created date. Mateusz cannot record what he is doing about it (a YouTube / physio link) or a chronological note of how it feels over time. J2 and G2 are blocked: the thread and “latest proposed solutions” do not exist.

## Chosen direction + why

Keep the existing injury row. Add `comments` and `solutions` tables (schema v3) and grow `/injuries/[id]` into the thread: description, solutions (text + optional http(s) URL), comments oldest-first, compose on the same screen. Open a valid URL with React Native `Linking` (system handler). Show the latest solution preview on the open list (G2). Same sqlite/provider as today — no new dependency, no extra route.

## Explicitly not doing

- Archive / reopen / `archived_at` / status beyond `open` (slice 4; G2 “distinguishable from healed” waits on that)
- Solutions on the create form (FR-10 optional-at-create is met by adding after; this slice’s layer is injury detail)
- Exercise catalog / picker (FR-11)
- In-app WebView / YouTube embed (FR-17)
- Editing or deleting comments/solutions
- Mixing comments and solutions into one table
- Test runner / jest-expo / Playwright
- iOS / web polish, diagnosis copy (FR-19)

## Assumptions

- One slice, not an effort: comments + solutions + Linking on an existing injury.
- Latest solution on the **list** row is enough for G2; map markers stay count-only (slice 2).
- Empty URL is allowed; non-empty URL must be `http:` or `https:` or save fails loud. Invalid/empty URLs are never opened.
- Create-time solutions are out; add after on the thread (FR-12).
- Automated gate is `npx tsc --noEmit` (this repo has no test runner; slice 1/2 same). `npm run lint` if it is already green-able.
- Double-tap guard (ref, not `disabled`) on add comment / add solution, per `frontend/navigation.md`.
- `DATABASE_VERSION` is currently 2 (limb). This change is v3: two new tables, atomic with `user_version`.

## Abort-if

- Ticket were multi-slice (archive + thread) — it is not.
- No runnable Automated criterion this repo already knows — `npx tsc --noEmit` exists.
- Shared UI-kit / cross-app contract change — none.
