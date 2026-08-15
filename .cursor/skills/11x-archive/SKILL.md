---
name: 11x-archive
description: Archive a completed change or effort by moving its folder to context/archive/<created-date>-<id>/, stamping its status/archived_at, and closing the matching roadmap item. Use when the user says "archive this change", "close it out", "/11x-archive", or when work is finished and reviewed.
disable-model-invocation: true
---

# 11x-archive

Move finished work out of the active set and stamp it closed. Effort progress is derived, so archiving is per-change; an effort is implicitly done once all its child changes are archived.

Load reference `progress-format` if you need to check Progress completeness.

## Guard (hard stops)

- Uncommitted changes inside the target folder → stop; ask the user to commit first.
- Pre-existing staged changes elsewhere in the repo → stop.

## Soft warnings (confirm to proceed)

- `status` isn't `impl_reviewed` (or at least `implemented`).
- `## Progress` still has unchecked `- [ ]` steps.
- No `reviews/impl-review*.md` present.
- Checked steps missing their ` — <sha>` suffix.

## Steps

1. Resolve the target (`context/changes/<id>/` or `context/efforts/<id>/`). Read `change.md`/`effort.md`.

2. **Stamp** the identity file (only these three fields):

```yaml
status: archived
archived_at: <ISO-8601 UTC>
updated: <YYYY-MM-DD today>
```

3. **Move** it: prefer `git mv context/changes/<id> "context/archive/<created>-<id>"` where `<created>` is the frontmatter `created:` date. Then `git add` the stamped file.

4. **Close the roadmap item** if a matching entry exists in a `roadmap.md` (effort or foundation): flip its status to `done` and append a line to that roadmap's `## Done` section noting the archive path and date.

5. **Commit**: `chore(archive): close <id>` (no body).

## Done when

The folder lives under `context/archive/<created>-<id>/`, the identity file is stamped and committed, and any matching roadmap item is closed. After this, all 11x skills refuse writes under `context/archive/`. Stop.
