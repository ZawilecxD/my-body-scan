import type { SQLiteDatabase } from 'expo-sqlite';

import type { Injury } from '@/domain/injury';
import { getLandmarkById, parseLimb, type Limb } from '@/domain/landmarks';

type InjuryRow = {
  id: number;
  landmark_id: string;
  description: string;
  status: string;
  created_at: string;
  limb: string | null;
};

export async function createInjury(
  db: SQLiteDatabase,
  input: { landmarkId: string; description: string; limb?: Limb | null },
): Promise<Injury> {
  const description = input.description.trim();
  if (description.length === 0) {
    throw new Error('Cannot create injury: description is empty');
  }

  if (getLandmarkById(input.landmarkId) == null) {
    throw new Error(`Cannot create injury: unknown landmark "${input.landmarkId}"`);
  }

  const limb = input.limb ?? null;
  const createdAt = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO injuries (landmark_id, description, status, created_at, limb) VALUES (?, ?, ?, ?, ?)',
    input.landmarkId,
    description,
    'open',
    createdAt,
    limb,
  );

  return {
    id: result.lastInsertRowId,
    landmarkId: input.landmarkId,
    description,
    status: 'open',
    createdAt,
    limb,
  };
}

export async function listOpenInjuries(db: SQLiteDatabase): Promise<Injury[]> {
  const rows = await db.getAllAsync<InjuryRow>(
    'SELECT id, landmark_id, description, status, created_at, limb FROM injuries WHERE status = ? ORDER BY created_at DESC',
    'open',
  );
  return rows.map(mapInjury);
}

export async function listOpenInjuriesForLandmark(
  db: SQLiteDatabase,
  landmarkId: string,
  limb?: Limb | null,
): Promise<Injury[]> {
  if (getLandmarkById(landmarkId) == null) {
    throw new Error(`Cannot list injuries: unknown landmark "${landmarkId}"`);
  }

  if (limb == null) {
    const rows = await db.getAllAsync<InjuryRow>(
      'SELECT id, landmark_id, description, status, created_at, limb FROM injuries WHERE status = ? AND landmark_id = ? ORDER BY created_at DESC',
      'open',
      landmarkId,
    );
    return rows.map(mapInjury);
  }

  const rows = await db.getAllAsync<InjuryRow>(
    'SELECT id, landmark_id, description, status, created_at, limb FROM injuries WHERE status = ? AND landmark_id = ? AND limb = ? ORDER BY created_at DESC',
    'open',
    landmarkId,
    limb,
  );
  return rows.map(mapInjury);
}

export async function getInjuryById(db: SQLiteDatabase, id: number): Promise<Injury | null> {
  const row = await db.getFirstAsync<InjuryRow>(
    'SELECT id, landmark_id, description, status, created_at, limb FROM injuries WHERE id = ?',
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
    limb: parseLimb(row.limb ?? undefined),
  };
}
