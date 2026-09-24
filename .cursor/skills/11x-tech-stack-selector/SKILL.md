---
name: 11x-tech-stack-selector
description: Pick a starter and tech stack for a greenfield project after the PRD is written, and record the decision in context/foundation/tech-stack.md. Reasons over starters against agent-friendly quality gates (typed, convention-based, popular, well-documented). Use when the user says "what stack should I use", "pick a stack", "choose framework", or "/11x-tech-stack-selector". Use AFTER /11x-prd, BEFORE /11x-bootstrapper.
disable-model-invocation: true
---

# 11x-tech-stack-selector

Choose the starter and stack, biased toward stacks an AI agent works well in. Reads the PRD, reasons, writes the hand-off. Use Context7 (`resolve-library-id` → `query-docs`) or available official documentation tools to confirm current versions and starter CLIs before recommending. If verification is unavailable, label the uncertainty and resolve it before running a starter.

## Guard

- Refuse to write under `context/archive/`.
- Requires `context/foundation/prd.md`; if absent, point to `/11x-prd` and stop.
- Recommend, then confirm with the user before writing — don't silently lock a stack.

## Agent-friendly quality gates

Score each candidate on: **typed** (static types), **convention-based** (one obvious way), **popular** (large training corpus, active ecosystem), **well-documented** (current, complete docs). Prefer stacks that pass all four.

## Steps

1. Read `prd.md` — `product_type`, `target_scale`, NFRs constrain the field.
2. Present one recommended stack and at most two materially different viable alternatives. Do not manufacture alternatives. For each, explain concrete advantages/disadvantages, PRD/NFR fit, MVP complexity, ecosystem maturity, documentation, agent suitability, infrastructure and expected costs. Include a concrete starter CLI and verify versions against official documentation.
3. Always ask the user to choose or confirm, even with a single candidate. Wait for an explicit decision; never infer it from silence or a general request to build.
4. Write `context/foundation/tech-stack.md`: confirmed stack, exact starter command, key library versions, quality-gate assessment, costs/assumptions, rejected alternatives and rationale, and the user's decision/date. During Factory, load `product-factory-policy` and `mvp-status` and record approval against this exact artifact revision before architecture. Preserve an existing valid choice; material changes require renewed approval.

## Done when

`tech-stack.md` records the confirmed choice and the starter command. Print the next command: `/11x-bootstrapper`. Stop.
