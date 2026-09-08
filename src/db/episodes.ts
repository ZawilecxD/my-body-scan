import type { SQLiteDatabase } from 'expo-sqlite';

import { getIllnessById } from '@/db/illnesses';
import type { IllnessEpisode } from '@/domain/illness';

type EpisodeRow = {
  id: number;
  illness_id: number;
  noted_at: string;
  created_at: string;
};

const EPISODE_COLUMNS = 'id, illness_id, noted_at, created_at';

export async function createEpisode(
  db: SQLiteDatabase,
  input: { illnessId: number; notedAt?: string },
): Promise<IllnessEpisode> {
  const illness = await getIllnessById(db, input.illnessId);
  if (illness == null) {
    throw new Error(`Cannot create episode: illness not found (${input.illnessId})`);
  }

  const createdAt = new Date().toISOString();
  const notedAt = input.notedAt?.trim() || createdAt;
  if (notedAt.length === 0) {
    throw new Error('Cannot create episode: notedAt is empty');
  }

  const result = await db.runAsync(
    'INSERT INTO illness_episodes (illness_id, noted_at, created_at) VALUES (?, ?, ?)',
    input.illnessId,
    notedAt,
    createdAt,
  );

  return {
    id: result.lastInsertRowId,
    illnessId: input.illnessId,
    notedAt,
    createdAt,
  };
}

export async function listEpisodesForIllness(
  db: SQLiteDatabase,
  illnessId: number,
): Promise<IllnessEpisode[]> {
  const rows = await db.getAllAsync<EpisodeRow>(
    `SELECT ${EPISODE_COLUMNS} FROM illness_episodes WHERE illness_id = ? ORDER BY noted_at ASC, id ASC`,
    illnessId,
  );
  return rows.map(mapEpisode);
}

export async function countEpisodesByIllnessIds(
  db: SQLiteDatabase,
  ids: number[],
): Promise<Record<number, number>> {
  if (ids.length === 0) {
    return {};
  }

  const placeholders = ids.map(() => '?').join(', ');
  const rows = await db.getAllAsync<{ illness_id: number; count: number }>(
    `SELECT illness_id, COUNT(*) AS count FROM illness_episodes WHERE illness_id IN (${placeholders}) GROUP BY illness_id`,
    ...ids,
  );

  const counts: Record<number, number> = {};
  for (const row of rows) {
    counts[row.illness_id] = row.count;
  }
  return counts;
}

export async function latestEpisodeNotedAtByIllnessIds(
  db: SQLiteDatabase,
  ids: number[],
): Promise<Record<number, string>> {
  if (ids.length === 0) {
    return {};
  }

  const placeholders = ids.map(() => '?').join(', ');
  const rows = await db.getAllAsync<EpisodeRow>(
    `SELECT ${EPISODE_COLUMNS} FROM illness_episodes WHERE illness_id IN (${placeholders}) ORDER BY noted_at DESC, id DESC`,
    ...ids,
  );

  const latest: Record<number, string> = {};
  for (const row of rows) {
    if (latest[row.illness_id] == null) {
      latest[row.illness_id] = row.noted_at;
    }
  }
  return latest;
}

function mapEpisode(row: EpisodeRow): IllnessEpisode {
  return {
    id: row.id,
    illnessId: row.illness_id,
    notedAt: row.noted_at,
    createdAt: row.created_at,
  };
}
