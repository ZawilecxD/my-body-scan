---
name: 11x-status
description: Report Product Factory stage, approvals, slice evidence, QA, deployment and blockers without changing the workspace. Use for /11x-status or a Factory progress question.
---

# 11x-status


Load references `mvp-status` and `ui-refinement` from sibling `11x-references`. This skill is read-only: no initialization, checkpoint repairs, commands with side effects, or automatic continuation.

1. Read `context/foundation/mvp-status.md`. If absent, report no Factory run; point to `11x-mvp` for a new product or existing change plans for ordinary 11x work.
2. Compare checkpoint claims with referenced artifacts, slice Automated Progress, reviews, approval evidence and QA/deployment results. Report contradictions explicitly; do not silently repair them.
3. Summarize the current stage, stack/build/UI direction approval state (show not applicable for legacy/non-UI runs), functional-baseline evidence, UI refinement result and selected candidate, verified slices versus total, active slice and next Automated step, QA coverage, pending Manual checks and rollout/visual-review evidence, deployment URL/revision if verified, and blockers or user decisions needed.
4. Suggest `11x-resume` and the smallest next action. Do not imply continued execution, background scheduling, merge or deployment.

When present, report execution mode, active/unresolved delegation tasks and a pending coordinator handoff. Missing delegation fields on older runs are not an error; do not initialize them. Do not imply workers are alive solely from recorded IDs.
