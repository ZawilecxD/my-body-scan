---
name: 11x-qa
description: Verify an assembled Product Factory MVP against PRD acceptance criteria and NFRs, including cross-slice journeys. Use after roadmap implementation or to recheck Factory QA; per-change reviews use 11x-impl-review.
---

# 11x-qa


Load references `product-factory-policy` and `mvp-status` from sibling `11x-references`. Require the approved PRD, architecture, roadmap and implemented slice evidence. Missing implementation is incomplete QA, never a pass. QA reports findings; the Factory build contract owns repairs.

## Mode

`functional` writes `context/foundation/functional-qa-report.md` for the baseline before UI refinement; omit the argument for final `qa-report.md`. Functional mode verifies required behavior, journeys and accessibility, but defers aesthetic refinement. Final mode after UI rollout also reads `ui-direction.md`, rollout changes and `design-review.md`; require current visual evidence for any adopted UI pass, including one recorded as completed. Neither mode treats a visual proposal as a tested application.

## Steps

1. Read PRD acceptance criteria, NFRs, architecture test strategy, slice plans/reviews and handoffs. Record the exact code revision and environment under test.
2. Map each MVP requirement and critical user journey to a test/check and result. Run relevant build, lint, unit, integration and existing e2e tests. Verify cross-slice flows, auth/data isolation, error paths and persistence where applicable. Use available browser tooling for UI journeys; record actual observations, not assumed passes.
3. Write the report for the selected mode: requirement coverage table, commands/results/evidence, environment/revision, regressions, severity, unresolved findings and Manual checks. Distinguish passed, failed, blocked, not run and not applicable. Justify not-applicable entries. A skipped or unavailable check is never passed.
4. Treat failed acceptance criteria, Critical findings and unverified required checks as readiness blockers. Carry non-blocking suggestions into handoff. Manual plan checkboxes remain untouched; verified QA observations and user-provided Manual evidence live in this report with attribution.

## Done when

The report gives an evidence-based pass/fail/incomplete result. Under Factory, return to `11x-mvp-build` for repair or staging/handoff. Standalone, print the report path and next action and stop. Do not deploy or claim MVP ready from this skill alone.
