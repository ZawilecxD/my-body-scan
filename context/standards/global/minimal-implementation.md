# Minimal implementation

Build what the current change asks for. Nothing else.

- Implement the plan's scope, not a more general version of it. Do not add parameters, flags, or layers "for later."
- No speculative abstractions: no extra interfaces, wrappers, or indirection until a second real caller needs them.
- No future stubs: no empty modules, unused config keys, or placeholder endpoints waiting for a follow-up change.
- Do not introduce a new dependency when existing code or the standard library already covers the need.
- Prefer extending an existing function or module over creating a parallel one. Duplication of two similar lines is cheaper than a premature helper.
- YAGNI applies to tests as well: cover the behavior in the plan, not hypothetical callers.
- If a requirement is ambiguous, stop and ask. Guessing a larger design is not "being helpful."
- Refactor only the code the change must touch. Drive-by cleanups belong in their own change.
- When the plan and a "nicer" architecture disagree, follow the plan. Propose the nicer version after the change lands.
- Done means the success criteria pass — not that the design is ready for every imagined sequel.
