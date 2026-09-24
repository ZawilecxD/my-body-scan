# Reference: model-policy

How to choose the model when an 11x skill fans out subagents. This is the portable replacement for a frontmatter `model` field (which Cursor ignores). Apply it at runtime.

## Two levels of delegation — don't confuse them

1. **Whole-skill isolation** (Claude Code `context: fork` / a dedicated subagent): run the entire skill in a fresh subagent with no chat history, argument in → file out. Suitable ONLY for skills with zero mid-run interaction: `11x-research`, `11x-plan-review`, `11x-impl-review`, `11x-standards-discover`. Skills that run an interview or a confirmation loop (`11x-plan`, `11x-frame`, `11x-roadmap`, `11x-review-triage`) must NEVER be isolated this way — isolation returns a single final result and cannot hold a one-question-at-a-time loop.
2. **In-body fan-out**: the skill, running normally, spawns a subagent for one concrete sub-task (search, claim verification, a self-contained implementation slice). This is where the table below applies.

## Product Factory bounded tasks

Inside an active Factory run, load `factory-delegation`. Its coordinator may delegate a noninteractive portion of planning, refinement or triage with settled inputs and explicit ownership. The worker returns unresolved questions rather than conducting an isolated interview. This does not allow whole interactive stages to run without the coordinator. Factory retry budgets take precedence over model escalation: switching workers or models never resets attempts. Use live host tool schemas rather than assuming a specific Task interface.

## Model selection for in-body fan-out

| Model tier | Use for | Examples |
|---|---|---|
| **Cheap / fast** (Cursor: fast Task tier; Claude: Haiku; Codex: fast GPT) | Mechanical, high-volume, low-judgment work | grep-shaped search, collecting `file:line`, applying an already fully-specified edit |
| **Default / mid** (session default) | Most fan-out and synthesis | codebase research facets, drift checks |
| **Strong** (Cursor: high-reasoning tier; Claude: Opus; Codex: high-reasoning GPT) | Where a wrong call is expensive to catch later | architectural-fitness judgment in `plan-review`, ranking hypotheses on a bug that survived the first pass |

## Applying it

- **Cursor**: pass `subagent_type` + `model` to the Task tool. If the Task tool can't set the exact tier, run the default and note it.
- **Claude Code**: spawn the matching subagent; let it inherit unless the task warrants a stronger/cheaper model.
- **Codex**: spawn a subagent if the host exposes one; otherwise do the sub-task inline. Prefer the cheap/fast model for grep-shaped work and the high-reasoning model for architectural judgment.
- **Portable default**: `inherit` the session model unless the sub-task clearly matches the cheap or strong row.

## Retry rule

If a cheaper model returns shallow output or skips something requested, do **not** hand-patch it — re-run the sub-task on a stronger model. A rerun is cheaper than building further on a weak pass.
