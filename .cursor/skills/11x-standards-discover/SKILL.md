---
name: 11x-standards-discover
description: Mine coding standards from a project's enforced config and repeated code patterns into context/standards/{frontend,backend,testing}/. Extracts, not guesses — reads linters/formatters/tsconfig/CI/hooks first, then fans out one subagent per layer. Use when the user says "discover standards", "extract our conventions", "/11x-standards-discover", typically once per project after /11x-init.
disable-model-invocation: true
---

# 11x-standards-discover

Fill the standards catalog from what the project already enforces, not from opinion. Report-only against the codebase (it only writes under `context/standards/`), so it's safe to isolate in a subagent.

Load reference `model-policy` — fan out one subagent per layer; mechanical config-reading can use the cheap tier.

## Guard

- Refuse to write under `context/archive/`.
- Leave `standards/global/` alone unless a genuinely new cross-project rule surfaces — it's seeded by `11x-init`.
- One example is not a standard. Only record a pattern that repeats across multiple files.

## Steps

1. **Read enforced config first** — linter/formatter rules, `tsconfig`/compiler strictness, CI checks, pre-commit hooks. A rule in the linter is enforced, not aspirational; capture those with highest confidence.
2. **Fan out** one `Explore` subagent per layer (`frontend`, `backend`, `testing`) to find repeated patterns in actual code.
3. **Keep only repeated patterns.** Write focused files like `standards/frontend/components.md`, `standards/backend/api.md`, `standards/testing/unit.md` — each in "do it this way" voice, with an example only when it actually clarifies.

## Done when

The relevant `standards/<layer>/*.md` files exist, each grounded in enforced config or repeated code. Print a summary of what was captured and the next command: `/11x-plan <id>` (plans now read this catalog). Stop.
