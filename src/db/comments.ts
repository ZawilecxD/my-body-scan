import type { SQLiteDatabase } from 'expo-sqlite';

import { getInjuryById } from '@/db/injuries';
import type { Comment } from '@/domain/injury';

type CommentRow = {
  id: number;
  injury_id: number;
  body: string;
  created_at: string;
};

export async function createComment(
  db: SQLiteDatabase,
  input: { injuryId: number; body: string },
): Promise<Comment> {
  const body = input.body.trim();
  if (body.length === 0) {
    throw new Error('Cannot create comment: body is empty');
  }

  const injury = await getInjuryById(db, input.injuryId);
  if (injury == null) {
    throw new Error(`Cannot create comment: injury not found (${input.injuryId})`);
  }

  const createdAt = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO comments (injury_id, body, created_at) VALUES (?, ?, ?)',
    input.injuryId,
    body,
    createdAt,
  );

  return {
    id: result.lastInsertRowId,
    injuryId: input.injuryId,
    body,
    createdAt,
  };
}

export async function listCommentsForInjury(
  db: SQLiteDatabase,
  injuryId: number,
): Promise<Comment[]> {
  const rows = await db.getAllAsync<CommentRow>(
    'SELECT id, injury_id, body, created_at FROM comments WHERE injury_id = ? ORDER BY created_at ASC, id ASC',
    injuryId,
  );
  return rows.map(mapComment);
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    injuryId: row.injury_id,
    body: row.body,
    createdAt: row.created_at,
  };
}
