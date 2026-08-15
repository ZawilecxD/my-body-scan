---
name: 11x-plan-review
description: Optional pre-implementation gate that reviews plan.md for substance, feasibility, and architectural fitness — report-only, never edits code or the plan. Use when the user says "review the plan", "is this plan good", "check my plan", or "/11x-plan-review <id>", typically after /11x-plan and before /11x-implement.
disable-model-invocation: true
---

# 11x-plan-review

Judge whether the plan is worth executing before anyone writes code. This skill only reports; it does not edit. This makes it safe to run in an isolated subagent.

Load reference `model-policy` — architectural-fitness judgment is a high-stakes call; use the strong tier for it.

## Guard

- **Report-only.** Never modify `plan.md`, `change.md`, or code. If a fix is warranted, name it in the report and route to `/11x-review-triage`.
- Refuse to operate on anything under `context/archive/`.

## Steps

1. Read `plan.md`, `change.md` (type), `frame.md`/`research/` and `context/standards/**` + `lessons.md`.
2. Assess:
   - **Substance** — are phases concrete (real File/Intent/Contract), or hand-wavy?
   - **Feasibility** — do the phases actually reach the Desired End State? Any impossible or missing step?
   - **Architectural fitness** — right seams, no speculative abstractions, honors standards and the `type` gate.
   - **Progress hygiene** — `## Progress` matches the phases; success criteria are verifiable.
3. Write `context/changes/<id>/reviews/plan-review.md`: findings tagged **Critical / Suggestion / Nice-to-have**, each with a concrete fix.

## Done when

`reviews/plan-review.md` is written. Print the next command: `/11x-review-triage <id>` to apply chosen fixes, or `/11x-implement <id> phase 1` if it passed clean. Stop.
