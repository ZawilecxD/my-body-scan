---
name: 11x-plan
description: Turn a change into a detailed, phased implementation plan (plan.md) through an upstream-aware interview. Reads settled artifacts, matches project standards, surfaces relevant lessons, and owns the ## Progress checklist. The change's type (feature/defect/refactor/migration) toggles extra gates. Use when the user says "plan this", "write a plan", "/11x-plan <id>". Use AFTER /11x-new (and optionally /11x-frame or /11x-research).
disable-model-invocation: true
---

# 11x-plan

Produce the plan that implementation executes phase by phase. The interview scales to what's already decided upstream, so a well-framed change asks very little.

Load references `interview` (interactive) or `unattended-policy` (when `change.md` has `mode: unattended`), and `progress-format` (before writing `## Progress`). Load `module-design` only if the change is `type: refactor`.

## Guard

- Refuse to write under `context/archive/`.
- Requires `context/changes/<id>/change.md`. If absent, point to `/11x-new` and stop.
- Never auto-run implementation.

## Steps

1. **Gather settled context.** Read `change.md` (note `type` and `mode`), any `frame.md`, all `research/*.md`, the effort's shared `research/`+`frame.md` if this is a child change, plus `context/standards/**`, `context/foundation/lessons.md`, and `context/foundation/glossary.md`. For `source: product-factory`, also read `ux-plan.md` when present. For `factory_stage: ui-refinement`, load reference `ui-refinement` and read the approved candidate snapshot plus `ui-direction.md`; attach their paths/revisions to the plan and preserve existing behavior. Everything settled here is decided — don't re-ask it. If `mode: unattended`, also read `AGENTS.md` and project skills as priors.

2. **Fill remaining gaps.** Interactive: run the interview (`interview` reference), scaled to the gaps — if `frame.md` exists → skip framing questions, ask only about solution design; if absent → first cover the same framing ground `11x-frame` would, then move to design. Ask one question at a time, each with a recommendation; stop when remaining unknowns wouldn't change the plan. **Unattended:** do not interview; take recommended defaults; write them under `## Assumptions` in `plan.md` (and `frame.md` if you add any). Never wait.

3. **Apply the `type` gate:**
   - `defect` → the plan must reproduce the bug with a failing test first (TDD phase 1).
   - `refactor` → attach a behavior-preserving gate (tests green before/after; which of depth/locality/testability improves).
   - `migration` → include a mandatory rollback phase.
   - `feature` → no extra gate.

4. **Write `plan.md`** with these sections: Overview · Current State · Desired End State · What We're NOT Doing · Approach · (Critical Details, if any) · (Assumptions, if unattended) · `## Phase N` blocks (each: Overview, Changes Required with File/Intent/Contract, Success Criteria split into Automated/Manual as plain `-` bullets) · Testing Strategy · (Migration/Rollback if applicable) · References · **`## Progress`** (mechanical mirror per `progress-format`). Also attach:
   - **Standards to apply** — a checklist of the standards matched from `context/standards/**`.
   - **Lessons in play** — relevant priors from `lessons.md`.
   Unattended: at least one Automated criterion must be a command this repo already runs (lint, unit, e2e if present). Never add a Playwright/e2e stack.

5. **Sync lifecycle:** set `change.md` → `status: planned`, `updated: today`.

## Done when

`plan.md` exists with a valid `## Progress` and the Standards/Lessons sections. Print the next command: `/11x-plan-review <id>` (optional) or `/11x-implement <id> phase 1` / `/11x-tdd <id> phase 1`. Stop.
