---
change_id: unified-injury-updates
review: plan-review
created: 2026-09-24
reviewer: 11x-plan-review (report-only)
---

# Plan review: unified-injury-updates

## Verdict

Executable after one Critical fix. The v8 stamp split, lossless copy-before-drop, and the decision not to merge equal timestamps are concrete and match the ticket. Phase 1's automated gate cannot pass as the file list is written.

Critical: 1 · Suggestions: 1 · Nice-to-have: 1

## Critical

### C1 — Phase 1 deletes `comments.ts` and `readings.ts` but does not list the injury detail caller

`src/app/injuries/[id].tsx` imports `createComment`, `listCommentsForInjury`, `createSeverityReading`, and `listSeverityReadingsForInjury`. Phase 1's Changes Required delete those modules and require `npx tsc --noEmit` to exit 0, but the file list never names the screen. The phase overview then wavers between "no injury-detail UI yet" and "update every TypeScript caller."

Fix: add `src/app/injuries/[id].tsx` to Phase 1 Changes Required. Contract: switch those calls to `createInjuryUpdate` / `listInjuryUpdatesForInjury` so the project typechecks. Keep the existing two blocks for this phase only (severity block = updates with a severity; comments block = updates with a note). Phase 2 still replaces both blocks with one timeline and one form. Do not leave the old imports in place.

## Suggestion

### S1 — Backup updates do not check `injuryId` against the payload's injuries

Same gap as comments and readings today. A hand-edited backup can restore an update whose injury is missing. Park; do not add a new referential rule in this slice.

## Nice-to-have

### N1 — A legacy severity outside 0–10 fails the new CHECK and blocks launch

Create paths never stored that value. Failing the transaction is the lossless choice (no skipped row). No plan change. If a real database hits it, the splash error is the signal to recover from a pre-upgrade backup.

## Triage

Unattended policy: Critical only.

- **C1 applied** — Phase 1 Changes Required now names `src/app/injuries/[id].tsx` and keeps the two blocks on update reads/writes until phase 2.
- **S1 deferred** — backup `injuryId` check. See handoff.
- **N1 deferred** — out-of-range legacy severity fails closed. See handoff.

## Facets

- **Substance** — File, intent, and contract are specific, including the v7 pragma split. C1 is the missing file.
- **Feasibility** — Copy-then-drop in one transaction can reach PDR-4. Phase 2's UI contract matches PDR-2 and PDR-3. C1 is the hole in the phase 1 gate.
- **Architectural fitness** — One table and one repository, no new dependency, solutions and events left alone. Matches sqlite, minimal-implementation, and glossary.
- **Progress hygiene** — `## Progress` mirrors both phases. Automated commands are `npx tsc --noEmit`. Manual items are unchecked device checks.
