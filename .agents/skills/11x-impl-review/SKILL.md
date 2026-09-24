---
name: 11x-impl-review
description: Post-implementation gate that reviews the implementation against the plan for drift, dangerous decisions, pattern/standards compliance, and test coverage — report-only. Offers to record a lesson. Use when the user says "review the implementation", "check the code against the plan", or "/11x-impl-review <id>", after /11x-implement or /11x-tdd.
disable-model-invocation: true
---

# 11x-impl-review

Check that what was built matches what was planned, and is safe. Report-only, which makes it safe to run in an isolated subagent.

Load reference `model-policy` — fan out review facets; use the strong tier for architectural/safety judgment.

## Guard

- **Report-only.** Never edit code, `plan.md`, or `change.md`. Route fixes to `/11x-review-triage`.
- Refuse to operate under `context/archive/`.

## Steps

1. Read `plan.md` (+ `## Progress`), `change.md` (type), `context/standards/**`, `lessons.md`, and the diff of the change's commits.
2. Fan out review facets (per `model-policy`):
   - **Drift** — does the code do what each phase's Changes Required / Contract said?
   - **Safety** — dangerous decisions, missing error handling, security/data risks.
   - **Patterns & standards** — honors `context/standards/**` and the matched Standards-to-apply checklist.
   - **Type gate** — for `refactor`, tests green before/after and depth/locality/testability improved; for `migration`, rollback present; for `defect`, a regression test remains.
   - **Coverage** — Automated Success Criteria actually exercised.
3. Write `context/changes/<id>/reviews/impl-review.md`: findings tagged **Critical / Suggestion / Nice-to-have** with concrete fixes.
4. If a finding is a durable lesson, offer to run `/11x-lesson` (don't run it silently).
5. **Lifecycle:** set `change.md` `status: impl_reviewed`, `updated: today`.

## Done when

`reviews/impl-review.md` is written and status stamped. Print the next command: `/11x-review-triage <id>` (if findings), else `/11x-archive <id>`. Stop.
