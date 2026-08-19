# SQLite

Open and migrate the on-device database so a failed or interrupted init cannot hang the splash or leave a half-applied schema.

- After `SplashScreen.preventAutoHideAsync`, hide the splash in a `finally` around `SQLiteProvider` `onInit` (success and failure). Pass `onError` and render the message. Do not rely on the default rethrow — it runs while children are unmounted, so the error sits behind the native splash.
- Run `PRAGMA journal_mode = 'wal'` outside a transaction (it cannot run inside one). Put DDL (`CREATE TABLE IF NOT EXISTS …`) and `PRAGMA user_version = N` in one `withTransactionAsync`. Never bump `user_version` in a separate auto-committed statement after an unprotected `CREATE TABLE`.
