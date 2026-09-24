---
name: 11x-init
description: Scaffold the context/ workflow directory and seed the baseline standards. Idempotently creates context/{foundation,standards,efforts,changes,archive}/ with README markers, and writes the three global standards files if absent. Use when starting 11x in a repo, or when the user says "init 11x", "set up context", "scaffold the workflow".
disable-model-invocation: true
---

# 11x-init

Create the `context/` state directory once, so every other 11x skill has somewhere to read and write. Idempotent: create-if-absent, never overwrite.

## Guard

- If `context/` already exists, report what's present and create only the missing pieces. Never clobber an existing file.
- Everything 11x needs lives under `context/`. Do not scatter state elsewhere.

## Steps

1. Create the tree (only the missing parts):

```
context/
├── foundation/
│   ├── README.md
│   └── research/README.md
├── standards/
│   ├── global/
│   ├── frontend/
│   ├── backend/
│   └── testing/
├── efforts/README.md
├── changes/README.md
└── archive/README.md
```

2. Seed `standards/global/` with three short files **only if absent** (~20–30 lines each):
   - `coding-style.md` — naming, formatting, no dead code.
   - `minimal-implementation.md` — build what's asked; no speculative abstractions or future stubs.
   - `conventions.md` — predictable structure, env vars not secrets in code, minimal dependencies.
   Leave `frontend/`, `backend/`, `testing/` empty on purpose — `11x-standards-discover` fills them per project.

3. Each `README.md` states, in one or two lines, what the folder holds (e.g. `changes/` = in-flight work, one folder per change-id; `archive/` = read-only completed work).

4. Do NOT create `lessons.md`, `glossary.md`, `prd.md`, etc. — those are self-created by the skills that own them on first use.

## Done when

The tree exists, the three global standards are seeded, and you print a short summary plus the suggested next command: `/11x-new <id>` for a change, or the greenfield chain `/11x-shape` for a new product. Stop — do not chain.
