import type { SQLiteDatabase } from 'expo-sqlite';

import { getInjuryById } from '@/db/injuries';
import type { SeverityReading } from '@/domain/injury';

type SeverityReadingRow = {
  id: number;
  injury_id: number;
  value: number;
  created_at: string;
};

export async function createSeverityReading(
  db: SQLiteDatabase,
  input: { injuryId: number; value: number },
): Promise<SeverityReading> {
  if (!Number.isInteger(input.value) || input.value < 0 || input.value > 10) {
    throw new Error(
      `Cannot create severity reading: value must be an integer 0–10 (got ${String(input.value)})`,
    );
  }

  const injury = await getInjuryById(db, input.injuryId);
  if (injury == null) {
    throw new Error(`Cannot create severity reading: injury not found (${input.injuryId})`);
  }
  if (injury.status !== 'open') {
    throw new Error(`Cannot create severity reading: injury is archived (${input.injuryId})`);
  }

  const createdAt = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO severity_readings (injury_id, value, created_at) VALUES (?, ?, ?)',
    input.injuryId,
    input.value,
    createdAt,
  );

  return {
    id: result.lastInsertRowId,
    injuryId: input.injuryId,
    value: input.value,
    createdAt,
  };
}

export async function listSeverityReadingsForInjury(
  db: SQLiteDatabase,
  injuryId: number,
): Promise<SeverityReading[]> {
  const rows = await db.getAllAsync<SeverityReadingRow>(
    'SELECT id, injury_id, value, created_at FROM severity_readings WHERE injury_id = ? ORDER BY created_at ASC, id ASC',
    injuryId,
  );
  return rows.map(mapSeverityReading);
}

function mapSeverityReading(row: SeverityReadingRow): SeverityReading {
  return {
    id: row.id,
    injuryId: row.injury_id,
    value: row.value,
    createdAt: row.created_at,
  };
}
