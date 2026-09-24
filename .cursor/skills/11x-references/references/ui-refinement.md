# Reference: ui-refinement

Product Factory builds a usable functional MVP first, then refines its appearance with a user-selected direction. Lightweight UX is part of the initial plan. The existing stack/build gates remain; the post-MVP direction choice is the one additional normal user decision for UI work, not a per-screen approval process.

## Scope and timing

Before build, `11x-ux-plan` specifies journeys, navigation, screen IDs, states and usability requirements in `context/foundation/ux-plan.md`. Architecture and slice plans use shared components, semantic styling tokens and separated presentation/domain logic. A coherent baseline, responsive behavior and basic accessibility are required from the start. Do not spend the initial build budget on full design variants, elaborate motion or styling every screen twice.

The build summary includes `ui_refinement: planned` for a UI product, the expected pen.dev review step and authorized tool/cost scope. No pen.dev connection is needed to build and test functionality. A non-UI product records `not_applicable` with a reason. An explicit user choice can set `deferred`; absence of a tool is not such a choice.

After required functional QA and the working baseline are recorded, run `11x-ui-refine`. Functional QA may defer aesthetic polish, but not broken journeys or required accessibility. Use actual content and observed states for proposals. Restrict alternatives to representative screens; roll the chosen direction out autonomously to the rest.

## Artifacts

All paths below are relative to `context/foundation/`:

- `ux-plan.md`: lightweight pre-build behavior and baseline rules; included in new build approvals.
- `functional-qa-report.md`: functional baseline evidence, with immutable source revision; retain it after final QA.
- `ui-refinement.md`: functional baseline revision/environment, capability status, representative screen IDs, candidate revisions, chosen direction, stable rollout change IDs/results, blockers/attempts and next action. Per-step progress remains in each change's plan.
- `design/baseline-review.md` and `design/baseline/`: rendered baseline evidence and improvement opportunities.
- `design/candidates/<revision>/`: immutable saved `.pen` proposals, rendered previews and `options.md` mapping screen IDs to candidate frame IDs. The comparison includes recommendation, trade-offs and rollout scope. Save/hash these before asking; do not overwrite candidates the user has seen.
- `ui-direction.md`: the selected candidate/frames, semantic tokens, component rules and permitted presentation adaptations, derived from the approved snapshot. No new product decisions.
- `design/rollout.pen`: mutable working design for remaining views and states. Changes here do not silently change the approved reference snapshot.
- `design-review.md`, `design/final/` and `qa-report.md`: final visual/interaction evidence and integrated regression results for the implemented revision.

## Checkpoint and approval

For new runs set `workflow_version: 2` in `mvp-status.md` and initialize `ui_refinement: planned` for UI products (or `not_applicable` with a reason). UI results are `planned`, `in_progress`, `completed`, `deferred`, `not_applicable`. Direction approval in `## Approvals` starts pending and is independent of stack/build approval. Missing approval always means unapproved.

Before presenting candidates, record their exact `.pen`, export and `options.md` revisions (commit/path or SHA-256), candidate and frame IDs, plus baseline revision and approved UX scope. Only an actual user selection of these displayed designs grants direction approval. Record wording/date, selected ID and immutable references in both checkpoint approval evidence and the linked UI record; the checkpoint is authoritative if they disagree. Verify the supporting record before code writes. Derive `ui-direction.md` from this choice and record its revision; do not treat generation of this file as approval of additional decisions.

Reusing approval requires unchanged selected reference evidence and equivalent product/UX constraints. A newer code commit alone does not invalidate the choice; inspect whether screens, content contracts or behavior materially changed. A new visual direction revokes only direction approval; a changed task flow, navigation contract, data model, scope, stack or spend returns to the relevant product/build gate as well. Ordinary implementation details, responsive adaptations and propagation of the selected design do not trigger another approval.

UI implementation changes carry `source: product-factory` and `factory_stage: ui-refinement`. Their plans reference the current direction and approved snapshot; the flag triggers approval checks even if implement/tdd/triage is invoked directly. Planning and report-only review can run while approval is pending; refinement code cannot. Existing product functionality and baseline repairs are not blocked by the pending visual choice.

## Stages, resume and completion

Preparation adds `ux_planning` after PRD and before architecture/roadmap. Execution after functional QA is:

`functional_ready` → `ui_design` → `awaiting_ui_approval` → `ui_implementing` → `ui_review` → final `qa` → `staging` → delivery.

`functional_ready` is a checkpoint, not a terminal success state: automatically continue to proposals when possible. At a UI input gate, wait for the user; do not relabel it blocked or paused. `blocked` records `resume_stage`, reason and required action. Missing pen.dev/browser access preserves functional readiness evidence but blocks the dependent design/verification work. A user pause is explicit. Resume must inspect existing candidates/exports and approved frame IDs, reuse rollout change IDs and retry history, and continue the first incomplete UI stage without rebuilding the functional MVP or regenerating accepted proposals. Missing post-selection artifacts are reconstructed from the immutable approved snapshot, not treated as a new aesthetic decision.

UI completion requires every planned rollout change reviewed, required rendered/interaction checks passed and final functional QA passed. Preserve baseline QA as historical evidence; after UI code changes it cannot certify the final build. Record evidence revisions and verify that subsequent changes did not invalidate tests. Update/reverify staging for the final code; a deployment of the baseline is not final delivery evidence. A newly requested pass after explicit deferral returns to `planned` with the request in History; do not leave it deferred while attempting rollout.

`ready` requires `ui_refinement: completed` or justified `not_applicable`, in addition to existing QA/delivery gates. Explicit `deferred` can produce `handoff_ready` with a working functional MVP and recorded remaining UI work, not fully refined `ready`. Aesthetic suggestions outside the chosen direction need not block completion; substantial deviations from it do. Standalone `11x-ui-refine` requires an existing Factory run; other apps need explicit adoption rather than fabricated approvals.

## Legacy runs

An absent workflow version means version 1. Do not retroactively require `ux-plan.md`, a design choice or pen.dev, mutate old approved documents, or reopen a ready run merely because the toolkit was updated. Preserve the original completion rules unless the user explicitly adds UI refinement. On adoption, record that instruction and a scoped UI-pass addendum in `ui-refinement.md`/History, derive the UX baseline from the working app, and retain original stack/build approval revisions. Set version 2 with an explicit `legacy_build: true` marker recording why the original build approval excludes the derived UX plan. The addendum authorizes proposal preparation and subsequent rollout after direction approval within existing scope. It does not authorize changing product behavior, stack or costs. A legacy ready/merged run gets a new recorded refinement branch from the current product checkout; never write to archives or try to republish a merged PR. Final handoff uses that branch's new PR. Once adopted, apply the version-2 UI completion rules.

An existing passing `qa-report.md` may supply the legacy baseline if its revision and required checks still match the working app. Preserve a copy as `functional-qa-report.md` with its original attribution/revision before final QA replaces the report; otherwise run functional QA. Do not demand a duplicate test run merely because the original report used the old filename.
