---
name: 11x-research
description: Research one topic and save it as its own file under a container's research/ folder — change, effort, or foundation level. Fans out subagents to investigate the codebase (default) or the web (external), reuses prior findings, and stamps provenance. Use when the user says "research <topic>", "investigate", "/11x-research", or a plan needs grounding on an unknown.
disable-model-invocation: true
---

# 11x-research

One topic → one durable, refreshable file. Call it repeatedly with different topics to build several independent documents instead of one file that drifts.

Load reference `model-policy` before fanning out subagents. This skill has no mid-run interaction, so it is safe to run in an isolated subagent when your host supports it.

## Guard

- Refuse to write under `context/archive/`.
- A topic argument is required; without one, ask what to research and stop.

## Steps

1. **Resolve scope & path** from the argument:
   - `context/changes/<id>/research/<topic-slug>.md` — default, tied to one change.
   - `context/efforts/<id>/research/<topic-slug>.md` — shared by all child changes of an effort.
   - `context/foundation/research/<topic-slug>.md` — durable project knowledge, read automatically by every future plan.
   No index file — the topic list is just `ls research/`.

2. **Pick a mode from the input:**
   - **codebase** (default): fan out `Explore`/`general-purpose` subagents over facets of the topic. One facet ALWAYS searches `context/changes/**/` and `context/archive/**/` for prior decisions on the same topic — if it was researched before, cite that finding instead of re-deriving it.
   - **external** (`--url=` or `--kind=external`): use `WebFetch`/`WebSearch`; synthesize with citations and a fetch date. No MCP required.

3. **Synthesize** the subagent results into a single focused document: findings, relevant `file:line` anchors, and open questions. Don't dump raw agent transcripts.

4. **Write** the file with frontmatter:

```yaml
---
topic: <topic>
kind: codebase        # codebase | external
source: <repo | urls>
gathered: YYYY-MM-DD
git_commit: <sha>     # codebase mode only
---
```

## Done when

The `research/<topic-slug>.md` file exists with provenance frontmatter, and you print the next command (`/11x-plan <id>` or `/11x-frame <id>`). Stop.
