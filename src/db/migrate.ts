import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_VERSION = 5;

const COMMENTS_DDL = `
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY NOT NULL,
  injury_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

const SOLUTIONS_DDL_LEGACY = `
CREATE TABLE IF NOT EXISTS solutions (
  id INTEGER PRIMARY KEY NOT NULL,
  injury_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  created_at TEXT NOT NULL
);
`;

const SOLUTIONS_DDL_V5 = `
CREATE TABLE IF NOT EXISTS solutions (
  id INTEGER PRIMARY KEY NOT NULL,
  injury_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  created_at TEXT NOT NULL,
  removed_at TEXT
);
`;

const INJURY_EVENTS_DDL = `
CREATE TABLE IF NOT EXISTS injury_events (
  id INTEGER PRIMARY KEY NOT NULL,
  injury_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  solution_id INTEGER,
  created_at TEXT NOT NULL
);
`;

const V5_FROM_EXISTING = `
ALTER TABLE solutions ADD COLUMN removed_at TEXT;
${INJURY_EVENTS_DDL}
INSERT INTO injury_events (injury_id, type, solution_id, created_at)
  SELECT id, 'created', NULL, created_at FROM injuries;
INSERT INTO injury_events (injury_id, type, solution_id, created_at)
  SELECT id, 'archived', NULL, archived_at FROM injuries
  WHERE status = 'archived' AND archived_at IS NOT NULL;
INSERT INTO injury_events (injury_id, type, solution_id, created_at)
  SELECT injury_id, 'solution_added', id, created_at FROM solutions;
PRAGMA user_version = ${DATABASE_VERSION};
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
${COMMENTS_DDL}
${SOLUTIONS_DDL_V5}
${INJURY_EVENTS_DDL}
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
${COMMENTS_DDL}
${SOLUTIONS_DDL_LEGACY}
${V5_FROM_EXISTING}
`);
    });
    return;
  }

  if (currentDbVersion === 2) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
ALTER TABLE injuries ADD COLUMN archived_at TEXT;
${COMMENTS_DDL}
${SOLUTIONS_DDL_LEGACY}
${V5_FROM_EXISTING}
`);
    });
    return;
  }

  if (currentDbVersion === 3) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
ALTER TABLE injuries ADD COLUMN archived_at TEXT;
${V5_FROM_EXISTING}
`);
    });
    return;
  }

  if (currentDbVersion === 4) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(V5_FROM_EXISTING);
    });
  }
}
