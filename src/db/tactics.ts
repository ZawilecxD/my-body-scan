import type { SQLiteDatabase } from 'expo-sqlite';

import { getIllnessById } from '@/db/illnesses';
import { isHttpUrl } from '@/domain/http-url';
import type { SymptomTactic } from '@/domain/illness';

type TacticRow = {
  id: number;
  illness_id: number;
  body: string;
  url: string | null;
  created_at: string;
};

const TACTIC_COLUMNS = 'id, illness_id, body, url, created_at';

export async function createSymptomTactic(
  db: SQLiteDatabase,
  input: { illnessId: number; body: string; url?: string | null },
): Promise<SymptomTactic> {
  const body = input.body.trim();
  if (body.length === 0) {
    throw new Error('Cannot create symptom tactic: body is empty');
  }

  const illness = await getIllnessById(db, input.illnessId);
  if (illness == null) {
    throw new Error(`Cannot create symptom tactic: illness not found (${input.illnessId})`);
  }

  const trimmedUrl = input.url?.trim() ?? '';
  const url = trimmedUrl.length === 0 ? null : trimmedUrl;
  if (url != null && !isHttpUrl(url)) {
    throw new Error(`Cannot create symptom tactic: URL is not http(s) (${url})`);
  }

  const createdAt = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO symptom_tactics (illness_id, body, url, created_at) VALUES (?, ?, ?, ?)',
    input.illnessId,
    body,
    url,
    createdAt,
  );

  return {
    id: result.lastInsertRowId,
    illnessId: input.illnessId,
    body,
    url,
    createdAt,
  };
}

export async function listSymptomTacticsForIllness(
  db: SQLiteDatabase,
  illnessId: number,
): Promise<SymptomTactic[]> {
  const rows = await db.getAllAsync<TacticRow>(
    `SELECT ${TACTIC_COLUMNS} FROM symptom_tactics WHERE illness_id = ? ORDER BY created_at DESC, id DESC`,
    illnessId,
  );
  return rows.map(mapTactic);
}

function mapTactic(row: TacticRow): SymptomTactic {
  return {
    id: row.id,
    illnessId: row.illness_id,
    body: row.body,
    url: row.url == null || row.url.length === 0 ? null : row.url,
    createdAt: row.created_at,
  };
}
