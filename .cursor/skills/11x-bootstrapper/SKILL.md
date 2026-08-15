---
name: 11x-bootstrapper
description: Scaffold the project into the current directory after the stack is chosen. Reads context/foundation/tech-stack.md, runs the starter CLI with a conflict policy that always preserves context/, and writes a verification log. Use when the user says "bootstrap the project", "scaffold the app", "set up the codebase", or "/11x-bootstrapper". Use AFTER /11x-tech-stack-selector.
disable-model-invocation: true
---

# 11x-bootstrapper

Run the chosen starter to create the actual codebase, without destroying the `context/` workflow directory that already lives here.

## Guard (hard rules)

- **`context/` is sacred.** The starter must never overwrite, move, or delete anything under `context/`. If the CLI wants a clean directory, scaffold in a temp subdir and merge back, preserving `context/`.
- Refuse if `context/foundation/tech-stack.md` is missing — run `/11x-tech-stack-selector` first.
- Never run a destructive git command. If the tree is dirty, stop and ask.
- Confirm the exact CLI command with the user before executing it.

## Steps

1. Read `tech-stack.md` for the starter command and versions. Confirm current syntax via Context7 if unsure.
2. Confirm the command with the user, then run it under the conflict policy above.
3. Install dependencies; run the starter's own smoke check (build / dev server boots / test runner runs).
4. Write `context/foundation/bootstrap-log.md`: command run, versions installed, verification results, anything that needed manual resolution.

## Done when

The project scaffold exists alongside an intact `context/`, the smoke check passed (or failures are logged), and `bootstrap-log.md` is written. Print the next command: `/11x-roadmap` (foundation mode) to slice the PRD into buildable milestones. Stop.
