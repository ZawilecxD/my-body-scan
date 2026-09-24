---
name: 11x-architecture
description: Write a practical greenfield architecture from the PRD and user-approved tech stack before roadmap and build approval. Use during Product Factory or after stack selection.
---

# 11x-architecture


Load reference `product-factory-policy` from sibling `11x-references`. Require `context/foundation/prd.md` and a confirmed `tech-stack.md`. In Factory, require current stack approval evidence in `mvp-status.md`; a proposal file alone is insufficient. Do not scaffold code or silently change the approved stack.

## Steps

1. Read the PRD, product decisions, research feasibility findings, approved stack, `ux-plan.md` when present and project constraints. For UI products, plan shared components and semantic styling tokens with presentation separated from domain logic; honor the UX screen/state map. Avoid adding a design system framework solely for later polish.
2. Write `context/foundation/architecture.md`: system boundaries and responsibilities, major data entities and ownership, API/integration contracts, authentication/authorization, critical journeys, NFR handling, deployment topology, environment/secrets requirements, test strategy and proposed test tooling, cost assumptions, risks and rollback approach.
3. Keep detail proportional to the MVP. Identify the smallest viable architecture and decisions needed before build; avoid speculative scale infrastructure. Use a small diagram if it clarifies boundaries.
4. Trace architecture and test strategy to requirements. If feasibility requires a different foundational technology, return to stack selection with evidence, invalidate dependent build approval, and wait for the new user choice.

## Done when

Architecture supports roadmap slicing and the build summary without unresolved implementation-blocking decisions. Print `11x-roadmap` and stop when standalone.
