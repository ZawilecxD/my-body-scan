---
name: 11x-review-triage
description: Triage the findings from a plan-review or impl-review report and apply the fixes the user chooses — the one place review findings turn into edits. Use when the user says "triage the review", "apply the review fixes", "act on the findings", or "/11x-review-triage <id>", after /11x-plan-review or /11x-impl-review.
disable-model-invocation: true
---

# 11x-review-triage

The review skills only report. This is the named, deliberate place where their findings become edits — so fixes never happen silently inside a review. Runs an interactive selection loop, so it must NOT be isolated in a subagent.

## Guard

- Refuse to operate under `context/archive/`.
- Only act on findings that exist in a review report — don't invent new ones. If you spot something new mid-fix, note it as a finding, don't silently expand scope.

## Steps

1. Read the latest `context/changes/<id>/reviews/*.md` (plan-review and/or impl-review).
2. Present findings as a checklist grouped by severity (Critical / Suggestion / Nice-to-have). Ask the user which to apply (default: all Critical).
3. For each chosen finding, apply the fix:
   - Plan finding → edit `plan.md` (keep `## Progress` titles intact — don't rename steps).
   - Code finding → edit code; if it changes behavior, add/adjust a test.
4. Re-run the relevant Automated Success Criteria for anything touched.
5. Note in the report which findings were applied vs deferred.

## Done when

The chosen fixes are applied and verified, and the report reflects what was done. Print the next command: re-run the relevant review, `/11x-implement <id>` if a plan fix reopened work, or `/11x-archive <id>`. Stop.
