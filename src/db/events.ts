import type { SQLiteDatabase } from 'expo-sqlite';

import type { InjuryEvent, InjuryEventType } from '@/domain/injury';

type EventRow = {
  id: number;
  injury_id: number;
  type: string;
  solution_id: number | null;
  created_at: string;
};

export async function insertInjuryEvent(
  db: SQLiteDatabase,
  input: {
    injuryId: number;
    type: InjuryEventType;
    solutionId?: number | null;
    createdAt?: string;
  },
): Promise<InjuryEvent> {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const solutionId = input.solutionId ?? null;
  const result = await db.runAsync(
    'INSERT INTO injury_events (injury_id, type, solution_id, created_at) VALUES (?, ?, ?, ?)',
    input.injuryId,
    input.type,
    solutionId,
    createdAt,
  );

  return {
    id: result.lastInsertRowId,
    injuryId: input.injuryId,
    type: input.type,
    solutionId,
    createdAt,
  };
}

export async function listEventsForInjury(
  db: SQLiteDatabase,
  injuryId: number,
): Promise<InjuryEvent[]> {
  const rows = await db.getAllAsync<EventRow>(
    'SELECT id, injury_id, type, solution_id, created_at FROM injury_events WHERE injury_id = ? ORDER BY created_at ASC, id ASC',
    injuryId,
  );
  return rows.map(mapEvent);
}

function mapEvent(row: EventRow): InjuryEvent {
  return {
    id: row.id,
    injuryId: row.injury_id,
    type: parseEventType(row.type, row.id),
    solutionId: row.solution_id,
    createdAt: row.created_at,
  };
}

function parseEventType(value: string, eventId: number): InjuryEventType {
  if (
    value === 'created' ||
    value === 'archived' ||
    value === 'reopened' ||
    value === 'solution_added' ||
    value === 'solution_removed'
  ) {
    return value;
  }
  throw new Error(`Cannot map injury event ${eventId}: unknown type "${value}"`);
}
