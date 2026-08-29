# Handoff: injury-thread

Ticket: pasted (roadmap slice 3 — Injury thread — comments and solutions)
Status: mr_ready

No project git/MR skill or MCP is configured. Paste this file as the MR body.

## What landed

- Phase 1: Schema v3 and persist API — 111bf80
- Phase 2: Injury detail thread — 27ca8f4
- Phase 3: Latest solution on the open list — 1656b62
- Impl-review C1: list URL failure must not wipe rows — bd1968c

## Assumptions

- Automated gate is `npx tsc --noEmit` (this repo has no test runner; do not add one).
- Latest-solution preview on the **list** satisfies G2; map markers unchanged.
- Solutions on create are out; add after on the thread (FR-12).
- `Linking.openURL` for http(s) without `canOpenURL` (Android 11 query false-negatives).

## Reviewer checklist (manual)

- [ ] 1.2 Persist modules match the plan contracts
- [ ] 2.2 Empty thread renders; whitespace comment/solution refused
- [ ] 2.3 Comments oldest-first with timestamp; solutions latest-first with optional URL
- [ ] 2.4 Valid http(s) tap leaves the app; invalid/empty not opened
- [ ] 2.5 Force-stop still shows comments and solutions
- [ ] 3.2 List preview shows latest solution; Open link leaves the app
- [ ] KeyboardAvoidingView on detail if IME covers compose (Nice-to-have, not applied)

## Automated evidence

- `npx tsc --noEmit` → pass (phases 1–3 and post-triage)

## Follow-ups / out of scope

- Archive / reopen (slice 4)
- Solutions on the create form
- Shared `openHttpUrl` helper (Suggestion, not applied)
- Do not merge from this skill. Do not archive.

## Context paths

- `context/changes/injury-thread/change.md`
- `context/changes/injury-thread/plan.md`
- `context/changes/injury-thread/ticket.md`
- `context/changes/injury-thread/frame.md`
- `context/changes/injury-thread/reviews/plan-review.md`
- `context/changes/injury-thread/reviews/impl-review.md`
