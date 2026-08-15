# Reference: change-md

The `change.md` identity file. Minimal frontmatter; everything else is derived from the filesystem and `plan.md`. Loaded by `11x-new`, `11x-diagnose`, `11x-refactor-discover`.

## Frontmatter

```yaml
---
change_id: <change-id>        # kebab-case, must match folder name
title: <human-readable>       # <=80 chars, sentence case
type: feature                 # feature | defect | refactor | migration
status: new                   # see allowed values
created: YYYY-MM-DD
updated: YYYY-MM-DD
archived_at: null             # ISO datetime, set by /11x-archive
# effort: <effort-id>         # present only for child changes of an effort
# slice: <n>                  # present only for child changes; slice number in the effort roadmap
---
```

## Body

```markdown
## Notes

<the user's intent, verbatim — or an HTML hint comment if none was given>
```

## Allowed `status`

`new`, `preparing`, `planned`, `plan_reviewed`, `implementing`, `implemented`, `impl_reviewed`, `archived`, `blocked`.

## The `type` field drives plan behavior (no orchestrator)

`11x-plan` reads `type` and adjusts a single branch of its own logic:

- `defect` → turns on the TDD gate (reproduce red first). Set by `11x-diagnose` on promotion.
- `refactor` → loads the `module-design` reference and adds a behavior-preserving gate to review (tests green before and after; did depth/locality/testability actually improve?). Set by `11x-refactor-discover`.
- `migration` → adds a mandatory rollback phase to the plan.
- `feature` → default, no extra gate.

## Not in change.md

No artifact inventory, phase counters, or `requires`/`blocked_by`. Derive those from the filesystem and `## Progress`.
