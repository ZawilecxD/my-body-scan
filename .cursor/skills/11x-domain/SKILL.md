---
name: 11x-domain
description: Sharpen the project glossary when a domain term is ambiguous, overloaded, or colliding — resolve the meaning and record it in context/foundation/glossary.md. Use when a term is used two different ways, a new domain concept needs a canonical name, or someone asks "what do we mean by <term>". Safe to invoke automatically mid-task when a naming collision would otherwise cause confusion.
---

# 11x-domain

Keep the ubiquitous language sharp as work happens. Model-invocable: the agent may reach for this the moment a term is used two ways or a new concept needs a canonical name — resolving it now prevents drift later.

## Guard

- Refuse to write under `context/archive/`.
- Glossary-only. One term (or one collision) per invocation.
- If `glossary.md` doesn't exist, create it with a `# Glossary` header (or suggest `/11x-domain-discover` for a full bootstrap).

## Steps

1. Identify the term and the competing meanings in play (cite where each is used).
2. Decide the canonical definition — ask the user only if the choice is genuinely theirs to make.
3. Upsert the entry in `context/foundation/glossary.md`, and, if one usage is now "wrong", note the synonym to avoid.

## Done when

The glossary entry is canonical and unambiguous. If the collision implies code should be renamed, say so and suggest `/11x-new` for that change — don't rename code from here. Stop.
