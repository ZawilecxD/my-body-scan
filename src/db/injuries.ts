import type { SQLiteDatabase } from 'expo-sqlite';

import { insertInjuryEvent } from '@/db/events';
import type { Injury, InjuryStatus } from '@/domain/injury';
import { getLandmarkById, parseLimb, type Limb } from '@/domain/landmarks';

type InjuryRow = {
  id: number;
  landmark_id: string;
  description: string;
  status: string;
  created_at: string;
  archived_at: string | null;
  limb: string | null;
};

const INJURY_COLUMNS =
  'id, landmark_id, description, status, created_at, archived_at, limb';

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
    'INSERT INTO injuries (landmark_id, description, status, created_at, limb, archived_at) VALUES (?, ?, ?, ?, ?, ?)',
    input.landmarkId,
    description,
    'open',
    createdAt,
    limb,
    null,
  );

  const injury: Injury = {
    id: result.lastInsertRowId,
    landmarkId: input.landmarkId,
    description,
    status: 'open',
    createdAt,
    archivedAt: null,
    limb,
  };

  await insertInjuryEvent(db, {
    injuryId: injury.id,
    type: 'created',
    createdAt,
  });

  return injury;
}

export async function listOpenInjuries(db: SQLiteDatabase): Promise<Injury[]> {
  const rows = await db.getAllAsync<InjuryRow>(
    `SELECT ${INJURY_COLUMNS} FROM injuries WHERE status = ? ORDER BY created_at DESC`,
    'open',
  );
  return rows.map(mapInjury);
}

export async function listArchivedInjuries(db: SQLiteDatabase): Promise<Injury[]> {
  const rows = await db.getAllAsync<InjuryRow>(
    `SELECT ${INJURY_COLUMNS} FROM injuries WHERE status = ? ORDER BY archived_at DESC`,
    'archived',
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
      `SELECT ${INJURY_COLUMNS} FROM injuries WHERE status = ? AND landmark_id = ? ORDER BY created_at DESC`,
      'open',
      landmarkId,
    );
    return rows.map(mapInjury);
  }

  const rows = await db.getAllAsync<InjuryRow>(
    `SELECT ${INJURY_COLUMNS} FROM injuries WHERE status = ? AND landmark_id = ? AND limb = ? ORDER BY created_at DESC`,
    'open',
    landmarkId,
    limb,
  );
  return rows.map(mapInjury);
}

export async function getInjuryById(db: SQLiteDatabase, id: number): Promise<Injury | null> {
  const row = await db.getFirstAsync<InjuryRow>(
    `SELECT ${INJURY_COLUMNS} FROM injuries WHERE id = ?`,
    id,
  );
  if (row == null) {
    return null;
  }
  return mapInjury(row);
}

export async function archiveInjury(db: SQLiteDatabase, id: number): Promise<Injury> {
  const injury = await getInjuryById(db, id);
  if (injury == null) {
    throw new Error(`Cannot archive injury: not found (${id})`);
  }
  if (injury.status === 'archived') {
    throw new Error(`Cannot archive injury: already archived (${id})`);
  }

  const archivedAt = new Date().toISOString();
  await db.runAsync(
    'UPDATE injuries SET status = ?, archived_at = ? WHERE id = ?',
    'archived',
    archivedAt,
    id,
  );

  await insertInjuryEvent(db, {
    injuryId: id,
    type: 'archived',
    createdAt: archivedAt,
  });

  return {
    ...injury,
    status: 'archived',
    archivedAt,
  };
}

export async function reopenInjury(db: SQLiteDatabase, id: number): Promise<Injury> {
  const injury = await getInjuryById(db, id);
  if (injury == null) {
    throw new Error(`Cannot reopen injury: not found (${id})`);
  }
  if (injury.status === 'open') {
    throw new Error(`Cannot reopen injury: already open (${id})`);
  }

  const reopenedAt = new Date().toISOString();
  await db.runAsync(
    'UPDATE injuries SET status = ?, archived_at = NULL WHERE id = ?',
    'open',
    id,
  );

  await insertInjuryEvent(db, {
    injuryId: id,
    type: 'reopened',
    createdAt: reopenedAt,
  });

  return {
    ...injury,
    status: 'open',
    archivedAt: null,
  };
}

function mapInjury(row: InjuryRow): Injury {
  return {
    id: row.id,
    landmarkId: row.landmark_id,
    description: row.description,
    status: parseStatus(row.status, row.id),
    createdAt: row.created_at,
    archivedAt: row.archived_at,
    limb: parseLimb(row.limb ?? undefined),
  };
}

function parseStatus(value: string, injuryId: number): InjuryStatus {
  if (value === 'open' || value === 'archived') {
    return value;
  }
  throw new Error(`Cannot map injury ${injuryId}: unknown status "${value}"`);
}
