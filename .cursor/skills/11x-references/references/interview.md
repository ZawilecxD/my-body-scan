# Reference: interview

The one-question-at-a-time interview pattern. Not a skill — a shared conversational contract loaded by `11x-frame`, `11x-plan`, and `11x-roadmap`.

## Rules

1. **One question per turn.** Never batch. Wait for the answer before the next question.
2. **Always carry a recommendation.** Every question includes your recommended answer and a one-line reason, so the user can accept with a word.
3. **Scale questions to what's already decided.** Read upstream artifacts first (`frame.md`, `research/`, `effort.md`, `standards/`, `lessons.md`). Anything already settled upstream is treated as decided — do not re-ask it. Questions scale *down* proportionally to upstream certainty.
4. **Only ask what changes the output.** If an answer wouldn't change the artifact you're about to write, don't ask it — pick the reasonable default and note it.
5. **Stop when the remaining unknowns no longer move the design.** Summarize decisions back before writing to disk.

## Question shape

> **Q:** <the decision>
> Recommendation: <option> — <one-line why>.
> Alternatives: <a> / <b>.

Use the host's structured question tool when available; otherwise ask in plain chat. Either way, keep it to a single decision per turn.
