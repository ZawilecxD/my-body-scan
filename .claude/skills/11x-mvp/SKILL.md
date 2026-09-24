---
name: 11x-mvp
description: Guide a greenfield idea through Product Factory discovery, research, product refinement, stack choice, build approval, autonomous implementation, post-MVP UI refinement, and QA. Use for an idea-to-MVP request or /11x-mvp; existing tickets use 11x-new or 11x-deliver.
---

# 11x-mvp

Load `factory-delegation` from sibling `11x-references`. The calling agent remains coordinator: delegate bounded stage work to fresh workers when supported and authorized, accept their artifact evidence, and retain user decisions/checkpoints. Use recorded inline fallback otherwise. Follow this reference for ownership, context handoff and recovery; workers never recursively invoke the whole Factory.


The Product Factory entrypoint. Compose installed sibling contracts under one coordinator; the executing coordinator or worker reads each assigned SKILL.md before performing it. Do not require users to invoke every stage. Load references `product-factory-policy`, `mvp-status` and `ui-refinement` from sibling `11x-references`.

## Guard

- Read project instructions and inspect the workspace first. This is an optional greenfield workflow; do not replace an existing product or overwrite its foundation. If an MVP checkpoint exists, resume it. If an existing codebase has no Factory checkpoint, clarify whether this is an intentional adoption before changing its foundation.
- A request to start Factory authorizes preparation, not product implementation. Both stack selection and build approval require an explicit user decision. No code scaffolding, dependency installation, or deployment before build approval.
- Refuse writes under `context/archive/`. Use available host tools; no custom runtime, scheduler, or database.

## Steps

1. **Initialize / resume.** Run `11x-init` in-process if needed. Create `context/foundation/mvp-status.md` using the reference only if absent. Preserve existing artifacts. On resume reconcile the checkpoint with its evidence before selecting the next stage; never reset approvals or completed work merely because the session restarted.
2. **Discovery.** Execute `11x-shape` interactively. With no idea argument, begin by asking what problem the user wants to solve. Reuse settled answers.
3. **Research and refinement.** Execute `11x-product-research`, then `11x-product-refine`. Research autonomously; discuss material product choices with the user. Execute `11x-prd` using the agreed notes and decisions. Do not turn uncertain research claims into requirements.
4. **Stack decision.** Execute `11x-tech-stack-selector`. Present one recommendation and up to two meaningful alternatives, with concrete advantages, disadvantages, costs and reasons. Wait for the user's choice even if there is only one viable stack. Record approval evidence before proceeding.
5. **Plan the build.** For new version-2 runs, execute `11x-ux-plan` for lightweight UX (no visual variants or extra approval), then `11x-architecture`, then foundation-mode `11x-roadmap`. An existing version-1 run keeps its original preparation requirements unless explicitly adopting the UI pass. Include testable slice acceptance criteria, dependencies and stable change IDs. Routine ordering decisions may use recommendations; ask about remaining product trade-offs. No bootstrap yet.
6. **Build decision.** Write and present `context/foundation/build-summary.md`: product goal, MVP scope and exclusions, approved stack, architecture, ordered slices, exact starter command, test tooling, external services, expected development/hosting costs with assumptions, risks, staging/handoff target, `ux-plan.md`, and the post-MVP UI pass (pen.dev, representative-screen budget, direction choice and autonomous rollout). Missing design-tool access does not block the functional build. Include the artifact revisions being approved and the permitted external actions. Set `awaiting_build_approval` and wait. Only an explicit approval of this concrete summary grants build authorization. An earlier approval of scope or stack does not count.
7. **Build.** Record the user's approval and its artifact revisions in the checkpoint. Execute `11x-mvp-build`, which owns bootstrap, functional slices/QA, post-MVP UI refinement, final QA and staging/handoff. Continue until ready, the post-MVP direction choice, a real blocker, or a user-requested pause; checkpoint before yielding.

## Done when

At an input gate, show the decision needed. At handoff, report the verified result, QA evidence, actual staging URL if available, and pending work. Never claim the app is ready solely because planning finished. Standalone stage skills still stop; only this explicit Factory session composes their contracts.
