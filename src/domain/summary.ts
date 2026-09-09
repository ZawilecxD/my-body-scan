import type { Comment, Injury, SeverityReading, Solution } from '@/domain/injury';
import {
  formatLandmarkLabel,
  getLandmarkById,
  REGION_ORDER,
  regionLabel,
  type Region,
} from '@/domain/landmarks';
import type { AppLocale, TranslateFn } from '@/i18n';
import type { MessageKey } from '@/i18n/messages/en';

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

export function windowPresetLabel(preset: SummaryWindowPreset, t: TranslateFn): string {
  return t(`summary.window.${preset}` as MessageKey);
}

export function statusScopeLabel(includeArchived: boolean, t: TranslateFn): string {
  return includeArchived ? t('summary.scope.openAndArchived') : t('summary.scope.openOnly');
}

export function formatSummaryText(
  doc: SummaryDocument,
  t: TranslateFn,
  locale: AppLocale,
): string {
  const lines: string[] = [
    t('summary.chrome.title'),
    t('summary.chrome.generated', { when: formatTimestamp(doc.generatedAt, locale) }),
    t('summary.chrome.window', { window: windowPresetLabel(doc.windowPreset, t) }),
    t('summary.chrome.status', { status: statusScopeLabel(doc.includeArchived, t) }),
    '',
  ];

  if (doc.injuries.length === 0) {
    lines.push(t('summary.chrome.empty'));
    return lines.join('\n');
  }

  for (const region of REGION_ORDER) {
    const sections = doc.injuries.filter((item) => item.region === region);
    if (sections.length === 0) {
      continue;
    }
    lines.push(regionLabel(region, t));
    for (const section of sections) {
      lines.push(...formatInjuryTextLines(section, t, locale));
      lines.push('');
    }
  }

  return lines.join('\n').trimEnd() + '\n';
}

export function formatSummaryHtml(
  doc: SummaryDocument,
  t: TranslateFn,
  locale: AppLocale,
): string {
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
    `<h1>${escapeHtml(t('summary.chrome.title'))}</h1>`,
    `<p class="meta">${escapeHtml(t('summary.chrome.generated', { when: formatTimestamp(doc.generatedAt, locale) }))}</p>`,
    `<p class="meta">${escapeHtml(t('summary.chrome.window', { window: windowPresetLabel(doc.windowPreset, t) }))}</p>`,
    `<p class="meta">${escapeHtml(t('summary.chrome.status', { status: statusScopeLabel(doc.includeArchived, t) }))}</p>`,
  ];

  if (doc.injuries.length === 0) {
    parts.push(`<p>${escapeHtml(t('summary.chrome.empty'))}</p>`);
    parts.push('</body></html>');
    return parts.join('');
  }

  for (const region of REGION_ORDER) {
    const sections = doc.injuries.filter((item) => item.region === region);
    if (sections.length === 0) {
      continue;
    }
    parts.push(`<h2>${escapeHtml(regionLabel(region, t))}</h2>`);
    for (const section of sections) {
      parts.push(...formatInjuryHtmlBlocks(section, t, locale));
    }
  }

  parts.push('</body></html>');
  return parts.join('');
}

export function landmarkLabelForInjury(injury: Injury, t: TranslateFn): string {
  const landmark = getLandmarkById(injury.landmarkId);
  if (landmark == null) {
    return injury.landmarkId;
  }
  return formatLandmarkLabel(landmark, t, injury.limb);
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

function formatInjuryTextLines(
  section: SummaryInjurySection,
  t: TranslateFn,
  locale: AppLocale,
): string[] {
  const status =
    section.injury.status === 'open' ? t('summary.chrome.open') : t('summary.chrome.archived');
  const lines = [`${section.landmarkLabel} (${status})`];

  if (section.description != null) {
    lines.push(`${t('summary.chrome.description')}: ${section.description}`);
  }
  if (section.latestSeverity != null) {
    lines.push(
      t('summary.chrome.severityLine', {
        value: section.latestSeverity.value,
        when: formatTimestamp(section.latestSeverity.createdAt, locale),
      }),
    );
  }
  if (section.solutions.length > 0) {
    lines.push(`${t('summary.chrome.solutions')}:`);
    for (const solution of section.solutions) {
      lines.push(
        solution.url == null ? `  - ${solution.body}` : `  - ${solution.body} (${solution.url})`,
      );
    }
  }
  if (section.comments.length > 0) {
    lines.push(`${t('summary.chrome.comments')}:`);
    for (const comment of section.comments) {
      lines.push(`  - ${formatTimestamp(comment.createdAt, locale)}: ${comment.body}`);
    }
  }
  return lines;
}

function formatInjuryHtmlBlocks(
  section: SummaryInjurySection,
  t: TranslateFn,
  locale: AppLocale,
): string[] {
  const status =
    section.injury.status === 'open' ? t('summary.chrome.open') : t('summary.chrome.archived');
  const blocks = [
    `<div class="block"><h3>${escapeHtml(section.landmarkLabel)} (${escapeHtml(status)})</h3>`,
  ];

  if (section.description != null) {
    blocks.push(
      `<p><strong>${escapeHtml(t('summary.chrome.description'))}:</strong> ${escapeHtml(section.description)}</p>`,
    );
  }
  if (section.latestSeverity != null) {
    blocks.push(
      `<p><strong>${escapeHtml(t('summary.chrome.severity'))}:</strong> ${section.latestSeverity.value} / 10 (${escapeHtml(formatTimestamp(section.latestSeverity.createdAt, locale))})</p>`,
    );
  }
  if (section.solutions.length > 0) {
    blocks.push(`<p><strong>${escapeHtml(t('summary.chrome.solutions'))}:</strong></p><ul>`);
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
    blocks.push(`<p><strong>${escapeHtml(t('summary.chrome.comments'))}:</strong></p><ul>`);
    for (const comment of section.comments) {
      blocks.push(
        `<li>${escapeHtml(formatTimestamp(comment.createdAt, locale))}: ${escapeHtml(comment.body)}</li>`,
      );
    }
    blocks.push('</ul>');
  }
  blocks.push('</div>');
  return blocks;
}

function formatTimestamp(iso: string, locale: AppLocale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(locale === 'pl' ? 'pl-PL' : 'en-US');
}
