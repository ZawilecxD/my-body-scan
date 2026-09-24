---
name: 11x-domain-discover
description: Bootstrap a ubiquitous-language glossary for a brownfield project into context/foundation/glossary.md, mined from identifiers, docs, and schema. Use when the user says "build the glossary", "discover domain terms", "/11x-domain-discover", typically once per project. Glossary-only — no behavior, just shared definitions.
disable-model-invocation: true
---

# 11x-domain-discover

Seed the shared vocabulary so every plan and review uses the same words for the same things. Safe to isolate in a subagent (writes only `glossary.md`).

Load reference `model-policy` for fan-out.

## Guard

- Refuse to write under `context/archive/`.
- Glossary-only: definitions of terms, not rules or behavior. Rules live in `standards/`, warnings in `lessons.md`.
- Self-bootstrap `glossary.md` with a `# Glossary` header if absent.

## Steps

1. Fan out subagents over recurring identifiers (types, entities, table names), README/docs, and any schema, to find the domain nouns that carry meaning.
2. Keep terms that are genuinely domain language — skip generic programming words.
3. Write `context/foundation/glossary.md`, alphabetized:

```markdown
# Glossary

- **<Term>**: <one-sentence definition>. <optional: where it lives / synonyms to avoid>
```

## Done when

`glossary.md` holds the core domain terms. Print a summary and stop. (Ongoing term collisions are sharpened by `/11x-domain`.)
