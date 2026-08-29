import type { SQLiteDatabase } from 'expo-sqlite';

import { insertInjuryEvent } from '@/db/events';
import { getInjuryById } from '@/db/injuries';
import { isHttpUrl } from '@/domain/http-url';
import type { Solution } from '@/domain/injury';

type SolutionRow = {
  id: number;
  injury_id: number;
  body: string;
  url: string | null;
  created_at: string;
  removed_at: string | null;
};

const SOLUTION_COLUMNS = 'id, injury_id, body, url, created_at, removed_at';

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
  if (injury.status !== 'open') {
    throw new Error(`Cannot create solution: injury is archived (${input.injuryId})`);
  }

  const trimmedUrl = input.url?.trim() ?? '';
  const url = trimmedUrl.length === 0 ? null : trimmedUrl;
  if (url != null && !isHttpUrl(url)) {
    throw new Error(`Cannot create solution: URL is not http(s) (${url})`);
  }

  const createdAt = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO solutions (injury_id, body, url, created_at, removed_at) VALUES (?, ?, ?, ?, ?)',
    input.injuryId,
    body,
    url,
    createdAt,
    null,
  );

  const solution: Solution = {
    id: result.lastInsertRowId,
    injuryId: input.injuryId,
    body,
    url,
    createdAt,
    removedAt: null,
  };

  await insertInjuryEvent(db, {
    injuryId: input.injuryId,
    type: 'solution_added',
    solutionId: solution.id,
    createdAt,
  });

  return solution;
}

export async function removeSolution(db: SQLiteDatabase, solutionId: number): Promise<Solution> {
  const solution = await getSolutionById(db, solutionId);
  if (solution == null) {
    throw new Error(`Cannot remove solution: not found (${solutionId})`);
  }
  if (solution.removedAt != null) {
    throw new Error(`Cannot remove solution: already removed (${solutionId})`);
  }

  const injury = await getInjuryById(db, solution.injuryId);
  if (injury == null) {
    throw new Error(`Cannot remove solution: injury not found (${solution.injuryId})`);
  }
  if (injury.status !== 'open') {
    throw new Error(`Cannot remove solution: injury is archived (${solution.injuryId})`);
  }

  const removedAt = new Date().toISOString();
  await db.runAsync('UPDATE solutions SET removed_at = ? WHERE id = ?', removedAt, solutionId);

  await insertInjuryEvent(db, {
    injuryId: solution.injuryId,
    type: 'solution_removed',
    solutionId,
    createdAt: removedAt,
  });

  return {
    ...solution,
    removedAt,
  };
}

export async function getSolutionById(
  db: SQLiteDatabase,
  solutionId: number,
): Promise<Solution | null> {
  const row = await db.getFirstAsync<SolutionRow>(
    `SELECT ${SOLUTION_COLUMNS} FROM solutions WHERE id = ?`,
    solutionId,
  );
  if (row == null) {
    return null;
  }
  return mapSolution(row);
}

export async function listSolutionsForInjury(
  db: SQLiteDatabase,
  injuryId: number,
): Promise<Solution[]> {
  const rows = await db.getAllAsync<SolutionRow>(
    `SELECT ${SOLUTION_COLUMNS} FROM solutions WHERE injury_id = ? AND removed_at IS NULL ORDER BY created_at DESC, id DESC`,
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
    `SELECT ${SOLUTION_COLUMNS} FROM solutions WHERE injury_id IN (${placeholders}) AND removed_at IS NULL ORDER BY created_at DESC, id DESC`,
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
    removedAt: row.removed_at,
  };
}
