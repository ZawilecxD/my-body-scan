---
name: 11x-standards-update
description: Create, edit, or promote a single standard in context/standards/ (edit-in-place, not append-only). Three inputs — a rule agreed in conversation, a graduated lesson, or --from=PATH importing a rule from another file/project. Use when the user says "make this a standard", "update our standards", "promote this lesson", or "/11x-standards-update".
disable-model-invocation: true
---

# 11x-standards-update

The write path for the standards catalog. Unlike `lessons.md` (append-only), the standards directory is edited in place.

## Guard

- Refuse to write under `context/archive/`.
- One rule per invocation. Place it by `layer × topic` — reuse an existing file if one fits; create a new file only when nothing fits.
- Keep the "do it this way" voice; example only if it clarifies.

## Inputs (pick from the invocation)

1. **Conversation** — a rule just agreed ("make this a standard").
2. **Graduated lesson** — a `lessons.md` entry that has proven repeatable; promote it and note in the lesson that it graduated.
3. **`--from=PATH`** — import a rule from another file or project.

## Steps

1. Determine the rule's `layer` (global/frontend/backend/testing) and `topic`.
2. Find the matching `standards/<layer>/<topic>.md` (or create it).
3. Add/edit the rule in place, keeping the file focused and de-duplicated.
4. If promoting a lesson, leave a one-line note in `lessons.md` that it became a standard (don't delete the lesson — that file is append-only).

## Done when

The standard is written to the right `layer × topic` file. Print what changed and stop.
