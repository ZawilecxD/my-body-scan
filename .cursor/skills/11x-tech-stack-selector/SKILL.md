---
name: 11x-tech-stack-selector
description: Pick a starter and tech stack for a greenfield project after the PRD is written, and record the decision in context/foundation/tech-stack.md. Reasons over starters against agent-friendly quality gates (typed, convention-based, popular, well-documented). Use when the user says "what stack should I use", "pick a stack", "choose framework", or "/11x-tech-stack-selector". Use AFTER /11x-prd, BEFORE /11x-bootstrapper.
disable-model-invocation: true
---

# 11x-tech-stack-selector

Choose the starter and stack, biased toward stacks an AI agent works well in. Reads the PRD, reasons, writes the hand-off. Use Context7 (`resolve-library-id` → `query-docs`) to confirm current versions and starter CLIs before recommending.

## Guard

- Refuse to write under `context/archive/`.
- Requires `context/foundation/prd.md`; if absent, point to `/11x-prd` and stop.
- Recommend, then confirm with the user before writing — don't silently lock a stack.

## Agent-friendly quality gates

Score each candidate on: **typed** (static types), **convention-based** (one obvious way), **popular** (large training corpus, active ecosystem), **well-documented** (current, complete docs). Prefer stacks that pass all four.

## Steps

1. Read `prd.md` — `product_type`, `target_scale`, NFRs constrain the field.
2. Propose 1–2 candidate stacks + a concrete starter CLI for each, scored against the four gates, with a one-line trade-off. Verify versions via Context7.
3. Confirm the pick with the user (one question if it's close).
4. Write `context/foundation/tech-stack.md`: chosen starter + exact CLI command, key libraries with versions, the gate scores, and rejected alternatives with reasons.

## Done when

`tech-stack.md` records the confirmed choice and the starter command. Print the next command: `/11x-bootstrapper`. Stop.
