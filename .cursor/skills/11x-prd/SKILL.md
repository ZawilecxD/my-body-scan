---
name: 11x-prd
description: Generate context/foundation/prd.md from shape-notes.md (or raw notes) against a fixed section schema. Auto-routes greenfield (10 sections) vs brownfield (11 sections). Use when the user says "write the PRD", "generate PRD", "create the PRD from notes", or "/11x-prd". Use AFTER /11x-shape.
disable-model-invocation: true
---

# 11x-prd

Transcribe shaping notes into a schema-conformant PRD. Because framing already happened in `11x-shape`, this skill does not re-interview — it structures and fills gaps, asking only where a required section is genuinely undetermined.

Load reference `prd-schema` for the exact sections and frontmatter.

## Guard

- Refuse to write under `context/archive/`.
- Input: `context/foundation/shape-notes.md` (preferred) or a raw notes path given as argument. If neither exists, tell the user to run `/11x-shape` first and stop.
- Do a structural self-check before writing; if a required section is empty and can't be resolved, report and STOP — never ship a partial PRD.

## Steps

1. Read the notes and detect `context_type` (frontmatter, else infer from cwd: an existing codebase → brownfield).
2. Map notes onto the schema sections. For any required section with no source material, ask one targeted question (recommendation included) rather than inventing content.
3. Write `context/foundation/prd.md` with the schema frontmatter and sections. Keep team/stack/deployment decisions OUT — they belong downstream.
4. Self-check: every functional requirement is verifiable; no empty required section.

## Done when

`prd.md` passes the self-check and is written. Print the next command:
- greenfield → `/11x-tech-stack-selector`
- brownfield → `/11x-roadmap` (foundation mode)
Stop.
