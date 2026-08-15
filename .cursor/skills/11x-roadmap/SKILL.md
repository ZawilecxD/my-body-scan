---
name: 11x-roadmap
description: Decompose a goal into ordered vertical slices, each mapping to one future child change. Two modes — foundation (from the PRD, one roadmap for a greenfield project) or effort (scoped to one effort, no PRD required). Use when the user says "write the roadmap", "what should I build first", "slice this effort", "/11x-roadmap <effort-id>", or "/11x-roadmap" after a PRD. Do NOT use for per-change planning — that's /11x-plan.
disable-model-invocation: true
---

# 11x-roadmap

Turn a big goal into a sequence of **vertical slices** — each slice is a tracer bullet that cuts through every layer it needs (schema → api → ui), not "all of layer X, then all of layer Y". Each slice points at exactly one future child change.

Load reference `interview` for the short decision conversation.

## Guard

- Refuse to write under `context/archive/`.
- Do NOT create change folders — each slice only *names* a future `/11x-new` command. Slices become changes when work actually starts.
- Never chain automatically.

## Mode selection

- **Effort mode** — argument is an effort id (`context/efforts/<id>/`). Reads `effort.md` `## Goal`, plus the effort's `research/` and `frame.md` as settled. Writes `context/efforts/<id>/roadmap.md`. No PRD needed.
- **Foundation mode** — no effort id; reads `context/foundation/prd.md` (+ `tech-stack.md`, `lessons.md`). Writes `context/foundation/roadmap.md`.

## Steps

1. Read the source-of-truth for the mode (goal or PRD) plus its settled upstream docs. Treat those as decided — don't re-ask them.
2. Derive candidate slices in dependency order. Each slice must be independently demoable and cross the layers it touches.
3. **Interview only where dependency order doesn't decide it**: which slice goes first, whether to prioritize by risk or smallest demoable piece. One question at a time.
4. Write the roadmap: a numbered slice list. For each slice — outcome, layers touched, and a ready-to-paste next command:
   - effort mode: `/11x-new <effort-id> <slice-n>`
   - foundation mode: `/11x-new <suggested-change-id>`
   Include an empty `## Done` section (only `/11x-archive` writes there at close time).

## Done when

`roadmap.md` lists ordered slices, each with its paste-ready `/11x-new ...` command, and `## Done` is present-but-empty. Print the first slice's command. Stop.
