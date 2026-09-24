---
name: 11x-resume
description: Resume an existing Product Factory run from its durable checkpoint and evidence without repeating completed stages or approvals. Use for /11x-resume; individual change plans continue with 11x-implement.
---

# 11x-resume

Load `factory-delegation` from sibling `11x-references`. The calling agent remains coordinator: delegate bounded stage work to fresh workers when supported and authorized, accept their artifact evidence, and retain user decisions/checkpoints. Use recorded inline fallback otherwise. Follow this reference for ownership, context handoff and recovery; workers never recursively invoke the whole Factory.


Load references `product-factory-policy`, `mvp-status` and `ui-refinement` from sibling `11x-references`.

1. Require `context/foundation/mvp-status.md`. If missing, report that no Factory run exists and point to `11x-mvp`; do not infer approval from other files.
2. Reconcile coordinator-handoff.md and delegation task ownership/liveness first per factory-delegation; never duplicate an unresolved writer. Read current-stage evidence selectively from the checkpoint and linked artifacts, approval evidence, branch/commit state, slice plans/reviews, QA and handoff. Reconcile contradictions before writes; never reset completed work, retry history or approval history.
3. If the user requested this resume after a pause, clear the pause and return to the recorded stage. If blocked, check whether the concrete blocker changed; unchanged blockers stay blocked with the smallest required action. No repeated external operation without checking its prior result.
4. Continue `11x-mvp` in-process at the earliest incomplete preparation stage or pending decision. With valid build approval, continue `11x-mvp-build`. In version 2, `functional_ready` advances to the first incomplete UI stage. `awaiting_ui_approval` reuses saved candidates and asks only for the pending direction; `ui_implementing`/`ui_review` reuse the approved snapshot and rollout changes. Resume rendering/QA rather than regenerating designs when only verification is missing. Reuse existing approvals while their artifacts and authorized scope remain valid; changed stack/scope must pass its gate again.
5. If already ready, report the result and do not restart unless the user explicitly requested adding a UI pass; apply legacy adoption rules when applicable. If `handoff_ready`, attempt only outstanding authorized UI/QA/deployment/handoff work, not completed slices. A deferred UI pass stays deferred until the user requests it; installing updated skills alone is not that request.

This is a routing entrypoint into the existing Factory orchestrators, not a separate execution loop. Pending user decisions remain pending; elapsed time is never approval.
