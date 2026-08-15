# Reference: progress-format

The `## Progress` contract in `plan.md`. Single source of truth for what's done and where to resume. Writers: `11x-implement`, `11x-tdd`. Readers: `11x-plan-review`, `11x-impl-review`, `11x-archive`.

## Location

Exactly one `## Progress` section, at the very bottom of `plan.md`, after `## References`.

## Structure

```markdown
## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: <phase name>

#### Automated

- [ ] 1.1 <step title>
- [x] 1.2 <step title> — abc1234

#### Manual

- [ ] 1.3 <step title>

### Phase 2: <phase name>
...
```

## Rules

- Phase blocks elsewhere in `plan.md` use plain `-` bullets. ONLY `## Progress` uses `[ ]`/`[x]`.
- Step format: `- [ ] <phase>.<index> <title>` or `- [x] <phase>.<index> <title> — <sha>` (7+ hex chars).
- Titles are immutable after plan review. Indices are 1-based and never renumbered.
- Append the SHA at **phase end**, in one shot, after the phase's closing commit. A mid-phase `[x]` without a SHA is valid.

## Resume parsing

- **Next step** = first `- [ ]` in document order.
- **Current phase** = the `### Phase N:` containing that line (or the last phase if all are `[x]`).
- **Completion** = `count([x]) / count([ ] + [x])`.
- **`phase N` argument** = jump to the first `- [ ]` under `### Phase N:`.
- Existing `[x]` marks are trusted on resume.
