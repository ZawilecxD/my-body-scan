---
name: 11x-new
description: Router that starts new work — creates either a single change (context/changes/<id>/change.md) or a larger effort (context/efforts/<id>/effort.md) and points at the next step. Decides change-vs-effort from the size and clarity of the request, or honors an explicit --effort / --change flag. Use when the user says "new change", "start work on", "new effort", "/11x-new", or names something to build/fix.
disable-model-invocation: true
---

# 11x-new

The single entry point for new work. Route to a **change** (one coherent unit) or an **effort** (a big feature or refactor cluster that splits into several changes), then create the identity file and hand off.

Load reference `change-md` for the `change.md` schema before writing.

## Guard

- Refuse to write anything under `context/archive/`.
- `context/changes/` (or `context/efforts/`) parent must exist; if not, tell the user to run `/11x-init` first. Do not auto-create the root.
- No argument → print the usage examples below and STOP, waiting for input.

## Steps

1. **Parse the input.** Derive a kebab-case slug for the id and treat the rest as freeform intent. You judge what's id vs intent vs path (strip a leading `@` and trailing `/`, take the last path segment). Validate the slug against `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` and uniqueness across `context/changes/`, `context/efforts/`, and `context/archive/`. On collision, ask for a different slug.

2. **Route change vs effort.** Default heuristic:
   - **Effort** if the work naturally spans several layers/stages or is a cluster of related changes (a new sizable feature, a refactor cluster from `11x-refactor-discover`).
   - **Change** otherwise (one focused unit that flows straight to a plan).
   - Honor an explicit `--effort` / `--change` flag over the heuristic. If genuinely ambiguous, ask one question.
   - If the input is `<effort-id> <slice-n>` (a slice from an effort roadmap), create a **child change** under that effort: copy `effort`/`slice` into its `change.md` frontmatter so it inherits the effort's research and frame.

3. **Create the identity file.**
   - Change → `context/changes/<id>/change.md` (frontmatter per `change-md` reference; `type: feature` unless the intent clearly says defect/refactor/migration; intent verbatim in `## Notes`).
   - Effort → `context/efforts/<id>/effort.md` with frontmatter (`effort_id`, `title`, `status`, `created`, `updated`) and a `## Goal` section: one paragraph defining success.

4. **Hand off.** Suggest the next command and stop:
   - Change → `/11x-plan <id>` (or `/11x-research <id> <topic>` / `/11x-frame <id>` if the intent signals unknowns or contested framing).
   - Effort → `/11x-research <effort-id> <topic>` then `/11x-frame <effort-id>`, then `/11x-roadmap <effort-id>` to decompose into slices.

## Usage

```
/11x-new oauth-login add Google sign-in to the settings page
/11x-new --effort billing-revamp rework the whole billing stack
/11x-new billing-revamp 2        # child change: slice 2 of the billing-revamp effort
```

## Done when

The identity file exists with valid frontmatter, and the next command is printed. Effort progress is never a checkbox — an effort is done when all its child changes have `archived_at` set. Do not chain.
