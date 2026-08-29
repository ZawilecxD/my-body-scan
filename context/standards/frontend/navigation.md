# Navigation

Press handlers that navigate or save must not run twice from a double tap.

- Before `router.push` (or any await-then-navigate) from a press handler, set a ref synchronously and return early if it is already set. Clear the ref on failure and when the screen refocuses. The same guard applies to create/save.
- Do not rely on `disabled` or `useState` to block re-entry — those only update after a re-render, so a second tap in the same frame still runs.
