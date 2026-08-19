---
change_id: log-injury-from-list
created: 2026-08-18
---

# Implementation review: log-injury-from-list

- **Plan:** `context/changes/log-injury-from-list/plan.md`
- **Type:** feature
- **Commits:** `d57a3c1`, `20cf086`, `919b1a7`
- **Date:** 2026-08-18

The product loop matches the plan (catalog, sqlite store, stack screens, required deletes, copy, no out-of-scope extras). `npx tsc --noEmit` passes. Two safety gaps can freeze or brick the app on a failed or half-applied first-launch migrate.

## Facets

| Facet | Result |
|---|---|
| Drift | Contracts met. Two UX/list mismatches (catalog `replace`; unknown landmark ids dropped). |
| Safety | Splash hidden only on migrate success. v0→1 DDL and `user_version` are not atomic. |
| Patterns & standards | Layout, scope, and deletes match. Dead theme exports left behind. |
| Type gate | N/A (`type: feature`). |
| Coverage | Automated gate exercised and green. Manual criteria are actually enabled in code. |

## Critical

### C1 — Native splash never hides if DB init fails

- **Where:** `src/app/_layout.tsx` (`onInit`)
- **Why:** `SplashScreen.hideAsync()` runs only after `migrate` resolves. `SQLiteProvider` default `onError` rethrows during render (`hooks.js`), with children unmounted (`null` while loading). The error screen sits behind a still-visible native splash, so a migrate/open failure looks like a hang — the opposite of fail-loud (`conventions.md`).
- **Fix:** Hide the splash in a `finally` (success and failure). Pass `onError` and render the error message instead of relying on the default rethrow. Do not combine `onError` with `useSuspense`.

### C2 — Half-applied v0→1 migration bricks every later launch

- **Where:** `src/db/migrate.ts`
- **Why:** `CREATE TABLE injuries` and `PRAGMA user_version = 1` are separate auto-committed statements. `CREATE TABLE` has no `IF NOT EXISTS`. If the process is killed (or the second `execAsync` fails) after the table exists but before the version bump, the next launch still sees `user_version = 0`, `CREATE TABLE` throws `table injuries already exists`, and C1 keeps the splash up. Data on disk is intact and unreachable. First launch is the window; force-stop is in this slice’s success criteria.
- **Fix:** Keep `PRAGMA journal_mode = 'wal'` outside a transaction (it cannot run inside one). Put `CREATE TABLE IF NOT EXISTS …` and `PRAGMA user_version = 1` in one `withTransactionAsync`. That matches Expo’s own storage migrator and self-heals an already-broken install.

## Suggestion

### S1 — Catalog tap uses `replace`, so Cancel/Back skips the picker

- **Where:** `src/app/landmarks.tsx` (landmark `onPress`)
- **Why:** The phase 3 contract is tap → `/injuries/new?landmarkId=`. `router.replace` after **save** is what the Approach section requires so Back from detail skips the form. Replacing the catalog means an unsaved form’s Back goes to Open injuries, not the picker.
- **Fix:** `router.push` to the form. Keep `router.replace(\`/injuries/${id}\`)` on save. If Back from detail must also skip the catalog, dismiss to `/` then open detail on success — do not steal the picker from Cancel.

### S2 — Home list silently drops open injuries with an unknown `landmark_id`

- **Where:** `src/app/index.tsx` (`groupInjuriesByRegion`)
- **Why:** Create already refuses unknown landmarks, so this cannot happen through the happy path today. If a later catalog trim or a leftover row appears, `getLandmarkById(…)?.region` matches no `REGION_ORDER` bucket and the row vanishes with no message. Detail at least falls back to the raw id.
- **Fix:** After grouping, render leftovers under an “Unknown landmark” section, or fail loud on the list. Do not filter them out.

### S3 — Double-tap Save can insert two rows, and this slice cannot delete them

- **Where:** `src/app/injuries/new.tsx` (`onSave` / `canSave`)
- **Why:** `isSaving` only disables the button after a re-render. Two presses in the same frame both pass `canSave` and both call `createInjury`. Archive/delete are out of scope, so the duplicate stays.
- **Fix:** Guard with a ref set synchronously before the await, and only clear it on failure.

### S4 — Android Auto Backup can upload injury descriptions off-device

- **Where:** `app.json` (`expo.android`)
- **Why:** `allowBackup` is unset (Android default `true`). `my-body-scan.db` lives under app files, which Auto Backup includes. The app itself makes no network calls, but free-text health notes can still leave the device via Drive, against “on-device only” / FR-18.
- **Fix:** Set `"android": { "allowBackup": false, … }`. Turning it off also means a device swap loses history — that is the right trade for this data class unless you decide otherwise.

### S5 — Unused theme exports this change made dead

- **Where:** `src/constants/theme.ts` (`BottomTabInset`, `MaxContentWidth`)
- **Why:** `coding-style.md` — delete unused code in the same change that makes it dead. Only the deleted template Home/Explore/`app-tabs.web` screens used these.
- **Fix:** Remove both exports. Keep `Spacing` and `Colors`.

## Nice-to-have

### N1 — Dead tab-icon assets after AppTabs removal

- **Where:** `assets/images/tabIcons/` (`home.png` / `explore.png` and `@2x`/`@3x`)
- **Fix:** Delete the directory. Not on the plan’s delete table; nothing references the PNGs.

### N2 — Template `reset-project` script can still wipe `src/`

- **Where:** `scripts/reset-project.js` and the `reset-project` npm script
- **Fix:** Delete both. Not on the plan’s delete list.

### N3 — Nested ternaries on home and detail instead of early returns

- **Where:** `src/app/index.tsx`, `src/app/injuries/[id].tsx`
- **Fix:** Match `injuries/new.tsx`: return error / empty / loading before the happy-path markup (`coding-style.md`).

### N4 — `preventAutoHideAsync()` rejection is unhandled

- **Where:** `src/app/_layout.tsx` (module scope)
- **Fix:** `.catch(() => {})` — failing to prevent auto-hide should not surface as an unhandled rejection at import.

## Coverage

- Automated: `npx tsc --noEmit` — pass (re-run during this review).
- Manual phase 3: screens and persistence API exist to perform 3.2–3.7 (`SQLiteProvider` file-backed `my-body-scan.db`, no unique on `landmark_id`, `listOpenInjuries` is `status='open'` newest first, save uses `router.replace`).
- No test runner, as planned — not a finding.

## Out of scope (verified absent)

Body graphic, comments, solutions, `archived_at`, Graphic tab, jest, new dependencies, diagnostic copy.

## Triage — 2026-08-19

Applied: **C1**, **C2**. `npx tsc --noEmit` passes.

Deferred: S1, S2, S3, S4, S5, N1, N2, N3, N4.
