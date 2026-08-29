import type { Limb } from '@/domain/landmarks';

export type InjuryStatus = 'open' | 'archived';

export type Injury = {
  id: number;
  landmarkId: string;
  description: string;
  status: InjuryStatus;
  createdAt: string;
  archivedAt: string | null;
  limb: Limb | null;
};

export type Comment = {
  id: number;
  injuryId: number;
  body: string;
  createdAt: string;
};

export type Solution = {
  id: number;
  injuryId: number;
  body: string;
  url: string | null;
  createdAt: string;
  removedAt: string | null;
};

export type InjuryEventType =
  | 'created'
  | 'archived'
  | 'reopened'
  | 'solution_added'
  | 'solution_removed';

export type InjuryEvent = {
  id: number;
  injuryId: number;
  type: InjuryEventType;
  solutionId: number | null;
  createdAt: string;
};
