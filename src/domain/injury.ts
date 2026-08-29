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
};
