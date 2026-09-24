---
name: 11x-product-research
description: Research competitors, users, pricing, feasibility and product opportunities for a shaped greenfield idea. Use during Product Factory or after 11x-shape; per-change technical investigations use 11x-research.
---

# 11x-product-research


Load reference `product-factory-policy` from sibling `11x-references`. Require `context/foundation/shape-notes.md`; if absent, point to `11x-shape` and stop. Research informs decisions; it does not approve scope or select the stack.

## Steps

1. Read shaping notes and existing research. Identify questions that could change the MVP: target users and complaints, competing solutions and substitutes, market patterns, pricing, integration feasibility and gaps worth solving.
2. Use available web/search/browser or relevant connectors. Prefer first-party product, pricing and API documentation for factual claims. Record source URL, access date, relevant evidence and uncertainty for each important claim. Distinguish observed evidence, inference and hypotheses; never fabricate user interviews or market size.
3. Write focused files under `context/foundation/product-research/`: `competitors.md`, `users.md`, `pricing.md`, `technical.md`, `opportunities.md`, and `synthesis.md`. Include market context where relevant. Avoid filler: explicitly mark unsupported areas or unavailable sources and their decision impact.
4. In synthesis, summarize implications for the MVP, recommended scope changes, risks and the few product decisions needing the user. If sources are unavailable, preserve partial findings and state the limitation; do not claim completed research. Continue independent work and bring material uncertainty to refinement.

## Done when

Synthesis links the evidence and identifies unresolved questions. Print `11x-product-refine` and stop when standalone. Under Factory, checkpoint research evidence and return to the orchestrator.
