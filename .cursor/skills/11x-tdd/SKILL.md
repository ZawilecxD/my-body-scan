---
name: 11x-tdd
description: Test-first execution sibling of /11x-implement — drives one plan phase through RED (failing test) → GREEN (make it pass) → REFACTOR, writing the same shared ## Progress. Use when the user says "tdd", "test-first", "red green refactor", or "/11x-tdd <id> [phase N]", especially for type:defect changes. Interleaves freely with /11x-implement.
disable-model-invocation: true
---

# 11x-tdd

Same job as `11x-implement`, but test-first. It writes the identical `## Progress` format, so phases done via TDD and via plain implement mix freely within one plan.

Load reference `progress-format` before touching `## Progress`.

## Guard

- Refuse to write under `context/archive/`.
- Requires `plan.md` with `## Progress`. If absent, point to `/11x-plan` and stop.
- One commit per phase; never `--no-verify`.

## Steps

1. **Resolve resume point** the same way as implement: first `- [ ]`, within its `### Phase N:`.
2. For each step in the phase, cycle:
   - **RED** — write the failing test that pins the behavior; run it, confirm it fails for the right reason.
   - **GREEN** — write the minimum code to pass; run the test.
   - **REFACTOR** — clean up with tests staying green; apply the plan's Standards.
   Mark `- [ ]` → `- [x]` as each step lands.
3. **Verify** the phase's Automated Success Criteria; surface Manual ones.
4. **Commit** the phase; append ` — <sha>` to its checked steps in one shot.
5. **Lifecycle:** update `change.md` status/updated as in implement.

## Done when

The phase is `[x]` with a SHA, tests are green, and the commit exists. Print the next phase's resume command, or `/11x-impl-review <id>` when the plan is done. Stop.
