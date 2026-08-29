# Handoff: injury-thread

Ticket: pasted (roadmap slice 3)
Status: implementing

## What landed
(filled at ship)

## Assumptions
- Automated gate is `npx tsc --noEmit` (no test runner in this repo).
- Latest-solution preview on the list satisfies G2; map markers unchanged.
- Solutions on create are out of this slice.

## Reviewer checklist (manual)
- [ ] 1.2 Persist modules match the plan contracts
- [ ] 2.2 Empty thread renders; whitespace comment/solution refused
- [ ] 2.3 Comments oldest-first with timestamp; solutions latest-first with optional URL
- [ ] 2.4 Valid http(s) tap leaves the app; invalid/empty not opened
- [ ] 2.5 Force-stop still shows comments and solutions
- [ ] 3.2 List preview shows latest solution; Open link leaves the app

## Automated evidence
- (filled per phase)

## Follow-ups / out of scope
- Suggestion: KeyboardAvoidingView on detail if IME covers compose (plan-review N6).

## Context paths
- `context/changes/injury-thread/change.md`
- `context/changes/injury-thread/plan.md`
- `context/changes/injury-thread/ticket.md`
