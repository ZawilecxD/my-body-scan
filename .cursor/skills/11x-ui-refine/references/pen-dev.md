# pen.dev / Pencil adapter

Use pen.dev for editable proposals after the functional MVP. This reference is an integration contract, not an installer. It does not declare a fake remote MCP URL, assume a specific tool schema or grant permission to modify host configuration.

## Connect and inspect

Use the live tool list for the installed version. Current official docs describe `read_skill`, `get_app_state`, `get_style` and `execute`; older installations may differ. Read the exposed schemas, then pen.dev's `read_skill()` design guidance and task-relevant references before editing. Inspect application state and confirm the exact product `.pen` path before every batch of changes. Do not target whichever document happens to be active.

For desktop/IDE MCP, pen.dev must be running with the intended document open. Cursor uses the IDE extension and its MCP integration. Codex connects through the supported Codex MCP integration on the same host. If tools are not visible, give the concrete connection action and checkpoint; never claim a design was generated. Do not prescribe a fixed executable path from another machine. The separately documented pen CLI is an optional route only when available and authorized; do not assume MCP can work headlessly merely because the CLI exists.

## Create reviewable designs

Start from recorded app screenshots, screen/state IDs, sanitized representative content, UX constraints and component inventory. Create variants under `context/foundation/design/`, with labeled frames and shared styles/components where supported. Use the connected tool's supported document APIs; do not invent `.pen` JSON fields or shell commands. Reinspect results after each bounded batch. Save the document and render/export previews through available tools, then actually view the images.

Before requesting a direction choice, save the candidate `.pen` snapshot, exports and comparison manifest with stable paths and revisions/hashes. Keep them unchanged after approval; use a separate working document for rollout. Record frame IDs as well as filenames so resume can recover the intended option. A canvas is a design artifact, not proof of working navigation: validate the implemented journey in the app.

Default to two design directions across two or three representative screens, one reviewable batch and one user choice. Add a third direction only with a useful reason. Additional exploration follows user feedback, not an unbounded self-improvement loop. Use external subagents only when authorized by the host/user; ordinary local execution is sufficient.

If a write/export fails, inspect whether it partially succeeded before retrying. Preserve good frames and stable IDs. Missing rendering/export support or an inaccessible canvas is a concrete blocker for the design stage. Continue other authorized preparation and preserve the functional MVP; do not replace actual designs with textual suggestions and mark the stage complete. A different tool or deferral requires a recorded user choice.

## Official references

Verified 2026-09-22; prefer the installed version's schemas when they differ.

- [Installation and supported clients](https://docs.pencil.dev/getting-started/installation)
- [MCP connection and tool availability](https://docs.pencil.dev/getting-started/ai-integration)
- [Design instructions and alternatives](https://docs.pencil.dev/core-concepts/ai-agents)
- [Standalone CLI](https://docs.pencil.dev/for-developers/pen-cli)
