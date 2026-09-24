---
name: 11x-frame
description: Deep interview on problem framing and alternatives before planning HOW — writes frame.md for a change or effort. Challenges the assumption baked into a "bug + proposed fix" or a stated solution, separating WHAT/WHY from HOW. Use when the input conflates observation and cause (or problem and solution), or the user says "frame this", "challenge the assumption", "should we even", "/11x-frame". Use BEFORE /11x-plan.
disable-model-invocation: true
---

# 11x-frame

Pressure-test what to build and why, before anyone plans how. Per-change (or per-effort) framing — distinct from product-level `11x-shape`.

Load reference `interview` and run the conversation that way.

## Guard

- Refuse to write under `context/archive/`.
- If the input is "problem X, so do Y", treat Y as a hypothesis, not a given. Separate the observation from the proposed cause.
- Never chain into `/11x-plan`.

## Steps

1. **Resolve the container** from the argument: `context/changes/<id>/frame.md` or `context/efforts/<id>/frame.md`. Read the identity file, any `research/`, and `foundation/` priors so you don't re-litigate settled points.

2. **Interview** to establish: the real problem (observation vs assumed cause); who it affects and how much; at least two genuinely different approaches (including "do nothing" / smallest viable); the decisive trade-off; what success looks like.

3. **Write** `frame.md`:

```markdown
# Frame: <id>

## Problem (observed, not assumed)
## Who it affects / impact
## Alternatives considered
## Chosen direction + why
## Explicitly not doing
## Open questions for planning
```

## Done when

`frame.md` records the framing and the chosen direction. Print the next command: `/11x-plan <id>` (which will skip framing questions because this exists). Stop.
