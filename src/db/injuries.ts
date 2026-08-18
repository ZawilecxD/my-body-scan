import type { SQLiteDatabase } from 'expo-sqlite';

import type { Injury } from '@/domain/injury';
import { getLandmarkById } from '@/domain/landmarks';

type InjuryRow = {
  id: number;
  landmark_id: string;
  description: string;
  status: string;
  created_at: string;
};

export async function createInjury(
  db: SQLiteDatabase,
  input: { landmarkId: string; description: string },
): Promise<Injury> {
  const description = input.description.trim();
  if (description.length === 0) {
    throw new Error('Cannot create injury: description is empty');
  }

  if (getLandmarkById(input.landmarkId) == null) {
    throw new Error(`Cannot create injury: unknown landmark "${input.landmarkId}"`);
  }

  const createdAt = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO injuries (landmark_id, description, status, created_at) VALUES (?, ?, ?, ?)',
    input.landmarkId,
    description,
    'open',
    createdAt,
  );

  return {
    id: result.lastInsertRowId,
    landmarkId: input.landmarkId,
    description,
    status: 'open',
    createdAt,
  };
}

export async function listOpenInjuries(db: SQLiteDatabase): Promise<Injury[]> {
  const rows = await db.getAllAsync<InjuryRow>(
    'SELECT id, landmark_id, description, status, created_at FROM injuries WHERE status = ? ORDER BY created_at DESC',
    'open',
  );
  return rows.map(mapInjury);
}

export async function getInjuryById(db: SQLiteDatabase, id: number): Promise<Injury | null> {
  const row = await db.getFirstAsync<InjuryRow>(
    'SELECT id, landmark_id, description, status, created_at FROM injuries WHERE id = ?',
    id,
  );
  if (row == null) {
    return null;
  }
  return mapInjury(row);
}

function mapInjury(row: InjuryRow): Injury {
  return {
    id: row.id,
    landmarkId: row.landmark_id,
    description: row.description,
    status: 'open',
    createdAt: row.created_at,
  };
}
