---
name: 11x-references
description: Thin loader for shared 11x reference snippets. Other 11x skills invoke it with a topic (e.g. "load interview", "load model-policy") to read references/<topic>.md on demand instead of duplicating the text. Not a standalone workflow skill.
disable-model-invocation: true
---

# 11x-references

A shared library so 11x skills don't copy the same text between each other. A skill names a topic; you read only that one file into context.

## How skills call this

A skill says: **"load reference `<topic>`"**. Resolve it to `references/<topic>.md` inside THIS skill folder and read that file. Load only the requested topic — never the whole set.

## Topics

| Topic | File | Loaded by |
|---|---|---|
| `interview` | `references/interview.md` | `11x-frame`, `11x-plan`, `11x-roadmap` |
| `model-policy` | `references/model-policy.md` | any skill that fans out subagents |
| `progress-format` | `references/progress-format.md` | `11x-plan`, `11x-implement`, `11x-tdd`, reviews, `11x-archive` |
| `change-md` | `references/change-md.md` | `11x-new`, `11x-diagnose`, `11x-refactor-discover` |
| `module-design` | `references/module-design.md` | `11x-refactor-discover`, `11x-plan` (when `type: refactor`) |
| `prd-schema` | `references/prd-schema.md` | `11x-prd` |

## Done when

The requested topic file has been read into context. If a skill asks for an unknown topic, list the table above and stop.
