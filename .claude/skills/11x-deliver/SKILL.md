---
name: 11x-deliver
description: Unattended ticket-to-MR pipeline — ingest a Jira (or pasted) ticket, plan without interview, implement every phase, review, and open an MR for a human to merge. Use when the user says "deliver this ticket", "implement unattended", "/11x-deliver PROJ-123", or a CI job starts an agent with a ticket key. Do not use for interactive planning.
disable-model-invocation: true
---

# 11x-deliver

The ticket-level 11x orchestrator — chaining only in-process. Product Factory has separate product-level orchestrators (`11x-mvp` / `11x-mvp-build`); this ticket contract stays single-slice. Execute sibling skill *contracts* (read their `SKILL.md` and run the steps) under `unattended-policy`. Never invoke `/11x-plan` / `/11x-implement` as nested user commands, and never flip those skills to model-invoked.

Load references `unattended-policy`, `change-md`, `handoff`, and `progress-format`.

## Guard

- Refuse to write under `context/archive/`.
- `context/` must exist; if not, point to `/11x-init` and stop.
- Refuse `--effort` and any request that is clearly several slices — abort to `handoff.md` (`status: blocked`).
- Require a ticket key (e.g. `PROJ-123`) or a pasted ticket body. No argument → print usage (`/11x-deliver PROJ-123`) and stop.
- Do not merge. Do not archive. Do not wait for a human mid-run.

## Steps

1. **Ingest or resume.** Prefer the project's issue-tracker skill/MCP; else the pasted body / `TICKET_BODY`. Derive kebab-case id from the ticket key (`proj-123`); uniqueness as in `11x-new`. If `context/changes/<id>/` already exists with `mode: unattended`, skip ingest and resume at the first `- [ ]` in `## Progress` (CI retries). Otherwise write `change.md` (`mode: unattended`, `source`, `ticket`), `ticket.md` (verbatim AC — do not summarize away constraints), and `frame.md` (Problem, Chosen direction, Not doing, Assumptions, Abort-if) with no interview. Abort here if AC is not testable or the ticket is multi-slice.

2. **Priors.** Read `AGENTS.md`, project skills, `context/standards/**`, `lessons.md`, `glossary.md`. Optional in-process research (`11x-research` contract) if the ticket names an unfamiliar area.

3. **Plan.** Execute the `11x-plan` contract under `unattended-policy`. Require at least one runnable Automated Success Criterion from this repo's actual test/lint commands. Playwright/e2e only if already present; never add a stack.

4. **Plan-review → Critical triage once** (`11x-plan-review` then `11x-review-triage` contracts). Still Critical → abort to handoff.

5. **Loop implement.** Execute the `11x-implement` or `11x-tdd` contract one phase at a time until Automated Progress is complete. On Automated red after retries → abort to handoff. Manual items → `handoff.md`, never `[x]`. Mid-run diagnose: trivial inline; no sibling change.

6. **Impl-review → Critical triage once.** Still Critical → abort to handoff.

7. **Handoff.** Write `handoff.md` per the `handoff` reference. Open the MR with the **project's** git skill/MCP (never hardcode `gh`/`glab`). If none is configured, stop and say to paste `handoff.md` as the MR body. Stamp `change.md` `status: mr_ready` (or `blocked`) and `mr_url` if returned.

## Done when

`handoff.md` exists, status is `mr_ready` or `blocked`, and an MR is open or the paste-ready body is printed. Print the MR URL. Stop — do not merge, do not archive.
