# Reference: mvp-status

One active Factory run per product repository. Store its checkpoint at `context/foundation/mvp-status.md`; all durable run state remains under `context/`. Initialize only once and update at stage/slice boundaries, approval decisions, blockers and before yielding. Never overwrite existing history on resume.

## Initial shape

```markdown
---
status: discovery
workflow_version: 2
ui_refinement: planned
updated: YYYY-MM-DD
integration_branch: null
---
# MVP status

## Approvals

- Stack: pending
- Build: pending
- UI direction: pending (not applicable for a product without UI)

## Stage evidence

| Stage | Result | Artifact / revision / evidence |
|---|---|---|
| Discovery | pending | |

## Slices

| Roadmap slice | Change ID | Result | Plan / review / commit evidence |
|---|---|---|---|

## Blockers and attempts

None.

## Next action

Continue discovery.

## History

- YYYY-MM-DD: Factory initialized; no approvals granted.
```

Populate values from actual work; template placeholders are not evidence. Use slice results `pending`, `building`, `verified`, `blocked`. Map each roadmap slice to a stable ordinary change ID (do not set `effort`/`slice` frontmatter unless a real effort exists). The plan remains the sole per-step progress source. Record bootstrap, QA, deployment and handoff evidence as stages.

## Status and transition rules

For version 2, load `ui-refinement` for UI stages, artifacts, direction approvals and legacy adoption. Missing `workflow_version` means version 1: preserve existing approvals and completion rules; never activate a new gate simply on upgrade.

Preparation statuses: `discovery`, `research`, `refinement`, `prd`, `ux_planning`, `awaiting_stack_approval`, `architecture`, `roadmap`, `awaiting_build_approval`. Advance only when that stage's producing contract is satisfied. Missing evidence resumes the producing stage, not the next stage inferred from a file's existence.

Execution statuses: `bootstrapping`, `building`, `functional_ready`, `ui_design`, `awaiting_ui_approval`, `ui_implementing`, `ui_review`, `qa`, `staging`, `handoff_ready`, `ready`. Only current explicit stack/build approvals allow entry to bootstrapping/building. `blocked` records stage, reason, evidence, attempts used and exact required action. `paused` is only for a user pause and records where to resume. Preserve counters and history across all statuses.

- `handoff_ready`: implementation and available evidence are packaged, but required QA, staging, access or human checks remain. List them explicitly; this is not verified MVP completion.
- `ready`: for version 2, UI refinement must be completed or justified not applicable (explicit deferral yields `handoff_ready`); every approved MVP slice is implemented with passing required tests and reviews, integrated QA covers all required acceptance criteria/NFR checks, no Critical or required Manual check remains, and the approved delivery target is verified. If the approved target is local handoff, document local run verification; if staging was promised, require a verified staging URL and deployed revision. PR merge/archive and production release are separate, never inferred from readiness.

## Approval record

For each decision record: approved/pending/revoked state, date, user wording, chosen option or authorized scope, exact artifact paths and commit/file revisions or SHA-256 hashes. Stack approval references `tech-stack.md`; build approval references `prd.md`, `tech-stack.md`, `architecture.md`, `roadmap.md`, `build-summary.md`, plus `ux-plan.md` for new version-2 runs. UI direction approval references exact candidate `.pen`/preview/manifest revisions and selected frame IDs per `ui-refinement`. Record superseding decisions in History. The summary must describe external actions and cost limits; a boolean `approved: true` alone is insufficient.

## Resume reconciliation

Read linked artifacts, branch and reachable commits, active changes and read-only archive evidence, reviews, QA and deployment results. Verify the recorded branch contains completed slice work. If a crash occurred between a commit and checkpoint update, inspect the actual diff/tests before reconciling; do not duplicate a change or rerun bootstrap blindly. Missing/inconsistent artifacts block the dependent transition until reconciled. Manual plan items remain unchecked: select the first pending Automated step during unattended execution and list Manual work in handoff. Reuse a previously created PR or deployment after checking its state. For UI stages, reconcile candidate snapshots, selected frames, rollout change IDs and final design/QA evidence as well. Do not certify a refined frontend using only baseline QA or a baseline deployment. Never regenerate approved candidates to resume implementation.

## Coordinator execution evidence

Load `factory-delegation` for worker and handoff rules. When actual Factory work starts/resumes, add `execution_mode: delegated` or `inline` to frontmatter and record capability limitations in History. This is independent of workflow_version and grants no new approval.

Maintain a compact `## Delegation tasks` table: Task ID | Stage/change | Worker ID or inline | Base/input revision | Owned paths | State | Brief/result paths. States: prepared, running, returned, accepted, blocked, interrupted. Only the coordinator updates this index; workers write their own assigned results. An index row is not evidence of current liveness or stage success. Keep acceptance evidence and attempts linked, not duplicated from plan.md.

Record a pending coordinator-handoff.md in Next action when handing over context. Retain product status and approvals. Reconcile active owners before resuming writes. Read-only status reports never initialize execution fields.
