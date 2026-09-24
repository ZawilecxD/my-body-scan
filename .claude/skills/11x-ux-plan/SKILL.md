---
name: 11x-ux-plan
description: Plan lightweight user flows, screens, navigation and UI states before a Product Factory build. Set a usable baseline and make later visual refinement inexpensive; do not produce full visual variants before the functional MVP.
---

# 11x-ux-plan


Load references `product-factory-policy` and `ui-refinement` from sibling `11x-references`. Require the settled PRD. This is product preparation, not frontend implementation or a separate approval gate.

## Steps

1. Read PRD, product decisions and existing project constraints. For a product with no user-facing UI, record that fact and `ui_refinement: not_applicable`; do not invent screens or require pen.dev.
2. Write `context/foundation/ux-plan.md`: primary user tasks, navigation, screen inventory with stable IDs, key flows, roles/permissions visible in the UI, and success/empty/loading/error/validation states. Identify mobile behavior, keyboard/focus needs and the most important journey checks. Use short flow sketches where helpful; no high-fidelity design round here.
3. Choose a coherent baseline within the selected stack (or keep it framework-neutral until stack selection). Plan shared components, centralized semantic color/type/spacing tokens, responsive layouts and separation of presentation from domain logic. Preserve existing branding and accessibility. No extra UI framework, font service or paid asset is implied.
4. Resolve routine layout decisions autonomously and record assumptions. Ask only when a missing answer changes the product's tasks or behavior. Include remaining consequential decisions in product refinement; do not turn this into an interview about every screen.
5. Include the UX plan and the post-MVP UI pass in the build summary: default `ui_refinement: planned` for UI products, pen.dev as the design backend, representative-screen limit, one user direction choice, autonomous rollout and final regression/visual checks. The build approval covers this process; it does not preselect a design.

## Done when

The PRD can be built into a usable baseline and future UI refinement can reuse its components. Standalone: print `11x-mvp` to continue preparation and stop. Factory: return to architecture/roadmap without an extra UX approval. Missing pen.dev never blocks this stage or functional implementation.
