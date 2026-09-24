import type { SQLiteDatabase } from 'expo-sqlite';

import { getInjuryById } from '@/db/injuries';
import type { InjuryUpdate } from '@/domain/injury';

type InjuryUpdateRow = {
  id: number;
  injury_id: number;
  severity: number | null;
  note: string | null;
  created_at: string;
};

export async function createInjuryUpdate(
  db: SQLiteDatabase,
  input: { injuryId: number; severity?: number | null; note?: string | null },
): Promise<InjuryUpdate> {
  const note = normalizeNote(input.note);
  const severity = input.severity ?? null;
  if (severity == null && note == null) {
    throw new Error('Cannot create injury update: severity and note are both empty');
  }
  if (severity != null && (!Number.isInteger(severity) || severity < 0 || severity > 10)) {
    throw new Error(
      `Cannot create injury update: severity must be an integer 0–10 (got ${String(severity)})`,
    );
  }

  const createdAt = new Date().toISOString();
  let insertedId = -1;

  await db.withTransactionAsync(async () => {
    const injury = await getInjuryById(db, input.injuryId);
    if (injury == null) {
      throw new Error(`Cannot create injury update: injury not found (${input.injuryId})`);
    }
    if (injury.status !== 'open') {
      throw new Error(`Cannot create injury update: injury is archived (${input.injuryId})`);
    }

    const result = await db.runAsync(
      'INSERT INTO injury_updates (injury_id, severity, note, created_at) VALUES (?, ?, ?, ?)',
      input.injuryId,
      severity,
      note,
      createdAt,
    );
    insertedId = result.lastInsertRowId;
  });

  if (insertedId < 0) {
    throw new Error(`Cannot create injury update: insert did not finish (${input.injuryId})`);
  }

  return {
    id: insertedId,
    injuryId: input.injuryId,
    severity,
    note,
    createdAt,
  };
}

export async function listInjuryUpdatesForInjury(
  db: SQLiteDatabase,
  injuryId: number,
): Promise<InjuryUpdate[]> {
  const rows = await db.getAllAsync<InjuryUpdateRow>(
    'SELECT id, injury_id, severity, note, created_at FROM injury_updates WHERE injury_id = ? ORDER BY created_at ASC, id ASC',
    injuryId,
  );
  return rows.map(mapInjuryUpdate);
}

function mapInjuryUpdate(row: InjuryUpdateRow): InjuryUpdate {
  return {
    id: row.id,
    injuryId: row.injury_id,
    severity: row.severity,
    note: row.note == null || row.note.length === 0 ? null : row.note,
    createdAt: row.created_at,
  };
}

function normalizeNote(note: string | null | undefined): string | null {
  if (note == null) {
    return null;
  }
  const trimmed = note.trim();
  return trimmed.length === 0 ? null : trimmed;
}
