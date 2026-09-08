import type { Comment, Injury, SeverityReading, Solution } from '@/domain/injury';
import {
  formatLandmarkLabel,
  getLandmarkById,
  REGION_ORDER,
  type Region,
} from '@/domain/landmarks';

export type SummaryWindowPreset = '1m' | '3m' | '6m' | '12m' | 'all';

export type SummaryWindow = {
  start: string | null;
  end: string;
};

export type SummaryConfig = {
  windowPreset: SummaryWindowPreset;
  includeArchived: boolean;
  includeDescription: boolean;
  includeLatestSeverity: boolean;
  includeSolutions: boolean;
  includeComments: boolean;
};

export const DEFAULT_SUMMARY_CONFIG: SummaryConfig = {
  windowPreset: '6m',
  includeArchived: true,
  includeDescription: true,
  includeLatestSeverity: true,
  includeSolutions: false,
  includeComments: false,
};

export const SUMMARY_WINDOW_PRESETS: readonly SummaryWindowPreset[] = [
  '1m',
  '3m',
  '6m',
  '12m',
  'all',
];

export type SummaryInjurySection = {
  injury: Injury;
  region: Region;
  landmarkLabel: string;
  description: string | null;
  latestSeverity: SeverityReading | null;
  solutions: Solution[];
  comments: Comment[];
};

export type SummaryDocument = {
  generatedAt: string;
  window: SummaryWindow;
  windowPreset: SummaryWindowPreset;
  includeArchived: boolean;
  injuries: SummaryInjurySection[];
};

export function resolveWindow(preset: SummaryWindowPreset, now: Date): SummaryWindow {
  const end = now.toISOString();
  if (preset === 'all') {
    return { start: null, end };
  }

  const months = preset === '1m' ? 1 : preset === '3m' ? 3 : preset === '6m' ? 6 : 12;
  const startDate = new Date(now.getTime());
  startDate.setMonth(startDate.getMonth() - months);
  return { start: startDate.toISOString(), end };
}

export function injuryOverlapsWindow(injury: Injury, window: SummaryWindow): boolean {
  if (injury.createdAt > window.end) {
    return false;
  }
  if (window.start == null) {
    return true;
  }
  if (injury.archivedAt == null) {
    return true;
  }
  return injury.archivedAt >= window.start;
}

export function commentInWindow(comment: Comment, window: SummaryWindow): boolean {
  if (comment.createdAt > window.end) {
    return false;
  }
  if (window.start == null) {
    return true;
  }
  return comment.createdAt >= window.start;
}

export function windowPresetLabel(preset: SummaryWindowPreset): string {
  switch (preset) {
    case '1m':
      return 'Last 1 month';
    case '3m':
      return 'Last 3 months';
    case '6m':
      return 'Last 6 months';
    case '12m':
      return 'Last 12 months';
    case 'all':
      return 'All time';
  }
}

export function statusScopeLabel(includeArchived: boolean): string {
  return includeArchived ? 'Open and archived' : 'Open only';
}

export function regionLabel(region: Region): string {
  switch (region) {
    case 'head':
      return 'Head';
    case 'torso':
      return 'Torso';
    case 'arms':
      return 'Arms';
    case 'legs':
      return 'Legs';
  }
}

export function formatSummaryText(doc: SummaryDocument): string {
  const lines: string[] = [
    'Physio summary',
    `Generated: ${formatTimestamp(doc.generatedAt)}`,
    `Window: ${windowPresetLabel(doc.windowPreset)}`,
    `Status: ${statusScopeLabel(doc.includeArchived)}`,
    '',
  ];

  if (doc.injuries.length === 0) {
    lines.push('No injuries in this window.');
    return lines.join('\n');
  }

  for (const region of REGION_ORDER) {
    const sections = doc.injuries.filter((item) => item.region === region);
    if (sections.length === 0) {
      continue;
    }
    lines.push(regionLabel(region));
    for (const section of sections) {
      lines.push(...formatInjuryTextLines(section));
      lines.push('');
    }
  }

  return lines.join('\n').trimEnd() + '\n';
}

export function formatSummaryHtml(doc: SummaryDocument): string {
  const parts: string[] = [
    '<!DOCTYPE html>',
    '<html><head><meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<style>',
    'body{font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.45;color:#111;margin:24px;}',
    'h1{font-size:22px;margin:0 0 8px;}',
    'h2{font-size:16px;margin:20px 0 8px;border-bottom:1px solid #ccc;padding-bottom:4px;}',
    'h3{font-size:15px;margin:14px 0 4px;}',
    '.meta{color:#444;margin:0 0 4px;}',
    '.block{margin:0 0 12px;}',
    'ul{margin:4px 0 8px 18px;padding:0;}',
    '</style></head><body>',
    '<h1>Physio summary</h1>',
    `<p class="meta">Generated: ${escapeHtml(formatTimestamp(doc.generatedAt))}</p>`,
    `<p class="meta">Window: ${escapeHtml(windowPresetLabel(doc.windowPreset))}</p>`,
    `<p class="meta">Status: ${escapeHtml(statusScopeLabel(doc.includeArchived))}</p>`,
  ];

  if (doc.injuries.length === 0) {
    parts.push('<p>No injuries in this window.</p>');
    parts.push('</body></html>');
    return parts.join('');
  }

  for (const region of REGION_ORDER) {
    const sections = doc.injuries.filter((item) => item.region === region);
    if (sections.length === 0) {
      continue;
    }
    parts.push(`<h2>${escapeHtml(regionLabel(region))}</h2>`);
    for (const section of sections) {
      parts.push(...formatInjuryHtmlBlocks(section));
    }
  }

  parts.push('</body></html>');
  return parts.join('');
}

export function landmarkLabelForInjury(injury: Injury): string {
  const landmark = getLandmarkById(injury.landmarkId);
  if (landmark == null) {
    return injury.landmarkId;
  }
  return formatLandmarkLabel(landmark, injury.limb);
}

export function regionForInjury(injury: Injury): Region {
  const landmark = getLandmarkById(injury.landmarkId);
  if (landmark == null) {
    throw new Error(`Cannot build summary: unknown landmark "${injury.landmarkId}"`);
  }
  return landmark.region;
}

export function pickLatestSeverity(readings: SeverityReading[]): SeverityReading | null {
  if (readings.length === 0) {
    return null;
  }
  let latest = readings[0];
  for (let index = 1; index < readings.length; index += 1) {
    const reading = readings[index];
    if (
      reading.createdAt > latest.createdAt ||
      (reading.createdAt === latest.createdAt && reading.id > latest.id)
    ) {
      latest = reading;
    }
  }
  return latest;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatInjuryTextLines(section: SummaryInjurySection): string[] {
  const status = section.injury.status === 'open' ? 'Open' : 'Archived';
  const lines = [`${section.landmarkLabel} (${status})`];

  if (section.description != null) {
    lines.push(`Description: ${section.description}`);
  }
  if (section.latestSeverity != null) {
    lines.push(
      `Severity: ${section.latestSeverity.value} / 10 (${formatTimestamp(section.latestSeverity.createdAt)})`,
    );
  }
  if (section.solutions.length > 0) {
    lines.push('Solutions:');
    for (const solution of section.solutions) {
      lines.push(
        solution.url == null ? `  - ${solution.body}` : `  - ${solution.body} (${solution.url})`,
      );
    }
  }
  if (section.comments.length > 0) {
    lines.push('Comments:');
    for (const comment of section.comments) {
      lines.push(`  - ${formatTimestamp(comment.createdAt)}: ${comment.body}`);
    }
  }
  return lines;
}

function formatInjuryHtmlBlocks(section: SummaryInjurySection): string[] {
  const status = section.injury.status === 'open' ? 'Open' : 'Archived';
  const blocks = [
    `<div class="block"><h3>${escapeHtml(section.landmarkLabel)} (${status})</h3>`,
  ];

  if (section.description != null) {
    blocks.push(`<p><strong>Description:</strong> ${escapeHtml(section.description)}</p>`);
  }
  if (section.latestSeverity != null) {
    blocks.push(
      `<p><strong>Severity:</strong> ${section.latestSeverity.value} / 10 (${escapeHtml(formatTimestamp(section.latestSeverity.createdAt))})</p>`,
    );
  }
  if (section.solutions.length > 0) {
    blocks.push('<p><strong>Solutions:</strong></p><ul>');
    for (const solution of section.solutions) {
      const body = escapeHtml(solution.body);
      if (solution.url == null) {
        blocks.push(`<li>${body}</li>`);
      } else {
        blocks.push(`<li>${body} (${escapeHtml(solution.url)})</li>`);
      }
    }
    blocks.push('</ul>');
  }
  if (section.comments.length > 0) {
    blocks.push('<p><strong>Comments:</strong></p><ul>');
    for (const comment of section.comments) {
      blocks.push(
        `<li>${escapeHtml(formatTimestamp(comment.createdAt))}: ${escapeHtml(comment.body)}</li>`,
      );
    }
    blocks.push('</ul>');
  }
  blocks.push('</div>');
  return blocks;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString();
}
