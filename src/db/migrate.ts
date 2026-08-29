import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 4;

const COMMENTS_AND_SOLUTIONS_DDL = `
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY NOT NULL,
  injury_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS solutions (
  id INTEGER PRIMARY KEY NOT NULL,
  injury_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  created_at TEXT NOT NULL
);
`;

export async function migrate(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentDbVersion = result?.user_version ?? 0;
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  // WAL cannot run inside a transaction.
  await db.execAsync(`PRAGMA journal_mode = 'wal'`);

  if (currentDbVersion === 0) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
CREATE TABLE IF NOT EXISTS injuries (
  id INTEGER PRIMARY KEY NOT NULL,
  landmark_id TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  limb TEXT,
  archived_at TEXT
);
${COMMENTS_AND_SOLUTIONS_DDL}
PRAGMA user_version = ${DATABASE_VERSION};
`);
    });
    return;
  }

  if (currentDbVersion === 1) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
ALTER TABLE injuries ADD COLUMN limb TEXT;
ALTER TABLE injuries ADD COLUMN archived_at TEXT;
${COMMENTS_AND_SOLUTIONS_DDL}
PRAGMA user_version = ${DATABASE_VERSION};
`);
    });
    return;
  }

  if (currentDbVersion === 2) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
ALTER TABLE injuries ADD COLUMN archived_at TEXT;
${COMMENTS_AND_SOLUTIONS_DDL}
PRAGMA user_version = ${DATABASE_VERSION};
`);
    });
    return;
  }

  if (currentDbVersion === 3) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
ALTER TABLE injuries ADD COLUMN archived_at TEXT;
PRAGMA user_version = ${DATABASE_VERSION};
`);
    });
  }
}
