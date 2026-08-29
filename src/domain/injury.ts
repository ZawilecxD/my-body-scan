import type { Limb } from '@/domain/landmarks';

export type Injury = {
  id: number;
  landmarkId: string;
  description: string;
  status: 'open';
  createdAt: string;
  limb: Limb | null;
};
