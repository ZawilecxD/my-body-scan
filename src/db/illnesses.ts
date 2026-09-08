import type { SQLiteDatabase } from 'expo-sqlite';

import type { Illness } from '@/domain/illness';

type IllnessRow = {
  id: number;
  name: string;
  notes: string | null;
  created_at: string;
};

const ILLNESS_COLUMNS = 'id, name, notes, created_at';

export async function createIllness(
  db: SQLiteDatabase,
  input: { name: string; notes?: string | null },
): Promise<Illness> {
  const name = input.name.trim();
  if (name.length === 0) {
    throw new Error('Cannot create illness: name is empty');
  }

  const trimmedNotes = input.notes?.trim() ?? '';
  const notes = trimmedNotes.length === 0 ? null : trimmedNotes;
  const createdAt = new Date().toISOString();

  let illnessId = 0;

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      'INSERT INTO illnesses (name, notes, created_at) VALUES (?, ?, ?)',
      name,
      notes,
      createdAt,
    );
    illnessId = result.lastInsertRowId;
    await db.runAsync(
      'INSERT INTO illness_episodes (illness_id, noted_at, created_at) VALUES (?, ?, ?)',
      illnessId,
      createdAt,
      createdAt,
    );
  });

  return {
    id: illnessId,
    name,
    notes,
    createdAt,
  };
}

export async function listIllnesses(db: SQLiteDatabase): Promise<Illness[]> {
  const rows = await db.getAllAsync<IllnessRow>(
    `SELECT ${ILLNESS_COLUMNS} FROM illnesses ORDER BY created_at DESC, id DESC`,
  );
  return rows.map(mapIllness);
}

export async function getIllnessById(
  db: SQLiteDatabase,
  id: number,
): Promise<Illness | null> {
  const row = await db.getFirstAsync<IllnessRow>(
    `SELECT ${ILLNESS_COLUMNS} FROM illnesses WHERE id = ?`,
    id,
  );
  if (row == null) {
    return null;
  }
  return mapIllness(row);
}

function mapIllness(row: IllnessRow): Illness {
  return {
    id: row.id,
    name: row.name,
    notes: row.notes == null || row.notes.length === 0 ? null : row.notes,
    createdAt: row.created_at,
  };
}
