---
name: 11x-design-review
description: Inspect the actual rendered Factory app for baseline UI opportunities or final fidelity to an approved design, including mobile and interaction states. Produces evidence and findings only; does not modify application code or approve a design.
---

# 11x-design-review


Load references `ui-refinement` and `mvp-status` from sibling `11x-references`. Accept `baseline` before proposals or `final` after rollout (default final). Read the PRD, UX plan, actual routes and relevant QA; final additionally requires the current approved design snapshot and rollout mapping.

## Steps

1. Open the running app with available browser/computer tools, using permitted test data. Record the code revision, app URL/environment, viewports and screen/state IDs. Preserve before/after images under `context/foundation/design/`; sanitize sensitive data before saving or passing it to design tools. If rendering/interaction tools are unavailable, report the exact missing checks as not run; source-code inspection is not visual verification.
2. Inspect the main journeys at desktop and mobile widths appropriate to the product. Cover navigation clarity, information hierarchy, density, text wrapping/overflow, consistent controls, empty/loading/error/validation states, visible keyboard focus, usable contrast, reduced motion where relevant and primary actions. Check behavior by interacting, not just looking at a screenshot.
3. Baseline: write `context/foundation/design/baseline-review.md`, linking screenshots and listing functional usability/accessibility blockers separately from optional aesthetic opportunities. Use this to select representative screens; do not demand visual polish before proposing a direction.
4. Final: write `context/foundation/design-review.md` mapping implemented screen IDs/components to approved reference frames/tokens and before/after evidence. Compare equivalent viewports, data and states; explain intentional responsive adaptations. Identify visual divergence, lost functionality and regressions. Passing lint or a screenshot-diff threshold alone cannot establish visual quality or usable UX.
5. Classify findings as blocking (required acceptance/accessibility checks, broken journeys, or substantial deviation from the selected direction) or non-blocking (subjective optional polish). Assign stable IDs and owning rollout changes; report pass/fail/incomplete with evidence. Keep unseen screens and untested states visible. Do not tick Manual plan items, change code or silently waive checks.

## Done when

The report gives the UI refinement owner actionable findings. Return to `11x-ui-refine` when composed; standalone print the report and next action and stop. Missing required visual evidence prevents UI completion even when automated functional tests pass.
