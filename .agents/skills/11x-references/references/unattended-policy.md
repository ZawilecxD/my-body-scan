# Reference: unattended-policy

Overlay for `mode: unattended` on `change.md`. Interactive skill defaults are unchanged when `mode` is absent. Loaded by `11x-deliver` and by plan / implement / tdd / review-triage / diagnose when they detect that flag.

## Detection

Read `context/changes/<id>/change.md`. `mode: unattended` → this file. Missing `mode` → interactive contracts (`interview`, one-phase stop, ask-which-findings).

If `source: product-factory`, also load `product-factory-policy` and validate current stack/build approval evidence in `context/foundation/mvp-status.md` before product-code writes, including a standalone implement/tdd/triage invocation. Missing or stale approval blocks implementation and returns to the relevant Factory decision. For `factory_stage: ui-refinement`, also validate current UI direction approval against the recorded candidate snapshot before implement/tdd/triage writes; a general build approval is insufficient. This guard does not authorize chaining a standalone invocation.

These per-change rules do not bypass the orchestrator's UI direction choice. Required final visual checks remain readiness gates even when a single unattended slice may hand off non-blocking polish.

## Never interview

Do not ask the user. For every question you would have asked: take the recommendation, write it under `## Assumptions` in `frame.md` and/or `plan.md`. Continue.

## Abort vs ship

Stop writing product code, still write/update `handoff.md`, stamp `status: blocked` (unless an MR is already the right vehicle — then `mr_ready` with an honest “not done” handoff) when:

- Ticket AC cannot be expressed as at least one **runnable** Automated Success Criterion this repo already knows how to run
- Product fork with no safe recommended default
- Would change a shared public UI kit / cross-app contract outside the ticket’s stated scope
- Ticket is clearly several vertical slices (refuse to auto-create an effort)
- A **Critical** review finding remains after **one** triage pass
- Automated criteria still red after retries (one tight fix pass, then stop)

**May ship**, listed on the MR for the human:

- Copy, i18n, visual polish, a11y spot-checks with no existing test
- Suggestion / Nice-to-have review findings
- Out-of-scope bugs found mid-run
- “Click through X in staging” when CI has no seed data

## Triage

Apply **Critical** only. Park Suggestion / Nice-to-have in `handoff.md`. Do not ask which findings to apply.

## Manual Progress

Never tick Manual `## Progress` items. Copy them into `handoff.md` as a reviewer checklist. Only Automated items may be `[x]`’d by the agent.

## Automated gate

The gate is the plan’s **Automated Success Criteria** — commands this repo already runs (lint, unit, affected tests, e2e). Detect Playwright (or other e2e) from config, existing specs, or `AGENTS.md`; if present **and** the change is UI, prefer adding/extending a spec. If absent, do **not** add a Playwright (or e2e) stack. At least one runnable Automated criterion is required.

## Diagnose mid-run

Trivial → fix inline in the current change, leave a regression test. Do **not** seed a sibling `change.md`. Non-trivial or out of scope → follow-up on `handoff.md`. If the bug blocks Automated criteria, abort.

## Priors

Treat `AGENTS.md` and the project’s own skills as settled, alongside `context/standards/**`, `lessons.md`, and `glossary.md`. Project skills win on how to touch this repo; 11x sequences the work.

## Git host

Never hardcode `gh`, `glab`, GitHub, or GitLab APIs. Open the MR with the **project’s** git/MR skill or MCP. If none exists, leave `handoff.md` as the paste-ready MR body and say so.

## Chain exception

`/11x-deliver` and the Product Factory orchestrators (`/11x-mvp`, `/11x-mvp-build`, and their scoped `/11x-ui-refine` subworkflow, routed by `/11x-resume`) may run sibling skill **contracts** in-process (read their `SKILL.md`, execute the steps, do not stop between them). Interactive `/11x-plan` / `/11x-implement` / `/11x-tdd` still stop after their own Done-when. Deliver loops implement; implement does not loop itself.
