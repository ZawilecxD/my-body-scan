# Lessons

## Hide the splash on DB init failure — 2026-08-18

- **Rule:** When `SplashScreen.preventAutoHideAsync` is paired with `SQLiteProvider` `onInit`, hide the splash in a `finally` (success and failure) and render `onError` in the UI. Do not rely on the default rethrow — it runs during render while children are still unmounted, so the error sits behind the native splash.
- **Why:** A failed migrate left the splash up forever and looked like a hang instead of fail-loud (`log-injury-from-list` impl-review C1).
- **Applies to:** `src/app/_layout.tsx`; any `SQLiteProvider` + splash pairing
- Graduated to `context/standards/global/sqlite.md` on 2026-08-19.

## Make schema version bumps atomic with DDL — 2026-08-18

- **Rule:** In expo-sqlite migrations, run `PRAGMA journal_mode = 'wal'` outside a transaction (it cannot run inside one). Put `CREATE TABLE IF NOT EXISTS` (and other DDL) plus `PRAGMA user_version = N` in one `withTransactionAsync`. Never bump `user_version` in a separate auto-committed statement after an unprotected `CREATE TABLE`.
- **Why:** A kill between `CREATE TABLE injuries` and `user_version = 1` left version 0 with the table already present; the next launch threw `table already exists` and bricked the app with data intact but unreachable (`log-injury-from-list` impl-review C2).
- **Applies to:** `src/db/migrate.ts`; every later schema version
- Graduated to `context/standards/global/sqlite.md` on 2026-08-19.

## Guard async navigation against double tap — 2026-08-25

- **Rule:** Before `router.push` (or any await-then-navigate) from a press handler, set a ref synchronously and return early if it is already set. Clear the ref on failure and when the screen refocuses. Do not rely on `disabled` or `useState` — those only update after a re-render, so a second tap in the same frame still runs.
- **Why:** Map region and landmark taps had no re-entry guard. A second tap during `listOpenInjuriesForLandmark` stacked a duplicate close-up or create screen, so the first Back looked like a no-op (`body-graphic-map` impl-review S1). The same shape already bit Save (`log-injury-from-list` impl-review S3).
- **Applies to:** Expo Router screens that navigate on press, especially after an await; create/save buttons
- Graduated to `context/standards/frontend/navigation.md` on 2026-08-25.
