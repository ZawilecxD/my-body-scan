import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_VERSION = 7;

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

const SEVERITY_READINGS_DDL = `
CREATE TABLE IF NOT EXISTS severity_readings (
  id INTEGER PRIMARY KEY NOT NULL,
  injury_id INTEGER NOT NULL,
  value INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
`;

const ILLNESSES_DDL = `
CREATE TABLE IF NOT EXISTS illnesses (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL
);
`;

const ILLNESS_EPISODES_DDL = `
CREATE TABLE IF NOT EXISTS illness_episodes (
  id INTEGER PRIMARY KEY NOT NULL,
  illness_id INTEGER NOT NULL,
  noted_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

const SYMPTOM_TACTICS_DDL = `
CREATE TABLE IF NOT EXISTS symptom_tactics (
  id INTEGER PRIMARY KEY NOT NULL,
  illness_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  created_at TEXT NOT NULL
);
`;

/** V5 shape only — no user_version stamp. */
const V5_SCHEMA_FROM_EXISTING = `
ALTER TABLE solutions ADD COLUMN removed_at TEXT;
${INJURY_EVENTS_DDL}
INSERT INTO injury_events (injury_id, type, solution_id, created_at)
  SELECT id, 'created', NULL, created_at FROM injuries;
INSERT INTO injury_events (injury_id, type, solution_id, created_at)
  SELECT id, 'archived', NULL, archived_at FROM injuries
  WHERE status = 'archived' AND archived_at IS NOT NULL;
INSERT INTO injury_events (injury_id, type, solution_id, created_at)
  SELECT injury_id, 'solution_added', id, created_at FROM solutions;
`;

/** V6 shape only — no user_version stamp (must not stamp 7 without illness tables). */
const V6_SCHEMA_FROM_V5 = `
${SEVERITY_READINGS_DDL}
`;

const V7_FROM_V6 = `
${ILLNESSES_DDL}
${ILLNESS_EPISODES_DDL}
${SYMPTOM_TACTICS_DDL}
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
${SEVERITY_READINGS_DDL}
${ILLNESSES_DDL}
${ILLNESS_EPISODES_DDL}
${SYMPTOM_TACTICS_DDL}
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
${V5_SCHEMA_FROM_EXISTING}
${V6_SCHEMA_FROM_V5}
${V7_FROM_V6}
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
${V5_SCHEMA_FROM_EXISTING}
${V6_SCHEMA_FROM_V5}
${V7_FROM_V6}
`);
    });
    return;
  }

  if (currentDbVersion === 3) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
ALTER TABLE injuries ADD COLUMN archived_at TEXT;
${V5_SCHEMA_FROM_EXISTING}
${V6_SCHEMA_FROM_V5}
${V7_FROM_V6}
`);
    });
    return;
  }

  if (currentDbVersion === 4) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
${V5_SCHEMA_FROM_EXISTING}
${V6_SCHEMA_FROM_V5}
${V7_FROM_V6}
`);
    });
    return;
  }

  if (currentDbVersion === 5) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
${V6_SCHEMA_FROM_V5}
${V7_FROM_V6}
`);
    });
    return;
  }

  if (currentDbVersion === 6) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(V7_FROM_V6);
    });
  }
}
