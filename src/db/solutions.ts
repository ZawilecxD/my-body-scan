import type { SQLiteDatabase } from 'expo-sqlite';

import { getInjuryById } from '@/db/injuries';
import { isHttpUrl } from '@/domain/http-url';
import type { Solution } from '@/domain/injury';

type SolutionRow = {
  id: number;
  injury_id: number;
  body: string;
  url: string | null;
  created_at: string;
};

export async function createSolution(
  db: SQLiteDatabase,
  input: { injuryId: number; body: string; url?: string | null },
): Promise<Solution> {
  const body = input.body.trim();
  if (body.length === 0) {
    throw new Error('Cannot create solution: body is empty');
  }

  const injury = await getInjuryById(db, input.injuryId);
  if (injury == null) {
    throw new Error(`Cannot create solution: injury not found (${input.injuryId})`);
  }

  const trimmedUrl = input.url?.trim() ?? '';
  const url = trimmedUrl.length === 0 ? null : trimmedUrl;
  if (url != null && !isHttpUrl(url)) {
    throw new Error(`Cannot create solution: URL is not http(s) (${url})`);
  }

  const createdAt = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO solutions (injury_id, body, url, created_at) VALUES (?, ?, ?, ?)',
    input.injuryId,
    body,
    url,
    createdAt,
  );

  return {
    id: result.lastInsertRowId,
    injuryId: input.injuryId,
    body,
    url,
    createdAt,
  };
}

export async function listSolutionsForInjury(
  db: SQLiteDatabase,
  injuryId: number,
): Promise<Solution[]> {
  const rows = await db.getAllAsync<SolutionRow>(
    'SELECT id, injury_id, body, url, created_at FROM solutions WHERE injury_id = ? ORDER BY created_at DESC, id DESC',
    injuryId,
  );
  return rows.map(mapSolution);
}

export async function listLatestSolutionsByInjuryIds(
  db: SQLiteDatabase,
  ids: number[],
): Promise<Record<number, Solution>> {
  if (ids.length === 0) {
    return {};
  }

  const placeholders = ids.map(() => '?').join(', ');
  const rows = await db.getAllAsync<SolutionRow>(
    `SELECT id, injury_id, body, url, created_at FROM solutions WHERE injury_id IN (${placeholders}) ORDER BY created_at DESC, id DESC`,
    ...ids,
  );

  const latest: Record<number, Solution> = {};
  for (const row of rows) {
    if (latest[row.injury_id] == null) {
      latest[row.injury_id] = mapSolution(row);
    }
  }
  return latest;
}

function mapSolution(row: SolutionRow): Solution {
  return {
    id: row.id,
    injuryId: row.injury_id,
    body: row.body,
    url: row.url == null || row.url.length === 0 ? null : row.url,
    createdAt: row.created_at,
  };
}
