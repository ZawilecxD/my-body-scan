# Reference: factory-delegation

Use for an explicitly active Product Factory run. The calling agent is the coordinator; do not spawn a second long-lived coordinator. Delegate bounded stage work to fresh workers when the host supports and authorizes subagents. This is an execution policy, not a new product approval or a background service.

## Coordinator and workers

The coordinator owns stage order, user conversation, approval records, mvp-status.md, integration decisions and final readiness. Keep only the current stage, approval references, task index and compact results in its context. Read full evidence selectively when a result is uncertain; do not ingest every worker transcript or log.

Workers execute stage contracts, write the assigned artifacts and return concise evidence. They cannot approve scope, stack, build or UI direction, advance the global checkpoint, publish/deploy, or spawn further workers. All delegation is through the coordinator. User decisions stay in the main conversation. A worker encountering a consequential question records it and returns needs_input without performing the dependent work; the coordinator asks the user and supplies the recorded answer to a subsequent bounded task.

Load the relevant sibling SKILL.md and references inside the worker. The coordinator reads orchestration contracts and stage guards/output requirements; it need not execute or ingest every detail of a delegated stage. Composition overrides a standalone skill's print-next-and-stop only inside the assigned scope, never as permission to start the next product stage.

## Dispatch and acceptance

1. Discover actual host delegation capabilities, context isolation, cancellation and shared-workspace behavior. Record execution_mode: delegated or inline and any capability limitation in the checkpoint. Do not install tools, change model settings or create user-visible tasks just to simulate a subagent.
2. Use a fresh worker with no inherited conversation where supported. Supply a bounded brief and artifact paths instead. If fresh context is unavailable, record that limitation; do not claim context isolation. Inherit the session model by default, subject to applicable model-policy and host constraints.
3. Before dispatch, write context/foundation/delegation/<task-id>/brief.md with stage/change ID, concrete objective, skill/reference paths, relevant inputs and revisions, approved scope/evidence, repository path and base revision, allowed output paths, code/tool permissions, acceptance criteria, attempts already used, and actions requiring coordinator input. Exclude secrets and unrelated history.
4. Register the task in mvp-status.md before starting it. Record owner/worker ID when available and state running. Permit writes only to the assigned paths. Workers write result.md next to the brief, with outcome complete / needs_input / blocked, produced paths and revisions, commit if any, commands/checks and their actual results, unresolved findings, questions and next action. Return a short summary plus that path; large logs/screenshots remain linked files. Do not copy complete inputs into the report.
5. A returned complete is only a claim. Check expected artifacts and revisions, approved scope, relevant diff, test/review evidence and task completion with released write ownership (a confirmed idle, reusable worker is sufficient; destroying the agent is not required). Accept or reject the result before advancing the stage. Do not repeat expensive passing checks without changed code or unresolved evidence. Missing evidence cannot pass. Persist applicable repair/review counters; replacing a worker does not reset them.
6. Mark accepted results in the task index and link canonical stage evidence. Never create a second progress checklist: change plan.md still owns per-phase progress. Results describe an attempt; foundation documents remain canonical decisions.

## Stage routing

| Stage | Worker responsibility | Coordinator responsibility |
|---|---|---|
| Discovery / refinement | Analyze the current brief and prepare options or draft artifacts | Conduct the interview, resolve choices and dispatch the next bounded drafting task |
| Research | Independent research facets with source evidence; one synthesis task owns final report | Select relevant facets, accept synthesis and route product decisions |
| PRD / stack | Draft agreed requirements or compare viable stacks | Validate settled scope and obtain explicit stack choice |
| UX / architecture / roadmap | Draft one stage from accepted upstream artifacts | Accept in dependency order; resolve consequential questions |
| Build summary | Assemble a concrete summary from accepted artifacts | Present summary and record explicit build approval |
| Bootstrap / implementation | One bootstrap task or one change phase with verification | Enforce approval, write ownership and dependency order |
| Plan / implementation review | Fresh reviewer inspects actual artifacts/diff; report only | Route fixes to a writer, enforce bounded retries and accept review evidence |
| Functional QA / design review / final QA | Execute bounded verification and save real evidence | Check required coverage, defects and readiness |
| UI alternatives / rollout | Produce saved designs or implement one approved rollout change | Present proposals, record selection, then accept rollout and final QA |
| Delivery | Prepare handoff and verify evidence in read-only tasks | Perform authorized integration/publication/deployment and verify target |

A stage can use several bounded tasks separated by decisions or dependencies. Do not put an entire interactive stage or the whole MVP into one opaque worker. Unattended planning/triage may be delegated only with its approved inputs and bounded scope; new questions return to the coordinator. Standalone interactive skills retain their original behavior.

## Concurrency and repository ownership

Default to one writer at a time in a shared checkout. Parallelize independent read-only research/review tasks with distinct report paths and fixed input revisions. Do not run review or browser QA against a moving checkout/app. Serialize canvas/browser sessions and shared development servers unless the host provides genuinely isolated instances.

Parallel implementation requires explicit non-overlapping ownership, isolated checkouts, settled shared interfaces and an integration plan. Otherwise stay sequential; stage dependencies remain sequential even when workers are used. Isolated worker changes must be reviewed and integrated by the coordinator, then verified on the integration revision before dependent slices run. Only one aggregate Factory PR is published by the coordinator.

At a user pause, cancellation or scope change, stop dispatch, request workers stop, wait for task completion/cancellation and confirmed release of write ownership, and reconcile partial writes before releasing ownership. A cancellation request alone is not proof a worker stopped writing. If release of ownership cannot be established, record the owner as unresolved and block overlapping work.

## Context and session handoff

Checkpoint after each accepted task, before a decision gate, before compaction/session handoff and before any long task likely to consume the remaining context. If the host exposes context usage, use it; never invent token percentages. Otherwise use stage boundaries and accumulated context as qualitative signals. Split large tasks before dispatch rather than expecting an unlimited worker context.

When context pressure warrants a fresh session, quiesce workers and write context/foundation/coordinator-handoff.md with stage, branch/revision, approval paths/hashes, accepted and unresolved task IDs, ownership/partial writes, retry counters, pending questions, blockers and exact next action. Keep mvp-status.md authoritative; the handoff links evidence rather than duplicating product documents.

If the host offers authorized compaction or continuation, use it and reconcile afterward. Otherwise tell the user to open the same repository in a fresh conversation and invoke 11x-resume. Preserve the current product status; context pressure is neither a user-requested paused state nor a product failure. Never promise automatic context clearing, session creation or work after the host closes.

On resume, read checkpoint and handoff first, then only current-stage evidence. Query recorded live worker IDs when possible. Do not redispatch a running or possibly writing task. If worker liveness is unavailable, establish quiescence before overlapping writes; then inspect files, commits and checks to accept partial completion or issue a remaining-work task. Approval validity, attempts and prior successes survive a new coordinator session.

## Fallback and compatibility

Without authorized delegation, record inline mode and execute the same bounded tasks locally, using the same artifacts and checkpoints. Be explicit that this does not isolate context; use session handoff when needed. Do not stall solely because subagents are unavailable.

Old checkpoints may lack delegation fields. Add them only when resuming actual work, preserving workflow_version, approvals, product status and retry history. This policy does not activate UI refinement on legacy runs or invalidate approved artifacts. Read-only 11x-status never initializes these fields.
