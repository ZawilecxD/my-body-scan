# Reference: product-factory-policy

Optional product-level overlay for `11x-mvp` and `11x-mvp-build`. Ordinary interactive skills and ticket-only `11x-deliver` retain their contracts. Load through sibling `11x-references` before Factory work.

## Composition and authority

`11x-mvp` composes preparation contracts; `11x-mvp-build` composes approved execution contracts. `11x-resume` routes to them. `11x-ui-refine` is their scoped post-MVP subworkflow and may compose its named change/review contracts after the applicable approvals. Load `factory-delegation`: the calling agent coordinates bounded workers where authorized, with an explicit inline fallback. The executing worker or coordinator reads assigned sibling SKILL.md files and returns control to the orchestrator instead of obeying their standalone print-next-and-stop behavior. Do not change their invocation policies or auto-chain ordinary standalone invocations. A checkpoint's mere presence does not activate orchestration.

Project instructions and host permissions still apply. This overlay changes only the documented Factory behavior: stage composition, approval reuse, bootstrap authorization and product-level readiness. Within a slice, `mode: unattended` retains existing review, retry, automated/manual and handoff rules. Factory defaults to bounded delegation when the host supports and authorizes it. User decisions and global state remain coordinator-owned; local fallback and session handoff follow `factory-delegation`. No runtime, scheduler, hidden state or guaranteed background execution is introduced.

## Approval decisions

1. **Tech stack approval:** after PRD, show one recommended stack and up to two materially different viable alternatives. Explain PRD/NFR fit, MVP complexity, ecosystem maturity, documentation, agent suitability, infrastructure/cost and concrete pros/cons. Do not manufacture options. User chooses before architecture and roadmap are finalized. Even one candidate requires confirmation. Save the decision, user wording and date against the exact stack artifact revision.
2. **Build approval:** after architecture and roadmap, present a concrete build summary, including scope/exclusions, approved stack, services, expected costs, exact scaffold command, testing tools, risks, staging target and authorized external actions. Version-2 UI products also include the lightweight UX plan and a post-MVP UI refinement pass; visual alternatives are not required before build. Record explicit approval against PRD, stack, architecture, roadmap, summary and (for new version-2 runs) UX-plan revisions. Only then bootstrap or implement. Scope agreement, a generic earlier “build it”, existing files, or a proposed approval checkbox cannot substitute for this decision.

3. **Post-MVP UI direction:** for a planned UI pass, present actual rendered pen.dev alternatives based on the functional app, wait for one user choice, then apply that direction autonomously. Load `ui-refinement` for snapshot evidence, bounds, legacy adoption and readiness rules. This later choice does not reopen valid stack/build decisions or add per-screen approvals.

Use commit SHA plus file path when the approved file is committed; otherwise record a SHA-256 of the exact bytes shown and approved. Write approval evidence only after the actual user decision, never from an example or template. Do not request the same approval again when that evidence and scope remain valid.

Before build/resume, compare approved artifacts to current revisions. Investigate any mismatch. Formatting-only edits can be reconciled with documented evidence of no semantic change; never silently transfer approval to changed decisions. Material stack changes invalidate stack and build approval. Material scope, architecture, service/cost or roadmap changes invalidate build approval and route to the corresponding preparation stage. Record revocations and superseded approvals instead of deleting history.

## Autonomy after build approval

Resolve ordinary library usage, module layout, endpoint details, naming and tests autonomously within the approved stack/scope. Record meaningful assumptions. The approved scaffold command and test-tooling setup do not need separate routine confirmation. Changes to the command that alter technology, provider, costs or destructive behavior need the affected approval again.

Continue independent authorized work when possible. Stop the dependent action for missing credentials/access, unapproved spend or paid resources, destructive operations outside approval, unresolved consequential product ambiguity, material scope/stack changes, or unauthorized production deployment. Explain the concrete blocker and required action; do not create hypothetical approval checklists. Never expose secrets in artifacts.

## Functional first, visual refinement second

Load `ui-refinement` for version-2 runs. Execute lightweight UX planning before architecture/roadmap; build a coherent, usable baseline with reusable presentation components. Functional QA precedes the pen.dev design round. Use bundled Anthropic Frontend Design guidance during that round and its implementation, not as a reason to delay the baseline. A version-1 run is unchanged unless the user explicitly adopts the UI pass.

The selected UI is a presentation refinement within approved scope. Significant navigation, task-flow, schema or feature changes return to the corresponding product/build gate. Missing pen.dev never blocks initial functional work; it prevents claiming the later design stage complete. Direction selection is an intentional interactive exception after build approval. Routine implementation and propagation across screens remain autonomous.

## Evidence and delivery

Preserve archive immutability and existing `plan.md` Progress. Factory status records stage/slice evidence, not a duplicate per-step checklist. Do not use roadmap `## Done` for unmerged Factory slices; it remains owned by `11x-archive`.

Default delivery uses one dedicated integration branch and one aggregate PR, allowing dependent slices to build on previous slices without automatic merges. PR publication follows the authorized project git workflow. Production is separate. Staging must be within authorized provider/account, cost and visibility; verify the deployed revision and smoke checks. If unavailable, deliver an honest handoff with pending actions instead of inventing a URL or marking the product ready.

Bound repair attempts per existing unattended policy and persist attempts/blockers across restarts. A user pause checkpoints state and stops work. Resume is an explicit continuation, not a scheduler.
