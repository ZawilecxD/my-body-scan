---
name: 11x-ui-refine
description: Refine the UI of a verified functional Product Factory MVP using actual screen evidence, pen.dev design alternatives and bundled Anthropic Frontend Design guidance. Let the user choose one direction, then implement it autonomously without changing approved UX or product scope.
---

# 11x-ui-refine

Load `factory-delegation` from sibling `11x-references`. The calling agent remains coordinator: delegate bounded stage work to fresh workers when supported and authorized, accept their artifact evidence, and retain user decisions/checkpoints. Use recorded inline fallback otherwise. Follow this reference for ownership, context handoff and recovery; workers never recursively invoke the whole Factory.


Load references `product-factory-policy`, `mvp-status` and `ui-refinement` from sibling `11x-references`. Load [Frontend Design by Anthropic](references/frontend-design/SKILL.md) for design choices and self-critique; provenance and license are in [UPSTREAM.md](references/frontend-design/UPSTREAM.md). Read [pen.dev integration](references/pen-dev.md) before canvas work.

This is a coordinator-managed Factory subworkflow, also explicitly invokable for an existing Factory MVP. It may compose the named change and review contracts below. An ordinary standalone core skill still stops. Use the approved PRD/UX as the brief: aesthetic advice never authorizes new features, invented product claims, a landing-page hero in an application screen, a different stack or changed navigation. Do not run this design round during initial MVP construction.

## Guard

- Require current build approval, `ui_refinement: planned` or `in_progress`, a working app and passing required functional baseline evidence. On a legacy run without the UI pass, follow adoption rules in `ui-refinement`; never rewrite approved artifacts just to add a gate.
- Preserve functional code while proposing variants. No refinement code writes before current UI direction approval. Honor project/host permissions and never modify archive contents or unrelated `.pen` documents.
- If already completed with valid evidence, report it; do not regenerate alternatives. A new aesthetic direction requires a user request.

## Steps

1. **Baseline.** Reconcile `mvp-status.md` and `ui-refinement.md`. Use `11x-design-review baseline` to inspect the running app and capture its actual routes, representative states, data and screenshots. Record source revision and environment. Functional/accessibility blockers return to build repairs; aesthetic improvement opportunities remain design input. Reuse saved baseline evidence if still representative.
2. **Design alternatives.** Choose two or three representative screens by coverage (or all if fewer): e.g. overview, dense list/detail and a form. In pen.dev, create two distinct directions; add a third only when it adds a meaningful alternative. Keep the same screen IDs, content, actions and state coverage across variants. Apply Frontend Design's intentional typography, hierarchy and product-specific choices; avoid recoloring the same template. Save actual editable `.pen` designs plus rendered previews, not just prose descriptions. Inspect the renders yourself and fix clipping, poor contrast, inconsistent states or unreadable content before showing them.
3. **One interactive choice.** Present previews side by side with a recommendation and concrete readability, density, brand-fit and implementation trade-offs. Allow discussion or requested revisions; do not regenerate continuously. Before asking, save an immutable candidate snapshot and its revisions as specified in `ui-refinement`. Set `awaiting_ui_approval`. Wait for the user's direction choice. Record the exact snapshot, selected frame IDs, user wording and scope of rollout; silence or the earlier build approval is not a visual choice.
4. **Autonomous rollout.** After selection, derive `ui-direction.md` and reusable tokens/components from that exact approved snapshot. Extend the direction to remaining screens, mobile and relevant states in a separate working `.pen` document; do not request per-screen approval. Record a coverage/rollout table in `ui-refinement.md`. Create or reuse ordinary changes on the existing integration branch with `source: product-factory`, `factory_stage: ui-refinement`, `mode: unattended` and `type: refactor` for presentation-only changes. A reproduction-backed behavioral defect uses `type: defect`. Keep change IDs stable; do not rewrite the approved product roadmap or reopen completed slice plans.
5. **Implement.** For each coherent rollout change, execute `11x-new`, `11x-plan`, `11x-plan-review`, Critical `11x-review-triage`, phase-by-phase `11x-implement`/`11x-tdd`, and `11x-impl-review` contracts. Read the selected design and shared tokens as settled input. Run tests before and after presentation refactors. Use the existing stack and real data bindings; no demo-only replacement of functionality. Persist review/repair attempts under unattended policy; Manual items stay unchecked. Review is separate from applying fixes. Bound each failed check or Critical review to one focused repair/triage pass then recheck, blocking if unresolved.
6. **Verify the result.** Execute `11x-design-review final` on the rendered app, then `11x-qa` for final integrated regression evidence. Repair blocking in-scope mismatches once through the owning change and repeat affected checks; persist attempts. Route significant UX changes to product refinement instead of disguising them as styling. Mark UI completed only when rollout changes, required visual/interaction checks and final QA pass for the resulting revision.

## Done when

The run is waiting for a real direction choice, blocked on concrete tooling/evidence, or the selected UI is implemented and verified. Checkpoint before returning. Completed refinement returns to `11x-mvp-build` for final staging/handoff; standalone execution reports the result and stops without deploying or publishing. Never mark the whole MVP ready from a canvas preview alone.
