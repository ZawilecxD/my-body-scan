# Reference: module-design

Vocabulary for judging refactoring opportunities and refactor-type plans. Loaded by `11x-refactor-discover` and by `11x-plan` when `type: refactor`.

## Deep modules

A good module hides a lot behind a small interface. Depth = (functionality hidden) / (interface surface). Prefer deepening a module (shrinking its interface while it keeps doing the work) over widening it. Shallow modules — thin wrappers whose interface is as big as their implementation — are the target for removal or merging.

## Seams

A seam is a place where you can change behavior without editing in that place — the natural boundary to test against or swap. Good refactors introduce or clarify seams; they don't scatter new coupling across the codebase.

## The deletion test

Before adding an abstraction, ask: if I delete it, what breaks? If nothing meaningfully breaks, it wasn't earning its place. Applied in reverse for refactors: the best simplification is often deleting a shallow layer, not adding a "cleaner" one.

## Behavior-preserving gate (for `type: refactor`)

A refactor is only done when:
1. The same tests are green before and after.
2. Depth, locality, or testability measurably improved (name which one).
3. No new speculative abstraction was introduced "for later" — build only what the current code needs.
