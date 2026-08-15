# Conventions

Keep structure predictable so agents and humans find the same things in the same places.

- Put new code next to related code. Follow the directory layout the project already uses; do not invent a sibling tree.
- Configuration and secrets live in environment variables (or the project's secret store), never in source. Commit `.env.example`, not `.env`.
- Add a dependency only when the plan requires it. Pin versions the same way the rest of the repo does.
- Do not commit generated artifacts, local IDE files, or machine-specific paths.
- Fail loud at the boundary: validate inputs, return or throw explicit errors, do not swallow them.
- Logs and errors include enough context to act (what failed, which identifier) and no secrets (tokens, passwords, PII).
- Feature flags, env-specific behavior, and third-party keys are named consistently and documented where they are read.
- Keep modules cohesive. A file that imports from every layer is in the wrong place — move the code, don't add a "utils" dump.
- Prefer explicit over clever: obvious control flow beats dense one-liners and implicit magic.
- Cross-cutting rules that apply everywhere belong in `context/standards/global/`. Layer-specific rules go under `frontend/`, `backend/`, or `testing/`.
