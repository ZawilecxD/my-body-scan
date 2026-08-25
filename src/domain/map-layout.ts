import {
  LANDMARKS,
  type Region,
  type Side,
} from '@/domain/landmarks';

export const OVERVIEW_VIEWBOX = { width: 200, height: 420 } as const;

export const CLOSE_UP_VIEWBOX = { width: 200, height: 320 } as const;

type RegionPath = { region: Region; d: string };
type MarkerPoint = { landmarkId: string; cx: number; cy: number };
type CloseUpTarget = {
  landmarkId: string;
  cx: number;
  cy: number;
  r: number;
  label: string;
};

/** Phone-sized tap radius in close-up viewBox units (≥44 dp when scaled to screen width). */
const CLOSE_UP_RADIUS = 18;

const FRONT_REGION_PATHS: readonly RegionPath[] = [
  {
    region: 'head',
    d: 'M78 12 H122 Q138 12 138 36 V58 Q138 78 100 78 Q62 78 62 58 V36 Q62 12 78 12 Z',
  },
  {
    region: 'torso',
    d: 'M72 78 H128 L140 200 H60 Z',
  },
  {
    region: 'arms',
    d: 'M40 82 H72 V120 H48 L28 210 H12 L32 120 V82 Z M128 82 H160 V120 H168 L188 210 H172 L152 120 V82 Z',
  },
  {
    region: 'legs',
    d: 'M60 200 H100 V400 H72 V250 H60 Z M100 200 H140 V250 H128 V400 H100 Z',
  },
];

const BACK_REGION_PATHS: readonly RegionPath[] = [
  {
    region: 'head',
    d: 'M78 12 H122 Q138 12 138 36 V58 Q138 78 100 78 Q62 78 62 58 V36 Q62 12 78 12 Z',
  },
  {
    region: 'torso',
    d: 'M72 78 H128 L140 200 H60 Z',
  },
  {
    region: 'arms',
    d: 'M40 82 H72 V120 H48 L28 210 H12 L32 120 V82 Z M128 82 H160 V120 H168 L188 210 H172 L152 120 V82 Z',
  },
  {
    region: 'legs',
    d: 'M60 200 H100 V400 H72 V250 H60 Z M100 200 H140 V250 H128 V400 H100 Z',
  },
];

/** Overview marker dots keyed by landmark id — one point per §5 row. */
const OVERVIEW_MARKERS: Readonly<Record<string, { cx: number; cy: number }>> = {
  'head-front-skull': { cx: 100, cy: 28 },
  'head-front-jaw': { cx: 100, cy: 52 },
  'head-front-neck': { cx: 100, cy: 70 },
  'head-back-skull': { cx: 100, cy: 32 },
  'head-back-neck': { cx: 100, cy: 70 },

  'torso-front-collarbone': { cx: 100, cy: 92 },
  'torso-front-chest': { cx: 100, cy: 118 },
  'torso-front-ribs': { cx: 100, cy: 148 },
  'torso-front-abdomen': { cx: 100, cy: 178 },
  'torso-back-upper-back': { cx: 100, cy: 110 },
  'torso-back-lower-back': { cx: 100, cy: 170 },

  'arms-front-shoulder': { cx: 48, cy: 95 },
  'arms-front-upper-arm': { cx: 40, cy: 125 },
  'arms-front-elbow': { cx: 32, cy: 155 },
  'arms-front-forearm': { cx: 26, cy: 180 },
  'arms-front-wrist': { cx: 20, cy: 200 },
  'arms-front-hand': { cx: 16, cy: 215 },
  'arms-back-shoulder': { cx: 48, cy: 95 },
  'arms-back-upper-arm': { cx: 40, cy: 125 },
  'arms-back-elbow': { cx: 32, cy: 155 },
  'arms-back-forearm': { cx: 26, cy: 180 },
  'arms-back-wrist': { cx: 20, cy: 200 },
  'arms-back-hand': { cx: 16, cy: 215 },

  'legs-front-hip': { cx: 80, cy: 215 },
  'legs-front-thigh': { cx: 80, cy: 255 },
  'legs-front-knee': { cx: 80, cy: 300 },
  'legs-front-shin': { cx: 80, cy: 340 },
  'legs-front-ankle': { cx: 80, cy: 375 },
  'legs-front-foot': { cx: 80, cy: 400 },
  'legs-back-glute': { cx: 80, cy: 215 },
  'legs-back-hamstring': { cx: 80, cy: 255 },
  'legs-back-knee': { cx: 80, cy: 300 },
  'legs-back-calf': { cx: 80, cy: 340 },
  'legs-back-ankle': { cx: 80, cy: 375 },
  'legs-back-foot': { cx: 80, cy: 400 },
};

/**
 * Close-up layout: vertical stack of labeled targets per region × side.
 * Arms use left (front) / right (back) columns so both sides stay readable.
 */
const CLOSE_UP_LAYOUT: Readonly<
  Record<Region, Partial<Record<Side, readonly { slug: string; cx: number; cy: number }[]>>>
> = {
  head: {
    front: [
      { slug: 'skull', cx: 100, cy: 60 },
      { slug: 'jaw', cx: 100, cy: 140 },
      { slug: 'neck', cx: 100, cy: 220 },
    ],
    back: [
      { slug: 'skull', cx: 100, cy: 90 },
      { slug: 'neck', cx: 100, cy: 200 },
    ],
  },
  torso: {
    front: [
      { slug: 'collarbone', cx: 100, cy: 50 },
      { slug: 'chest', cx: 100, cy: 110 },
      { slug: 'ribs', cx: 100, cy: 175 },
      { slug: 'abdomen', cx: 100, cy: 245 },
    ],
    back: [
      { slug: 'upper-back', cx: 100, cy: 100 },
      { slug: 'lower-back', cx: 100, cy: 210 },
    ],
  },
  arms: {
    front: [
      { slug: 'shoulder', cx: 100, cy: 40 },
      { slug: 'upper-arm', cx: 100, cy: 90 },
      { slug: 'elbow', cx: 100, cy: 140 },
      { slug: 'forearm', cx: 100, cy: 190 },
      { slug: 'wrist', cx: 100, cy: 240 },
      { slug: 'hand', cx: 100, cy: 290 },
    ],
    back: [
      { slug: 'shoulder', cx: 100, cy: 40 },
      { slug: 'upper-arm', cx: 100, cy: 90 },
      { slug: 'elbow', cx: 100, cy: 140 },
      { slug: 'forearm', cx: 100, cy: 190 },
      { slug: 'wrist', cx: 100, cy: 240 },
      { slug: 'hand', cx: 100, cy: 290 },
    ],
  },
  legs: {
    front: [
      { slug: 'hip', cx: 100, cy: 40 },
      { slug: 'thigh', cx: 100, cy: 90 },
      { slug: 'knee', cx: 100, cy: 140 },
      { slug: 'shin', cx: 100, cy: 190 },
      { slug: 'ankle', cx: 100, cy: 240 },
      { slug: 'foot', cx: 100, cy: 290 },
    ],
    back: [
      { slug: 'glute', cx: 100, cy: 40 },
      { slug: 'hamstring', cx: 100, cy: 90 },
      { slug: 'knee', cx: 100, cy: 140 },
      { slug: 'calf', cx: 100, cy: 190 },
      { slug: 'ankle', cx: 100, cy: 240 },
      { slug: 'foot', cx: 100, cy: 290 },
    ],
  },
};

export function overviewRegionPaths(side: Side): RegionPath[] {
  return [...(side === 'front' ? FRONT_REGION_PATHS : BACK_REGION_PATHS)];
}

export function overviewMarkerPoints(side: Side): MarkerPoint[] {
  return LANDMARKS.filter((landmark) => landmark.side === side).map((landmark) => {
    const point = OVERVIEW_MARKERS[landmark.id];
    if (point == null) {
      throw new Error(`Missing overview marker for landmark "${landmark.id}"`);
    }
    return { landmarkId: landmark.id, cx: point.cx, cy: point.cy };
  });
}

export function closeUpTargets(region: Region, side: Side): CloseUpTarget[] {
  const layout = CLOSE_UP_LAYOUT[region][side];
  if (layout == null) {
    throw new Error(`Missing close-up layout for ${region} · ${side}`);
  }

  const expected = LANDMARKS.filter(
    (landmark) => landmark.region === region && landmark.side === side,
  );

  const targets = layout.map((entry) => {
    const landmarkId = `${region}-${side}-${entry.slug}`;
    const landmark = expected.find((row) => row.id === landmarkId);
    if (landmark == null) {
      throw new Error(`Close-up layout has unknown landmark "${landmarkId}"`);
    }
    return {
      landmarkId,
      cx: entry.cx,
      cy: entry.cy,
      r: CLOSE_UP_RADIUS,
      label: landmark.name,
    };
  });

  if (targets.length !== expected.length) {
    throw new Error(
      `Close-up layout for ${region} · ${side} has ${targets.length} targets, catalog has ${expected.length}`,
    );
  }

  return targets;
}
