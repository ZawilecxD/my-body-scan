---
name: 11x-refactor-discover
description: Scan the codebase for refactoring opportunities using the deep-modules / seams / deletion-test vocabulary, present candidates inline, and promote a selection to a change or an effort. Use when the user says "find refactoring opportunities", "where can we simplify", "scan for tech debt", or "/11x-refactor-discover".
disable-model-invocation: true
---

# 11x-refactor-discover

Find where the code could get deeper/simpler, then turn a selection into real work. Discovery-entry for refactors.

Load references `module-design` (the vocabulary you judge by) and `change-md` (before seeding a change).

## Guard

- Refuse to write under `context/archive/`.
- Present candidates inline (markdown) — no report file. Only the promoted selection produces disk state.

## Steps

1. **Fan out** `Explore` subagents to find candidates: shallow modules, tangled seams, abstractions that fail the deletion test, duplicated logic.
2. **Present candidates inline**, each with: what/where (`file:line`), why it's a candidate (in `module-design` terms), and a proposed depth of change.
3. **Promote the user's selection:**
   - **One candidate** → write `context/changes/<id>/change.md` directly with `type: refactor` and the finding as the seed `## Notes` (same mechanism as `11x-diagnose`; do NOT mechanically call `/11x-new`). Then print `/11x-plan <id>`.
   - **Several candidates** → this is a multi-step effort. Do NOT create it yourself; assemble a complete seed summary (what/where, why, proposed depth, per candidate) and print it as a ready-to-paste argument to `/11x-new --effort ...`. The user runs it.

## Done when

Candidates were presented and, if the user picked, either a `type: refactor` change.md exists (single) or a paste-ready `/11x-new --effort` command was printed (several). Never auto-run anything. Stop.
