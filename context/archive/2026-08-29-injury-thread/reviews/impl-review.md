# Impl review: injury-thread

Reviewer: in-process `/11x-deliver` (unattended). Report-only at write time.

Commits reviewed: `111bf80`, `27ca8f4`, `1656b62` (plus Progress SHA stamps).

## Verdict

Matches the plan’s File/Intent/Contract for schema, thread UI, and list preview. One **Critical** remain: list `setError` on `Linking.openURL` failure unmounts the open list.

## Findings

### Critical

1. **List URL failure wipes the list.** `src/app/index.tsx` uses the same `error` state for `listOpenInjuries` failures and for `Linking.openURL` rejection. The List segment renders `error != null` as a lone `ThemedText` and drops the rows. **Fix:** keep load failures on `error`; surface link failures on a separate line that does not hide the list.

### Suggestion

2. `Linking.openURL` + `isHttpUrl` is duplicated on detail and list. Leave it; a helper is a second caller nicety, not required.
3. Detail `disabled={trimmed…}` plus ref guard — extra `disabled` is fine because the ref is the actual re-entry lock.

### Nice-to-have

4. KeyboardAvoidingView if compose sits under the IME (parked from plan-review).

## Drift

- Schema v3, empty `IN ()` short-circuit, missing-injury throws, http(s) gate, `Linking` without `canOpenURL`, ref guards, list sibling “Open link” — as planned.
- No archive, no create-form solutions, no new deps, no test runner.

## Safety

- User URLs only opened after `isHttpUrl`. Writes parameterized. Migration DDL + `user_version` in one transaction; WAL outside.

## Coverage

- Automated: `npx tsc --noEmit` on each phase (pass). No test runner in repo; Manual items stay unchecked.

## Applied / deferred

- **Applied (Critical):** list `Linking` failures use `linkError` and no longer unmount the open list.
- **Deferred:** shared URL helper (S2); KeyboardAvoidingView (N4).
