import type { SQLiteDatabase } from 'expo-sqlite';

import { BACKUP_SCHEMA_VERSION } from '@/db/migrate';
import type { BackupPayload } from '@/domain/backup';
import type { Illness, IllnessEpisode, SymptomTactic } from '@/domain/illness';
import type {
  Comment,
  Injury,
  InjuryEvent,
  InjuryEventType,
  InjuryStatus,
  SeverityReading,
  Solution,
} from '@/domain/injury';
import { getLandmarkById, type Limb } from '@/domain/landmarks';

type InjuryRow = {
  id: number;
  landmark_id: string;
  description: string;
  status: string;
  created_at: string;
  archived_at: string | null;
  limb: string | null;
};

type CommentRow = {
  id: number;
  injury_id: number;
  body: string;
  created_at: string;
};

type SolutionRow = {
  id: number;
  injury_id: number;
  body: string;
  url: string | null;
  created_at: string;
  removed_at: string | null;
};

type EventRow = {
  id: number;
  injury_id: number;
  type: string;
  solution_id: number | null;
  created_at: string;
};

type SeverityReadingRow = {
  id: number;
  injury_id: number;
  value: number;
  created_at: string;
};

type IllnessRow = {
  id: number;
  name: string;
  notes: string | null;
  created_at: string;
};

type EpisodeRow = {
  id: number;
  illness_id: number;
  noted_at: string;
  created_at: string;
};

type TacticRow = {
  id: number;
  illness_id: number;
  body: string;
  url: string | null;
  created_at: string;
};

export async function dumpBackup(db: SQLiteDatabase): Promise<BackupPayload> {
  const injuryRows = await db.getAllAsync<InjuryRow>(
    'SELECT id, landmark_id, description, status, created_at, archived_at, limb FROM injuries ORDER BY id ASC',
  );
  const commentRows = await db.getAllAsync<CommentRow>(
    'SELECT id, injury_id, body, created_at FROM comments ORDER BY id ASC',
  );
  const solutionRows = await db.getAllAsync<SolutionRow>(
    'SELECT id, injury_id, body, url, created_at, removed_at FROM solutions ORDER BY id ASC',
  );
  const eventRows = await db.getAllAsync<EventRow>(
    'SELECT id, injury_id, type, solution_id, created_at FROM injury_events ORDER BY id ASC',
  );
  const readingRows = await db.getAllAsync<SeverityReadingRow>(
    'SELECT id, injury_id, value, created_at FROM severity_readings ORDER BY id ASC',
  );
  const illnessRows = await db.getAllAsync<IllnessRow>(
    'SELECT id, name, notes, created_at FROM illnesses ORDER BY id ASC',
  );
  const episodeRows = await db.getAllAsync<EpisodeRow>(
    'SELECT id, illness_id, noted_at, created_at FROM illness_episodes ORDER BY id ASC',
  );
  const tacticRows = await db.getAllAsync<TacticRow>(
    'SELECT id, illness_id, body, url, created_at FROM symptom_tactics ORDER BY id ASC',
  );

  return {
    formatVersion: 1,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    injuries: injuryRows.map(mapInjuryRow),
    comments: commentRows.map(mapCommentRow),
    solutions: solutionRows.map(mapSolutionRow),
    events: eventRows.map(mapEventRow),
    readings: readingRows.map(mapSeverityReadingRow),
    illnesses: illnessRows.map(mapIllnessRow),
    episodes: episodeRows.map(mapEpisodeRow),
    tactics: tacticRows.map(mapTacticRow),
  };
}

export function parseBackupJson(text: string): BackupPayload {
  let raw: unknown;
  try {
    raw = JSON.parse(text) as unknown;
  } catch {
    throw new Error('Cannot parse backup: invalid JSON');
  }

  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Cannot parse backup: root must be an object');
  }

  const record = raw as Record<string, unknown>;

  if (record.formatVersion !== 1) {
    throw new Error(`Cannot parse backup: unsupported formatVersion (${String(record.formatVersion)})`);
  }
  if (record.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    throw new Error(
      `Cannot parse backup: schemaVersion ${String(record.schemaVersion)} does not match app schema ${BACKUP_SCHEMA_VERSION}`,
    );
  }
  if (typeof record.exportedAt !== 'string' || record.exportedAt.length === 0) {
    throw new Error('Cannot parse backup: exportedAt must be a non-empty string');
  }
  if (!Array.isArray(record.injuries)) {
    throw new Error('Cannot parse backup: injuries must be an array');
  }
  if (!Array.isArray(record.comments)) {
    throw new Error('Cannot parse backup: comments must be an array');
  }
  if (!Array.isArray(record.solutions)) {
    throw new Error('Cannot parse backup: solutions must be an array');
  }
  if (!Array.isArray(record.events)) {
    throw new Error('Cannot parse backup: events must be an array');
  }
  if (!Array.isArray(record.readings)) {
    throw new Error('Cannot parse backup: readings must be an array');
  }
  if (!Array.isArray(record.illnesses)) {
    throw new Error('Cannot parse backup: illnesses must be an array');
  }
  if (!Array.isArray(record.episodes)) {
    throw new Error('Cannot parse backup: episodes must be an array');
  }
  if (!Array.isArray(record.tactics)) {
    throw new Error('Cannot parse backup: tactics must be an array');
  }

  const injuries = record.injuries.map((item, index) => parseInjury(item, index));
  const comments = record.comments.map((item, index) => parseComment(item, index));
  const solutions = record.solutions.map((item, index) => parseSolution(item, index));
  const events = record.events.map((item, index) => parseEvent(item, index));
  const readings = record.readings.map((item, index) => parseReading(item, index));
  const illnesses = record.illnesses.map((item, index) => parseIllness(item, index));
  const episodes = record.episodes.map((item, index) => parseEpisode(item, index));
  const tactics = record.tactics.map((item, index) => parseTactic(item, index));

  return {
    formatVersion: 1,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: record.exportedAt,
    injuries,
    comments,
    solutions,
    events,
    readings,
    illnesses,
    episodes,
    tactics,
  };
}

export async function replaceFromBackup(
  db: SQLiteDatabase,
  payload: BackupPayload,
): Promise<void> {
  assertPayloadReadyForReplace(payload);

  await db.withTransactionAsync(async () => {
    await db.execAsync(`
DELETE FROM injury_events;
DELETE FROM comments;
DELETE FROM solutions;
DELETE FROM severity_readings;
DELETE FROM injuries;
DELETE FROM illness_episodes;
DELETE FROM symptom_tactics;
DELETE FROM illnesses;
`);

    for (const injury of payload.injuries) {
      await db.runAsync(
        'INSERT INTO injuries (id, landmark_id, description, status, created_at, limb, archived_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        injury.id,
        injury.landmarkId,
        injury.description,
        injury.status,
        injury.createdAt,
        injury.limb,
        injury.archivedAt,
      );
    }

    for (const comment of payload.comments) {
      await db.runAsync(
        'INSERT INTO comments (id, injury_id, body, created_at) VALUES (?, ?, ?, ?)',
        comment.id,
        comment.injuryId,
        comment.body,
        comment.createdAt,
      );
    }

    for (const solution of payload.solutions) {
      await db.runAsync(
        'INSERT INTO solutions (id, injury_id, body, url, created_at, removed_at) VALUES (?, ?, ?, ?, ?, ?)',
        solution.id,
        solution.injuryId,
        solution.body,
        solution.url,
        solution.createdAt,
        solution.removedAt,
      );
    }

    for (const event of payload.events) {
      await db.runAsync(
        'INSERT INTO injury_events (id, injury_id, type, solution_id, created_at) VALUES (?, ?, ?, ?, ?)',
        event.id,
        event.injuryId,
        event.type,
        event.solutionId,
        event.createdAt,
      );
    }

    for (const reading of payload.readings) {
      await db.runAsync(
        'INSERT INTO severity_readings (id, injury_id, value, created_at) VALUES (?, ?, ?, ?)',
        reading.id,
        reading.injuryId,
        reading.value,
        reading.createdAt,
      );
    }

    for (const illness of payload.illnesses) {
      await db.runAsync(
        'INSERT INTO illnesses (id, name, notes, created_at) VALUES (?, ?, ?, ?)',
        illness.id,
        illness.name,
        illness.notes,
        illness.createdAt,
      );
    }

    for (const episode of payload.episodes) {
      await db.runAsync(
        'INSERT INTO illness_episodes (id, illness_id, noted_at, created_at) VALUES (?, ?, ?, ?)',
        episode.id,
        episode.illnessId,
        episode.notedAt,
        episode.createdAt,
      );
    }

    for (const tactic of payload.tactics) {
      await db.runAsync(
        'INSERT INTO symptom_tactics (id, illness_id, body, url, created_at) VALUES (?, ?, ?, ?, ?)',
        tactic.id,
        tactic.illnessId,
        tactic.body,
        tactic.url,
        tactic.createdAt,
      );
    }
  });
}

function assertPayloadReadyForReplace(payload: BackupPayload): void {
  if (payload.formatVersion !== 1) {
    throw new Error(`Cannot restore backup: unsupported formatVersion (${payload.formatVersion})`);
  }
  if (payload.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    throw new Error(
      `Cannot restore backup: schemaVersion ${payload.schemaVersion} does not match app schema ${BACKUP_SCHEMA_VERSION}`,
    );
  }

  for (const injury of payload.injuries) {
    if (getLandmarkById(injury.landmarkId) == null) {
      throw new Error(`Cannot restore backup: unknown landmark "${injury.landmarkId}" (injury ${injury.id})`);
    }
  }

  const illnessIds = new Set(payload.illnesses.map((illness) => illness.id));
  for (const episode of payload.episodes) {
    if (!illnessIds.has(episode.illnessId)) {
      throw new Error(
        `Cannot restore backup: episode ${episode.id} references missing illness ${episode.illnessId}`,
      );
    }
  }
  for (const tactic of payload.tactics) {
    if (!illnessIds.has(tactic.illnessId)) {
      throw new Error(
        `Cannot restore backup: tactic ${tactic.id} references missing illness ${tactic.illnessId}`,
      );
    }
  }
}

function parseInjury(value: unknown, index: number): Injury {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Cannot parse backup: injuries[${index}] must be an object`);
  }
  const row = value as Record<string, unknown>;
  const id = requireNumber(row.id, `injuries[${index}].id`);
  const landmarkId = requireNonEmptyString(row.landmarkId, `injuries[${index}].landmarkId`);
  const description = requireNonEmptyString(row.description, `injuries[${index}].description`);
  const status = parseStatus(row.status, `injuries[${index}].status`);
  const createdAt = requireNonEmptyString(row.createdAt, `injuries[${index}].createdAt`);
  const archivedAt = requireNullableString(row.archivedAt, `injuries[${index}].archivedAt`);
  const limb = parseLimbField(row.limb, `injuries[${index}].limb`);

  if (getLandmarkById(landmarkId) == null) {
    throw new Error(`Cannot parse backup: injuries[${index}] unknown landmark "${landmarkId}"`);
  }

  return { id, landmarkId, description, status, createdAt, archivedAt, limb };
}

function parseComment(value: unknown, index: number): Comment {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Cannot parse backup: comments[${index}] must be an object`);
  }
  const row = value as Record<string, unknown>;
  return {
    id: requireNumber(row.id, `comments[${index}].id`),
    injuryId: requireNumber(row.injuryId, `comments[${index}].injuryId`),
    body: requireNonEmptyString(row.body, `comments[${index}].body`),
    createdAt: requireNonEmptyString(row.createdAt, `comments[${index}].createdAt`),
  };
}

function parseSolution(value: unknown, index: number): Solution {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Cannot parse backup: solutions[${index}] must be an object`);
  }
  const row = value as Record<string, unknown>;
  const url = requireNullableString(row.url, `solutions[${index}].url`);
  return {
    id: requireNumber(row.id, `solutions[${index}].id`),
    injuryId: requireNumber(row.injuryId, `solutions[${index}].injuryId`),
    body: requireNonEmptyString(row.body, `solutions[${index}].body`),
    url: url == null || url.length === 0 ? null : url,
    createdAt: requireNonEmptyString(row.createdAt, `solutions[${index}].createdAt`),
    removedAt: requireNullableString(row.removedAt, `solutions[${index}].removedAt`),
  };
}

function parseEvent(value: unknown, index: number): InjuryEvent {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Cannot parse backup: events[${index}] must be an object`);
  }
  const row = value as Record<string, unknown>;
  return {
    id: requireNumber(row.id, `events[${index}].id`),
    injuryId: requireNumber(row.injuryId, `events[${index}].injuryId`),
    type: parseEventType(row.type, `events[${index}].type`),
    solutionId: requireNullableNumber(row.solutionId, `events[${index}].solutionId`),
    createdAt: requireNonEmptyString(row.createdAt, `events[${index}].createdAt`),
  };
}

function parseReading(value: unknown, index: number): SeverityReading {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Cannot parse backup: readings[${index}] must be an object`);
  }
  const row = value as Record<string, unknown>;
  const readingValue = requireNumber(row.value, `readings[${index}].value`);
  if (readingValue < 0 || readingValue > 10) {
    throw new Error(`Cannot parse backup: readings[${index}].value must be an integer 0–10`);
  }
  return {
    id: requireNumber(row.id, `readings[${index}].id`),
    injuryId: requireNumber(row.injuryId, `readings[${index}].injuryId`),
    value: readingValue,
    createdAt: requireNonEmptyString(row.createdAt, `readings[${index}].createdAt`),
  };
}

function parseIllness(value: unknown, index: number): Illness {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Cannot parse backup: illnesses[${index}] must be an object`);
  }
  const row = value as Record<string, unknown>;
  const notes = requireNullableString(row.notes, `illnesses[${index}].notes`);
  return {
    id: requireNumber(row.id, `illnesses[${index}].id`),
    name: requireNonEmptyString(row.name, `illnesses[${index}].name`),
    notes: notes == null || notes.length === 0 ? null : notes,
    createdAt: requireNonEmptyString(row.createdAt, `illnesses[${index}].createdAt`),
  };
}

function parseEpisode(value: unknown, index: number): IllnessEpisode {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Cannot parse backup: episodes[${index}] must be an object`);
  }
  const row = value as Record<string, unknown>;
  return {
    id: requireNumber(row.id, `episodes[${index}].id`),
    illnessId: requireNumber(row.illnessId, `episodes[${index}].illnessId`),
    notedAt: requireNonEmptyString(row.notedAt, `episodes[${index}].notedAt`),
    createdAt: requireNonEmptyString(row.createdAt, `episodes[${index}].createdAt`),
  };
}

function parseTactic(value: unknown, index: number): SymptomTactic {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Cannot parse backup: tactics[${index}] must be an object`);
  }
  const row = value as Record<string, unknown>;
  const url = requireNullableString(row.url, `tactics[${index}].url`);
  return {
    id: requireNumber(row.id, `tactics[${index}].id`),
    illnessId: requireNumber(row.illnessId, `tactics[${index}].illnessId`),
    body: requireNonEmptyString(row.body, `tactics[${index}].body`),
    url: url == null || url.length === 0 ? null : url,
    createdAt: requireNonEmptyString(row.createdAt, `tactics[${index}].createdAt`),
  };
}

function mapInjuryRow(row: InjuryRow): Injury {
  return {
    id: row.id,
    landmarkId: row.landmark_id,
    description: row.description,
    status: parseStatus(row.status, `injury ${row.id} status`),
    createdAt: row.created_at,
    archivedAt: row.archived_at,
    limb: parseLimbField(row.limb, `injury ${row.id} limb`),
  };
}

function mapCommentRow(row: CommentRow): Comment {
  return {
    id: row.id,
    injuryId: row.injury_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

function mapSolutionRow(row: SolutionRow): Solution {
  return {
    id: row.id,
    injuryId: row.injury_id,
    body: row.body,
    url: row.url == null || row.url.length === 0 ? null : row.url,
    createdAt: row.created_at,
    removedAt: row.removed_at,
  };
}

function mapEventRow(row: EventRow): InjuryEvent {
  return {
    id: row.id,
    injuryId: row.injury_id,
    type: parseEventType(row.type, `event ${row.id} type`),
    solutionId: row.solution_id,
    createdAt: row.created_at,
  };
}

function mapSeverityReadingRow(row: SeverityReadingRow): SeverityReading {
  return {
    id: row.id,
    injuryId: row.injury_id,
    value: row.value,
    createdAt: row.created_at,
  };
}

function mapIllnessRow(row: IllnessRow): Illness {
  return {
    id: row.id,
    name: row.name,
    notes: row.notes == null || row.notes.length === 0 ? null : row.notes,
    createdAt: row.created_at,
  };
}

function mapEpisodeRow(row: EpisodeRow): IllnessEpisode {
  return {
    id: row.id,
    illnessId: row.illness_id,
    notedAt: row.noted_at,
    createdAt: row.created_at,
  };
}

function mapTacticRow(row: TacticRow): SymptomTactic {
  return {
    id: row.id,
    illnessId: row.illness_id,
    body: row.body,
    url: row.url == null || row.url.length === 0 ? null : row.url,
    createdAt: row.created_at,
  };
}

function parseStatus(value: unknown, label: string): InjuryStatus {
  if (value === 'open' || value === 'archived') {
    return value;
  }
  throw new Error(`Cannot parse backup: ${label} must be "open" or "archived"`);
}

function parseEventType(value: unknown, label: string): InjuryEventType {
  if (
    value === 'created' ||
    value === 'archived' ||
    value === 'reopened' ||
    value === 'solution_added' ||
    value === 'solution_removed'
  ) {
    return value;
  }
  throw new Error(`Cannot parse backup: ${label} is an unknown event type`);
}

function parseLimbField(value: unknown, label: string): Limb | null {
  if (value == null) {
    return null;
  }
  if (value === 'left' || value === 'right') {
    return value;
  }
  throw new Error(`Cannot parse backup: ${label} must be "left", "right", or null`);
}

function requireNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
    throw new Error(`Cannot parse backup: ${label} must be an integer`);
  }
  return value;
}

function requireNullableNumber(value: unknown, label: string): number | null {
  if (value == null) {
    return null;
  }
  return requireNumber(value, label);
}

function requireNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Cannot parse backup: ${label} must be a non-empty string`);
  }
  return value;
}

function requireNullableString(value: unknown, label: string): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new Error(`Cannot parse backup: ${label} must be a string or null`);
  }
  return value;
}
