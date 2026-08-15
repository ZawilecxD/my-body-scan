# Coding style

Write code a later reader (human or agent) can trust without archaeology.

- Match the naming already in the file and nearby modules. Do not invent a parallel convention.
- Prefer descriptive names over abbreviations. A name should say what the thing is, not how it is implemented.
- Keep formatting consistent with the project's formatter and linter. Do not hand-format against them.
- One idea per function; one responsibility per module. If a function needs a comment to explain *what* it does, rename it instead.
- Delete unused code, imports, variables, and commented-out blocks in the same change that makes them dead. Do not leave "just in case" remnants.
- Do not leave `TODO`, `FIXME`, or `HACK` comments unless they name a concrete follow-up change-id.
- Comments explain *why* a non-obvious choice was made. They do not narrate the code.
- Public APIs, types, and error messages stay in English. Domain terms match `context/foundation/glossary.md` when it exists.
- Prefer early returns over deep nesting. Flatten conditionals rather than wrapping the happy path in `else`.
- Do not mix unrelated edits into a change. Style-only churn on untouched files is out of scope.
