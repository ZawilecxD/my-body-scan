---
name: 11x-diagnose
description: Feedback-loop-first debugging — build a tight deterministic reproduction, rank falsifiable hypotheses, instrument one variable at a time, and fix. Trivial fixes land inline with a regression test; non-trivial ones are promoted to a type:defect change. Use when something is broken, failing, flaky, or slow, when the user says "debug this", "why is this failing", "/11x-diagnose", or when a bug surfaces mid-implementation.
---

# 11x-diagnose

Debug from a reproduction outward, not from guesses. Model-invocable: the agent may reach for this on its own — e.g. while implementing a plan phase, or when the user reports a bug during manual verification — analyze it, then propose an inline fix or promote it to its own change.

Load reference `model-policy` — ranking hypotheses on a stubborn bug warrants the strong tier; mechanical repro-narrowing can use the cheap tier. Load `change-md` before seeding a promoted change.

## Guard

- Refuse to write under `context/archive/`.
- Do not propose a fix before you have a reproduction that fails deterministically.

## Steps

1. **Build the feedback loop first.** Get one command you've actually run whose output you've seen, that is red on this bug. Minimize it until it's tight and deterministic.
2. **Hypothesize.** State 3–5 ranked, falsifiable hypotheses — each one something a single experiment can kill.
3. **Instrument one variable at a time.** Test the top hypothesis; let the loop confirm or refute. Iterate down the list.
4. **Fix, then branch on size:**
   - **Trivial** → fix inline in the current context, leave a regression test in the code, no artifacts.
   - **Non-trivial** → promote it. Write `context/changes/<id>/change.md` (`type: defect`, which turns on the TDD gate in `11x-plan`) and `context/changes/<id>/diagnosis.md` (minimized repro + ranked hypotheses + the regression test) directly — this is what `/11x-new` would do, done inline because a model-invoked skill can't mechanically call a user-invoked one. Then print `/11x-plan <id>` as the next command.

## Done when

Either the bug is fixed inline with a regression test, or a `type: defect` change is seeded with its `diagnosis.md` and `/11x-plan <id>` is printed. Never auto-run the next skill. Stop.
