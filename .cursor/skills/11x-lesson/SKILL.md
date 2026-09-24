---
name: 11x-lesson
description: Capture one recurring rule or pitfall into context/foundation/lessons.md as an append-only entry, and flag it for promotion to a standard if it looks repeatable. Use when the user says "record a lesson", "capture this learning", "/11x-lesson", or after a review surfaces a mistake worth remembering.
disable-model-invocation: true
---

# 11x-lesson

Append one durable lesson so future plans and reviews inherit it as a prior. Lighter than 10x's four-question version, because standards and the glossary now hold the rest of project knowledge.

## Guard

- `lessons.md` is **append-only**. Never edit or delete existing entries.
- Self-bootstrap the file with a `# Lessons` header if it doesn't exist.

## Steps

1. **One question**, only if the finding isn't already clear from context: *what is the rule, and when does it apply?* (carry a recommended phrasing).

2. **Append** an entry to `context/foundation/lessons.md`:

```markdown
## <short rule title> — <YYYY-MM-DD>

- **Rule:** <the actionable rule, imperative>
- **Why:** <the reasoning / what went wrong that motivated it>
- **Applies to:** <scope — file glob, layer, or "project-wide">
```

3. **Confirm** the entry back to the user (Append / Cancel).

4. **Flag for promotion.** If the finding looks like a repeatable "this is how we do it" rather than a one-off warning, tell the user it's a candidate for `/11x-standards-update` to graduate it into a standard. Don't run it yourself.

## Done when

The entry is appended and confirmed, and (if applicable) the promotion suggestion is printed. Stop.
