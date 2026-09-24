# Reference: prd-schema

Section schema for `context/foundation/prd.md`. Loaded by `11x-prd`. Greenfield uses 10 sections; brownfield adds an 11th (§0). Write every applicable section; omit a section only when it is genuinely N/A and say so.

## Frontmatter

```yaml
---
project: <name>
version: 1
status: draft            # draft | approved
created: YYYY-MM-DD
context_type: greenfield # greenfield | brownfield
product_type: <web app | api | cli | mobile | ...>
target_scale: <mvp | growth | ...>
timeline_budget: <free text or N/A>
---
```

## Sections

0. **Existing System** *(brownfield only)* — what exists today, constraints inherited, what must not break.
1. **Problem & Users** — who hurts, what hurts, why now.
2. **Goals & Non-Goals** — measurable goals; explicit non-goals.
3. **Core User Journeys** — the 1–3 journeys that define the product.
4. **Functional Requirements** — capabilities, grouped; each testable.
5. **Data & Domain** — key entities and their relationships (seeds the glossary).
6. **External Interfaces** — integrations, APIs, third parties.
7. **Non-Functional Requirements** — performance, security, scale, accessibility.
8. **Success Metrics** — how you'll know it worked.
9. **Risks & Open Questions** — what could sink it; what's still unknown.

## Guardrails

- No team/stack/deployment decisions here — those belong in `tech-stack.md` (greenfield) or `stack-assessment.md` (brownfield).
- Every functional requirement must be verifiable. If you can't state how you'd check it, it's not a requirement yet.
- Do a structural self-check before writing to disk; if a required section is empty, report and stop rather than shipping a partial PRD.
