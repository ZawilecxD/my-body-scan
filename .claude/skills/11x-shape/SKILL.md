---
name: 11x-shape
description: Facilitate a structured discovery conversation that turns a raw product idea into context/foundation/shape-notes.md — the input to /11x-prd. Greenfield product shaping. Use when the user says "new product", "from scratch", "shape an idea", "I have an idea", "greenfield", or "/11x-shape". Use BEFORE /11x-prd, not in place of it.
disable-model-invocation: true
---

# 11x-shape

Draw a fuzzy product idea into structured notes a PRD can be written from. This is product-level (foundation), distinct from per-change framing (`11x-frame`).

Load reference `interview` and run the whole conversation that way — one question at a time, each with a recommendation.

## Guard

- Refuse to write under `context/archive/`.
- Output is notes, not a spec — capture decisions and open questions, don't over-formalize.
- Never chain into `/11x-prd` automatically.

## Steps

1. **Read** anything already present (`foundation/vision.md`, an existing `shape-notes.md`) so you don't re-ask settled points.

2. **Interview** across, roughly: the problem and who has it; why now; the core journey; what's explicitly out of scope; the riskiest assumption; rough constraints (timeline, scale). Stop asking once further answers wouldn't change the notes.

3. **Write** `context/foundation/shape-notes.md`:

```markdown
---
context_type: greenfield
created: YYYY-MM-DD
---
# Shape notes: <idea>

## Problem & who has it
## Why now
## Core journey
## Out of scope
## Riskiest assumption
## Constraints
## Open questions
```

## Done when

`shape-notes.md` exists and captures the decisions plus open questions. Print the next command: `/11x-prd`. Stop.
