import type { SQLiteDatabase } from 'expo-sqlite';

import { listCommentsForInjury } from '@/db/comments';
import { listSeverityReadingsForInjury } from '@/db/readings';
import { listSolutionsForInjury } from '@/db/solutions';
import type { Comment, Injury, InjuryStatus, Solution } from '@/domain/injury';
import { parseLimb, REGION_ORDER } from '@/domain/landmarks';
import {
  commentInWindow,
  injuryOverlapsWindow,
  landmarkLabelForInjury,
  pickLatestSeverity,
  regionForInjury,
  resolveWindow,
  type SummaryConfig,
  type SummaryDocument,
  type SummaryInjurySection,
} from '@/domain/summary';
import type { TranslateFn } from '@/i18n';

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

export async function loadSummary(
  db: SQLiteDatabase,
  config: SummaryConfig,
  now: Date,
  t: TranslateFn,
): Promise<SummaryDocument> {
  const window = resolveWindow(config.windowPreset, now);
  const rows = await db.getAllAsync<InjuryRow>(
    `SELECT ${INJURY_COLUMNS} FROM injuries ORDER BY created_at DESC, id DESC`,
  );
  const injuries = rows.map(mapInjury);

  const selected = injuries.filter((injury) => {
    if (!injuryOverlapsWindow(injury, window)) {
      return false;
    }
    if (!config.includeArchived && injury.status !== 'open') {
      return false;
    }
    return true;
  });

  const sections: SummaryInjurySection[] = [];
  for (const injury of selected) {
    const region = regionForInjury(injury);
    const landmarkLabel = landmarkLabelForInjury(injury, t);

    let description: string | null = null;
    if (config.includeDescription) {
      description = injury.description;
    }

    let latestSeverity = null as SummaryInjurySection['latestSeverity'];
    if (config.includeLatestSeverity) {
      const readings = await listSeverityReadingsForInjury(db, injury.id);
      latestSeverity = pickLatestSeverity(readings);
    }

    let solutions: Solution[] = [];
    if (config.includeSolutions) {
      solutions = await listSolutionsForInjury(db, injury.id);
    }

    let comments: Comment[] = [];
    if (config.includeComments) {
      const allComments = await listCommentsForInjury(db, injury.id);
      comments = allComments.filter((comment) => commentInWindow(comment, window));
    }

    sections.push({
      injury,
      region,
      landmarkLabel,
      description,
      latestSeverity,
      solutions,
      comments,
    });
  }

  sections.sort((a, b) => {
    const regionDelta = REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region);
    if (regionDelta !== 0) {
      return regionDelta;
    }
    if (a.injury.createdAt !== b.injury.createdAt) {
      return a.injury.createdAt < b.injury.createdAt ? 1 : -1;
    }
    return b.injury.id - a.injury.id;
  });

  return {
    generatedAt: now.toISOString(),
    window,
    windowPreset: config.windowPreset,
    includeArchived: config.includeArchived,
    injuries: sections,
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
