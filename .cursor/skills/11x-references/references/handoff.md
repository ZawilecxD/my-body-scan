# Reference: handoff

The MR body source for an unattended change. Path: `context/changes/<id>/handoff.md`. Written and updated by `/11x-deliver` (and by implement / triage / diagnose when they append Manual items or follow-ups). Not a git-host client — the project’s MR skill/MCP reads this file.

## Shape

```markdown
# Handoff: <id>

Ticket: <key or URL>
Status: mr_ready | blocked

## What landed
- Phase N: <name> — <sha>
- …

## Assumptions
- <default taken instead of an interview answer>

## Reviewer checklist (manual)
- [ ] <unticked Manual Progress item>
- [ ] <Suggestion / Nice-to-have the agent did not apply>

## Automated evidence
- `<command>` → pass | fail
- (optional) e2e trace/log path if the project already has e2e

## Follow-ups / out of scope
- …

## Context paths
- `context/changes/<id>/change.md`
- `context/changes/<id>/plan.md`
- `context/changes/<id>/ticket.md`
```

## Rules

- Lead with the ticket link and an honest status. If work aborted, say what blocked and what (if anything) is on the branch.
- Do not claim Manual items are done.
- `What landed` lists only phases that have a SHA.
- After the host skill returns a URL, stamp `mr_url` on `change.md`; repeat the URL at the top of this file.
