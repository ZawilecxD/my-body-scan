---
name: 11x-implement
description: Execute one phase of an approved plan.md, verify it, commit, and update the shared ## Progress. Resumes at the first unchecked step. Use when the user says "implement", "build phase N", "continue the plan", or "/11x-implement <id> [phase N]". Sibling of /11x-tdd — they write the same ## Progress and can interleave.
disable-model-invocation: true
---

# 11x-implement

Do the work of one plan phase, prove it, and record it. Straightforward execution sibling; `11x-tdd` is the test-first sibling — they share `## Progress` identically, so you can switch between them per phase.

Load reference `progress-format` before touching `## Progress`.

## Guard

- Refuse to write under `context/archive/`.
- Requires `plan.md` with a `## Progress`. If absent, point to `/11x-plan` and stop.
- Only create a commit when the user has asked to work through the plan (this skill's normal flow) — one commit per phase, never `--no-verify`.

## Steps

1. **Resolve resume point.** Parse `## Progress`: next step = first `- [ ]`; current phase = the `### Phase N:` containing it (or the `phase N` argument). Trust existing `[x]` marks.
2. **Implement the phase's steps** — make the Changes Required real. Follow the plan's Standards-to-apply checklist. Mark each `- [ ]` → `- [x]` as its step lands (no SHA yet).
3. **Verify** against the phase's Automated Success Criteria (run them). Surface Manual criteria to the user as a checklist.
4. **Commit** the phase (Conventional Commit). Then append ` — <sha>` to that phase's checked steps in one shot.
5. **Lifecycle:** set `change.md` `status: implementing` (or `implemented` when the last phase closes), `updated: today`.

## Done when

The phase's steps are `[x]` with a SHA, the commit exists, and Automated criteria pass. Print the resume command for the next phase, or `/11x-impl-review <id>` if the plan is complete. Stop — don't roll into the next phase automatically.
